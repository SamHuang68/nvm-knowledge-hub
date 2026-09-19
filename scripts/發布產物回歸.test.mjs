import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { verifyArtifact } from './驗證發布產物.mjs';

test('發布產物保留下載附件，拒絕遺漏、修改及未追蹤內容', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'nvm-pages-'));
  const repository = path.join(temporary, '來源');
  const artifact = path.join(temporary, '產物');
  fs.mkdirSync(repository); fs.mkdirSync(artifact);
  const git = (...args) => execFileSync('git', args, { cwd: repository, stdio: 'pipe' });
  try {
    git('init', '--quiet');
    git('config', 'user.name', '發布驗證');
    git('config', 'user.email', 'release-check@example.invalid');
    git('config', 'core.autocrlf', 'false');
    for (const [file, content] of [['index.html', '<p>網站</p>\n'], ['附件.pptx', Buffer.from([0, 255, 12])], ['.gitignore', '測試用隱藏檔']]) {
      fs.writeFileSync(path.join(repository, file), content);
      fs.writeFileSync(path.join(artifact, file), content);
    }
    git('add', '--', 'index.html', '附件.pptx', '.gitignore');
    git('commit', '--quiet', '-m', '建立發布驗證案例');
    assert.equal(verifyArtifact(repository, artifact), 2);
    fs.writeFileSync(path.join(artifact, '額外.txt'), '執行期資料');
    assert.throws(() => verifyArtifact(repository, artifact), /未追蹤/u);
    fs.unlinkSync(path.join(artifact, '額外.txt'));
    fs.writeFileSync(path.join(artifact, 'index.html'), '<p>不同版本</p>\n');
    assert.throws(() => verifyArtifact(repository, artifact), /位元組/u);
    fs.copyFileSync(path.join(repository, 'index.html'), path.join(artifact, 'index.html'));
    fs.unlinkSync(path.join(artifact, '附件.pptx'));
    assert.throws(() => verifyArtifact(repository, artifact), /遺漏/u);
    fs.copyFileSync(path.join(repository, '附件.pptx'), path.join(artifact, '附件.pptx'));
    fs.writeFileSync(path.join(repository, '.env'), '不可發布的測試資料');
    git('add', '--', '.env');
    git('commit', '--quiet', '-m', '模擬誤追蹤本機設定');
    assert.throws(() => verifyArtifact(repository, artifact), /禁止發布/u);
    git('rm', '--', '.env');
    fs.mkdirSync(path.join(repository, 'qa'));
    fs.writeFileSync(path.join(repository, 'qa', '證據.json'), '{}');
    git('add', '--', 'qa/證據.json');
    git('commit', '--quiet', '-m', '模擬誤追蹤驗證資料');
    assert.throws(() => verifyArtifact(repository, artifact), /禁止發布/u);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
