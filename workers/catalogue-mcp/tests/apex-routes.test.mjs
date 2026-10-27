import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

function configuration(name) {
  // The service builder already requires Python 3.11+. Use its TOML parser so
  // this boundary check follows configuration values rather than formatting.
  const source = 'import json, pathlib, sys, tomllib; '
    + 'print(json.dumps(tomllib.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))))';
  return JSON.parse(execFileSync('python', ['-c', source,
    fileURLToPath(new URL('../' + name, import.meta.url))], { encoding: 'utf8' }));
}

test('production exposes only the two exact apex discovery routes while development stays separate', () => {
  const production = configuration('wrangler.production.toml');
  const development = configuration('wrangler.toml');
  assert.deepEqual(production.routes, [
    { pattern: 'mcp.abox.tools', custom_domain: true },
    { pattern: 'abox.tools/.well-known/agent-card.json', zone_name: 'abox.tools' },
    { pattern: 'abox.tools/.well-known/mcp/server-card.json', zone_name: 'abox.tools' }
  ]);
  assert.deepEqual(JSON.parse(production.vars.ALLOWED_HOSTS), ['mcp.abox.tools', 'abox.tools']);
  assert.deepEqual(development.routes, [{ pattern: 'mcp-dev.abox.tools', custom_domain: true }]);
  assert.ok(!JSON.parse(development.vars.ALLOWED_HOSTS).includes('abox.tools'));
  assert.equal(production.ratelimits[0].namespace_id, '1003');
  assert.equal(development.ratelimits[0].namespace_id, '1004');
});
