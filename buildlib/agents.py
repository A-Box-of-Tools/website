"""Publish browser-use instructions and the public catalogue's real protocol cards.

ARD and its AI Catalog compatibility document share entries for the skill and
the separate public catalogue's MCP and A2A interfaces. The skill index
identifies only instructions this build writes, so its digest never depends on a remote fetch
or a hand-kept value that can fall behind the instructions it identifies.

`routes` is the other half: the addresses the skill and /llms.txt both hand an
agent, for this site's own skill and for the publisher's local adapter, worked
out once so the two files cannot name different places.
"""

import hashlib
import json
import re
from urllib.parse import quote, urlsplit

from buildlib.emit import write
from buildlib.site import ConfigError


SKILL_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
SKILL_NAME = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
DNS_LABEL = re.compile(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?')
# An owner and a repository as GitHub spells them, and nothing after: no
# trailing slash, `.git`, branch or query, any of which would also be carried
# into the two addresses derived from this one.
GITHUB_REPOSITORY = re.compile(
    r'https://github\.com/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)'
    r'/([A-Za-z0-9_](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9_])?)')
REGISTRY_SERVER = re.compile(r'[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?')


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


def _a2a_entry(agent, domain):
    a2a = agent.get('a2a')
    if not isinstance(a2a, dict):
        raise ConfigError('config/site.toml: agents.a2a must describe the public catalogue agent card')
    # The MCP entry has already checked the shared site's public host. Both
    # protocol cards are served by that same separate catalogue service.
    host = f'mcp.{domain.hostname}'
    agent_card = _line(a2a.get('agent_card'), 'agents.a2a.agent_card')
    expected = f'https://{host}/.well-known/agent-card.json'
    if agent_card != expected:
        raise ConfigError(f'config/site.toml: agents.a2a.agent_card must be the canonical HTTPS card {expected}')
    return {
        'identifier': f'urn:air:{host}:a2a:catalogue',
        'displayName': _line(a2a.get('display_name'), 'agents.a2a.display_name'),
        'type': 'application/a2a-agent-card+json',
        'url': agent_card,
        'description': _line(a2a.get('description'), 'agents.a2a.description', 1024),
        'representativeQueries': _queries(a2a.get('representative_queries'),
                                         'agents.a2a.representative_queries'),
        'trustManifest': {
            'identity': f'https://{host}/',
            'identityType': 'https',
        },
    }


def _skill_name(agent):
    name = agent['name']
    if (not isinstance(name, str) or not 1 <= len(name) <= 64
            or SKILL_NAME.fullmatch(name) is None):
        raise ConfigError('config/site.toml: agents.name must use 1-64 lowercase '
                         'letters, digits and single hyphens')
    return name


def _origin(site):
    domain = urlsplit(site['domain'])
    if (domain.scheme != 'https' or not domain.hostname
            or '.' not in domain.hostname or domain.username is not None
            or re.fullmatch(r'[a-zA-Z0-9.-]+', domain.hostname) is None
            or domain.password is not None or domain.path not in ('', '/')
            or domain.query or domain.fragment):
        raise ConfigError('config/site.toml: domain must be an HTTPS site origin '
                         'for well-known agent discovery')
    return domain


def _adapter(agent, site):
    """Where the publisher's local adapter is kept, from the three facts in the config.

    The adapter is another repository with releases of its own, so the site
    holds where it is and never its version, its count of operations or a copy
    of its instructions: each would be right on the day it was typed and wrong
    after the adapter's next tag. Its registry record and its skills.sh listing
    are that one repository under two other naming schemes, which is why they
    are worked out here rather than written beside it - three hand-kept
    addresses for one thing is two that get left behind when it moves.

    The owner has to be the organisation the site's own source lives in. A
    link from these files is the site saying "this is ours", and a mistyped
    owner would say it about a stranger's code. The registry name is held to
    the same owner for the same reason: `io.github.<owner>/` is the namespace
    the registry gives a GitHub organisation, and nobody else can publish
    under it.
    """
    adapter = agent.get('adapter')
    if not isinstance(adapter, dict):
        raise ConfigError('config/site.toml: agents.adapter must describe the local adapter')
    name = _line(adapter.get('name'), 'agents.adapter.name')
    repository = GITHUB_REPOSITORY.fullmatch(
        _line(adapter.get('repository'), 'agents.adapter.repository'))
    source = GITHUB_REPOSITORY.fullmatch(site.get('source_url') or '')
    if (repository is None or source is None or repository[2].endswith('.git')
            or repository[1] != source[1]):
        raise ConfigError('config/site.toml: agents.adapter.repository must be a GitHub '
                         'repository of the organisation source_url names, written '
                         'https://github.com/<owner>/<repository>')
    owner, repo = repository.groups()
    registry_name = _line(adapter.get('registry_name'), 'agents.adapter.registry_name')
    namespace = f'io.github.{owner}/'
    if (not registry_name.startswith(namespace)
            or REGISTRY_SERVER.fullmatch(registry_name[len(namespace):]) is None):
        raise ConfigError('config/site.toml: agents.adapter.registry_name must be a '
                         f'server in the {namespace} namespace')
    skill = adapter.get('skill')
    if (not isinstance(skill, str) or not 1 <= len(skill) <= 64
            or SKILL_NAME.fullmatch(skill) is None):
        raise ConfigError('config/site.toml: agents.adapter.skill must use 1-64 lowercase '
                         'letters, digits and single hyphens')
    return {
        'name': name,
        'repository': repository[0],
        'registry_name': registry_name,
        # `latest` rather than a version, so the link names whatever the
        # adapter last published without this file knowing which that is.
        'registry_url': ('https://registry.modelcontextprotocol.io/v0.1/servers/'
                         f'{quote(registry_name, safe="")}/versions/latest'),
        'skill': skill,
        # skills.sh lower-cases an owner and a repository in its addresses and
        # the installer takes them as GitHub writes them.
        'skill_listing': f'https://www.skills.sh/{owner.lower()}/{repo.lower()}/{skill}',
        'skill_install': f'npx skills add {owner}/{repo} --skill {skill}',
    }


def routes(site):
    """The addresses an agent is handed, for the skill and for /llms.txt alike.

    Two of them are this site's: the skill the build writes, and the command
    that installs it. The command needs nothing but the origin, because the
    installer reads /.well-known/agent-skills/index.json itself and that index
    is written a few lines below. The rest belong to the local adapter.
    """
    agent = site['agents']
    name = _skill_name(agent)
    domain = _origin(site)
    origin = f'{domain.scheme}://{domain.netloc}'
    return {
        'skill': {
            'path': f'.well-known/agent-skills/{name}/SKILL.md',
            'url': f'{origin}/.well-known/agent-skills/{name}/SKILL.md',
            'install': f'npx skills add {origin}',
        },
        'adapter': _adapter(agent, site),
    }


def build_discovery(out, templates, site):
    """Write a skill and its discovery documents; return relative paths.

    The template receives JSON-quoted YAML scalars for its frontmatter. YAML's
    quoted strings accept this spelling, including punctuation that would
    otherwise turn a description into another YAML key or a comment.
    """
    agent = site['agents']
    name = _skill_name(agent)
    display_name = _line(agent['display_name'], 'agents.display_name')
    description = _line(agent['description'], 'agents.description', 1024)
    queries = _queries(agent['representative_queries'], 'agents.representative_queries')

    domain = _origin(site)
    mcp_entry = _mcp_entry(agent, domain)
    a2a_entry = _a2a_entry(agent, domain)
    # Before the first file is written, like every other check here: a skill
    # that names an adapter the config cannot place should not be published.
    handed = routes(site)

    skill_path = handed['skill']['path']
    ard_path = '.well-known/ard.json'
    catalog_path = '.well-known/ai-catalog.json'
    index_path = '.well-known/agent-skills/index.json'
    skill_url = handed['skill']['url']
    skill_file = out / skill_path
    skill_file.parent.mkdir(parents=True, exist_ok=True)
    skill_text = templates.render('agent-skill.md', {
        'site': site,
        'routes': handed,
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
    }, mcp_entry, a2a_entry]
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
