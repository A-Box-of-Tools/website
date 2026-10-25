"""Publish browser-use instructions and the public catalogue's real server card.

ARD and its AI Catalog compatibility document share entries for the skill and
the separate, public-keyword MCP catalogue. The skill index identifies only
instructions this build writes, so its digest never depends on a remote fetch
or a hand-kept value that can fall behind the instructions it identifies.
"""

import hashlib
import json
import re
from urllib.parse import urlsplit

from buildlib.emit import write
from buildlib.site import ConfigError


SKILL_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
SKILL_NAME = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
DNS_LABEL = re.compile(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?')


def _line(value, key, limit=None):
    if not isinstance(value, str) or not value.strip() or value != value.strip():
        raise ConfigError(f'config/site.toml: {key} must be nonempty plain text')
    if (len(value.splitlines()) != 1
            or any(ord(char) < 32 or 127 <= ord(char) <= 159 for char in value)):
        raise ConfigError(f'config/site.toml: {key} must be a single line')
    if limit is not None and len(value) > limit:
        raise ConfigError(f'config/site.toml: {key} must be at most {limit} characters')
    return value


def _queries(value, key):
    if not isinstance(value, list) or not 2 <= len(value) <= 5:
        raise ConfigError(f'config/site.toml: {key} must contain 2-5 queries')
    return [_line(query, key) for query in value]


def _mcp_entry(agent, domain):
    mcp = agent.get('mcp')
    if not isinstance(mcp, dict):
        raise ConfigError('config/site.toml: agents.mcp must describe the public catalogue server card')
    hostname = domain.hostname
    labels = hostname.split('.')
    if (domain.netloc != hostname or len(hostname) > 249
            or any(DNS_LABEL.fullmatch(label) is None for label in labels)
            or labels[-1].isdigit()
            or labels[-1] in ('localhost', 'local', 'internal', 'invalid', 'test', 'example', 'onion')):
        raise ConfigError('config/site.toml: agents.mcp requires a canonical public HTTPS site domain')
    mcp_host = f'mcp.{hostname}'
    server_card = _line(mcp.get('server_card'), 'agents.mcp.server_card')
    expected = f'https://{mcp_host}/mcp/server-card'
    if server_card != expected:
        raise ConfigError(f'config/site.toml: agents.mcp.server_card must be the canonical HTTPS card {expected}')
    return {
        'identifier': f'urn:air:{mcp_host}:mcp:catalogue',
        'displayName': _line(mcp.get('display_name'), 'agents.mcp.display_name'),
        'type': 'application/mcp-server-card+json',
        'url': server_card,
        'description': _line(mcp.get('description'), 'agents.mcp.description', 1024),
        'representativeQueries': _queries(mcp.get('representative_queries'),
                                         'agents.mcp.representative_queries'),
        'trustManifest': {
            'identity': f'https://{mcp_host}/',
            'identityType': 'https',
        },
    }


def build_discovery(out, templates, site):
    """Write a skill and its discovery documents; return relative paths.

    The template receives JSON-quoted YAML scalars for its frontmatter. YAML's
    quoted strings accept this spelling, including punctuation that would
    otherwise turn a description into another YAML key or a comment.
    """
    agent = site['agents']
    name = agent['name']
    if (not isinstance(name, str) or not 1 <= len(name) <= 64
            or SKILL_NAME.fullmatch(name) is None):
        raise ConfigError('config/site.toml: agents.name must use 1-64 lowercase '
                         'letters, digits and single hyphens')
    display_name = _line(agent['display_name'], 'agents.display_name')
    description = _line(agent['description'], 'agents.description', 1024)
    queries = _queries(agent['representative_queries'], 'agents.representative_queries')

    domain = urlsplit(site['domain'])
    if (domain.scheme != 'https' or not domain.hostname
            or '.' not in domain.hostname or domain.username is not None
            or re.fullmatch(r'[a-zA-Z0-9.-]+', domain.hostname) is None
            or domain.password is not None or domain.path not in ('', '/')
            or domain.query or domain.fragment):
        raise ConfigError('config/site.toml: domain must be an HTTPS site origin '
                         'for well-known agent discovery')
    mcp_entry = _mcp_entry(agent, domain)

    skill_path = f'.well-known/agent-skills/{name}/SKILL.md'
    ard_path = '.well-known/ard.json'
    catalog_path = '.well-known/ai-catalog.json'
    index_path = '.well-known/agent-skills/index.json'
    skill_url = f'{domain.scheme}://{domain.netloc}/{skill_path}'
    skill_file = out / skill_path
    skill_file.parent.mkdir(parents=True, exist_ok=True)
    skill_text = templates.render('agent-skill.md', {
        'site': site,
        'agent_frontmatter': {
            'name': json.dumps(name, ensure_ascii=False),
            'description': json.dumps(description, ensure_ascii=False),
        },
    }).replace('\r\n', '\n').replace('\r', '\n')
    emitted = write(skill_file, skill_text)
    digest = 'sha256:' + hashlib.sha256(emitted.encode('utf-8')).hexdigest()

    entries = [{
        'identifier': f'urn:air:{domain.hostname}:skill:{name}',
        'displayName': display_name,
        'type': 'application/agent-skills+md',
        'url': skill_url,
        'description': description,
        'representativeQueries': list(queries),
        # This binds the declared publisher to the identifier's HTTPS
        # domain. It makes no signature or independent attestation claim.
        'trustManifest': {
            'identity': f'{domain.scheme}://{domain.netloc}/',
            'identityType': 'https',
        },
    }, mcp_entry]
    documents = {
        ard_path: {'entries': entries},
        catalog_path: {'specVersion': '1.0', 'entries': entries},
        index_path: {
            '$schema': SKILL_SCHEMA,
            'skills': [{
                'name': name,
                'type': 'skill-md',
                'description': description,
                'url': skill_url,
                'digest': digest,
            }],
        },
    }
    for relative, document in documents.items():
        write(out / relative, json.dumps(document, ensure_ascii=False, indent=2))
    return [skill_path, ard_path, catalog_path, index_path]
