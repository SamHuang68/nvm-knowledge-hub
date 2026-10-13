import {execFileSync} from 'node:child_process';
import {runRegression} from '../../scripts/verify-site-regression.mjs';

const run = (command, args) => execFileSync(command === 'npm' && process.platform === 'win32' ? 'npm.cmd' : command, args, {stdio: 'inherit', shell: command === 'npm' && process.platform === 'win32'});
if (!process.argv.includes('--regression-only')) {
  run('npm', ['run', 'check']);
  run('npm', ['run', 'build']);
  run('git', ['diff', '--exit-code']);
  if (execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {encoding: 'utf8'}).trim()) {
    throw new Error('重新建置產生未追蹤內容，拒絕視為同一提交。');
  }
}
await runRegression();
if (!process.argv.includes('--regression-only')) {
  run('npm', ['test', '--prefix', 'tools/whitepaper-studio']);
  run(process.execPath, ['--test', 'scripts/release-artifact-regression.test.mjs']);
}
