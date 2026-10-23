"""Publish the site's browser-use instructions without inventing a remote API.

ARD describes the skill, and the well-known skill index makes that same file
discoverable to clients that understand Agent Skills. Both point to the bytes
this build writes, so publishing instructions never depends on a remote fetch
or a hand-kept digest that can fall behind the instructions it identifies.
"""

import hashlib
import json
import re
from urllib.parse import urlsplit

from buildlib.emit import write
from buildlib.site import ConfigError


SKILL_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
SKILL_NAME = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')


def _line(value, key, limit=None):
    if not isinstance(value, str) or not value.strip() or value != value.strip():
        raise ConfigError(f'config/site.toml: {key} must be nonempty plain text')
    if (len(value.splitlines()) != 1
            or any(ord(char) < 32 or 127 <= ord(char) <= 159 for char in value)):
        raise ConfigError(f'config/site.toml: {key} must be a single line')
    if limit is not None and len(value) > limit:
        raise ConfigError(f'config/site.toml: {key} must be at most {limit} characters')
    return value


def build_discovery(out, templates, site):
    """Write a skill and its two discovery documents; return relative paths.

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
    queries = agent['representative_queries']
    if not isinstance(queries, list) or not 2 <= len(queries) <= 5:
        raise ConfigError('config/site.toml: agents.representative_queries '
                         'must contain 2-5 queries')
    for query in queries:
        _line(query, 'agents.representative_queries')

    domain = urlsplit(site['domain'])
    if (domain.scheme != 'https' or not domain.hostname
            or '.' not in domain.hostname or domain.username is not None
            or re.fullmatch(r'[a-zA-Z0-9.-]+', domain.hostname) is None
            or domain.password is not None or domain.path not in ('', '/')
            or domain.query or domain.fragment):
        raise ConfigError('config/site.toml: domain must be an HTTPS site origin '
                         'for well-known agent discovery')

    skill_path = f'.well-known/agent-skills/{name}/SKILL.md'
    ard_path = '.well-known/ard.json'
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

    documents = {
        ard_path: {'entries': [{
            'identifier': f'urn:air:{domain.hostname}:skill:{name}',
            'displayName': display_name,
            'type': 'application/agent-skills+md',
            'url': skill_url,
            'description': description,
            'representativeQueries': list(queries),
        }]},
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
    return [skill_path, ard_path, index_path]
