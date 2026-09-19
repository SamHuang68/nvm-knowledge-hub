import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// 沿用既有 .nojekyll 的公開檔案集合，保留附件與所有非隱藏的已追蹤檔案。
// Git archive 僅包含提交內容；上傳 Action 預設排除隱藏檔案與目錄。
export const isPublicPath = file => !file.split('/').some(part => part.startsWith('.'));
const publicDirectories = new Set(['assets', 'briefing', 'data', 'docs', 'scripts', 'tests', 'tools', 'whitepaper']);
function assertPublicScope(file) {
  const parts = file.split('/');
  assert.ok(!parts.some(part => /^(?:qa|node_modules|cache|__pycache__|\.env(?:\..*)?)$/iu.test(part)) && !/\.local$/iu.test(file), `禁止發布執行期或本機檔案：${file}`);
  if (!isPublicPath(file)) return;
  assert.ok(parts.length === 1 || publicDirectories.has(parts[0]), `新增公開目錄必須先更新範圍契約：${file}`);
}
export function verifyArtifact(repository, directory) {
  const tree = execFileSync('git', ['ls-tree', '-r', '-z', 'HEAD'], { cwd: repository, encoding: 'utf8' });
  const expected = new Map();
  for (const row of tree.split('\0').filter(Boolean)) {
    const match = row.match(/^(\d+) (\w+) ([0-9a-f]{40})\t(.+)$/u);
    assert.ok(match, 'Git 來源紀錄格式無效');
    const [, mode, type, hash, file] = match;
    assertPublicScope(file);
    if (!isPublicPath(file)) continue;
    assert.ok(type === 'blob' && ['100644', '100755'].includes(mode), `發布內容不得包含連結或子模組：${file}`);
    expected.set(file, hash);
  }
  const actual = [];
  function visit(folder, prefix = '') {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = prefix + entry.name;
      assertPublicScope(file);
      if (!isPublicPath(file)) continue;
      assert.ok(!entry.isSymbolicLink(), `發布內容不得包含連結：${file}`);
      if (entry.isDirectory()) visit(path.join(folder, entry.name), file + '/');
      else {
        assert.ok(entry.isFile(), `發布內容必須是一般檔案：${file}`);
        actual.push(file);
      }
    }
  }
  visit(directory);
  assert.deepEqual(actual.sort(), [...expected.keys()].sort(), '發布產物不得遺漏、增加或包含未追蹤檔案');
  for (const [file, expectedHash] of expected) {
    const bytes = fs.readFileSync(path.join(directory, file));
    // archive 會套用 Git 換行屬性；例如 SharePoint CSV 明定 CRLF。
    // 從相同 blob 套用相同屬性取得預期位元組，不自行放寬或移除換行。
    const exported = execFileSync('git', ['cat-file', '--filters', `--path=${file}`, expectedHash], {
      cwd: repository, maxBuffer: 128 * 1024 * 1024,
    });
    const digest = content => crypto.createHash('sha256').update(content).digest('hex');
    assert.equal(digest(bytes), digest(exported), `發布產物必須與提交依 Git 屬性匯出的位元組完全相同：${file}`);
  }
  return expected.size;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  assert.ok(process.argv[2], '請指定待驗證的發布產物目錄');
  const count = verifyArtifact(path.resolve(import.meta.dirname, '..'), path.resolve(process.argv[2]));
  console.log(`通過：${count} 個公開檔案與本次提交依 Git 屬性匯出的位元組一致，隱藏維護檔由上傳流程排除。`);
}
