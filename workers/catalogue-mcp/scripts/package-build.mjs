import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run('python', ['prepare.py', ...process.argv.slice(2)]);
run(process.execPath, [path.join(root, 'scripts/build.mjs')]);
run(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
  'deploy', '--dry-run', '--outdir', 'build/worker']);
