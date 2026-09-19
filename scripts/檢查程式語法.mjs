import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'qa', '.loop-engineering']);
function discover(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (excludedDirectories.has(entry.name)) return [];
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return discover(file);
    return entry.isFile() && /\.(?:m?js|cjs)$/iu.test(file) ? [file] : [];
  });
}

const requested = process.argv.slice(2);
const files = requested.length ? requested.map(file => path.resolve(process.cwd(), file)) : discover(root).sort();
let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', cwd: root });
  if (result.status !== 0 || result.error) {
    failed += 1;
    console.error(`語法檢查失敗：${path.relative(root, file)}\n${result.error?.message ?? result.stderr ?? '程序未正常結束。'}`);
  }
}
if (!files.length) {
  console.error('語法檢查失敗：找不到可檢查的 JavaScript 檔案。');
  process.exitCode = 1;
} else {
  console.log(`${failed ? '未通過' : '通過'}：逐檔檢查 ${files.length} 個 JavaScript 檔案，${failed} 個失敗。`);
  if (failed) process.exitCode = 1;
}
