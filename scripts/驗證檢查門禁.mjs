import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadPublicRoutes, assertDeclaredHtml } from './公開路由.mjs';

const root = path.resolve(import.meta.dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'nvm-gates-'));
const checks = [];
const check = (label, run) => { run(); checks.push({ label, passed: true }); };
const run = (command, args, cwd = temporary) => spawnSync(command, args, { cwd, encoding: 'utf8' });
const git = (...args) => {
  const result = run('git', args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};
try {
  fs.writeFileSync(path.join(temporary, '正確.mjs'), 'const value = 1;\n');
  fs.writeFileSync(path.join(temporary, '錯誤.mjs'), 'const value = ;\n');
  const checker = path.join(root, 'scripts/檢查程式語法.mjs');
  check('第一檔有效但第二檔語法錯誤時，逐檔門禁必須失敗', () => {
    const result = run(process.execPath, [checker, '正確.mjs', '錯誤.mjs']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /錯誤\.mjs/u);
    assert.match(result.stdout, /2 個 JavaScript 檔案，1 個失敗/u);
  });
  check('全部檔案有效時，逐檔門禁通過', () => {
    assert.equal(run(process.execPath, [checker, '正確.mjs']).status, 0);
  });

  fs.mkdirSync(path.join(temporary, 'data'));
  fs.mkdirSync(path.join(temporary, 'briefing'));
  const routePath = path.join(temporary, 'data/公開路由.json');
  const fragmentPath = path.join(temporary, 'briefing/header.html');
  const routes = { schemaVersion: '1.0', pages: ['index.html'], fragments: [{ path: 'briefing/header.html', ownerPage: 'index.html', description: '驗證片段分類' }] };
  fs.writeFileSync(routePath, JSON.stringify(routes));
  fs.writeFileSync(path.join(temporary, 'index.html'), '<!doctype html><html><body>完整頁面</body></html>');
  fs.writeFileSync(fragmentPath, '<main>保留片段</main>');
  check('明列片段保留內容且不列為完整頁面', () => {
    const actual = loadPublicRoutes(temporary);
    assert.equal(actual.pages.size, 1);
    assert.equal(actual.fragments.size, 1);
    assertDeclaredHtml(actual, 'briefing/header.html');
  });
  check('未宣告 HTML 不能避過頁面契約', () => {
    assert.throws(() => assertDeclaredHtml(loadPublicRoutes(temporary), 'unlisted.html'), /未宣告/u);
  });
  check('完整文件不能偽裝成片段以避過治理屬性', () => {
    fs.writeFileSync(fragmentPath, '<html><body>偽裝片段</body></html>');
    assert.throws(() => loadPublicRoutes(temporary), /不得宣告完整文件外框/u);
    fs.writeFileSync(fragmentPath, '<main>保留片段</main>');
  });
  check('重複路徑及離開根目錄的路徑均拒絕', () => {
    fs.writeFileSync(routePath, JSON.stringify({ ...routes, pages: ['index.html', 'index.html'] }));
    assert.throws(() => loadPublicRoutes(temporary), /重複路徑/u);
    fs.writeFileSync(routePath, JSON.stringify({ ...routes, pages: ['../outside.html'] }));
    assert.throws(() => loadPublicRoutes(temporary), /路徑無效/u);
    fs.writeFileSync(routePath, JSON.stringify(routes));
  });

  fs.mkdirSync(path.join(temporary, 'scripts'));
  const lineageScript = path.join(temporary, 'scripts/build-release-lineage.mjs');
  fs.copyFileSync(path.join(root, 'scripts/build-release-lineage.mjs'), lineageScript);
  fs.writeFileSync(path.join(temporary, 'data/institutional-pov-contract.json'), '{}\n');
  fs.writeFileSync(path.join(temporary, 'data/public-release-policy.json'), '{}\n');
  git('init', '--quiet');
  git('config', 'user.name', '本機驗證');
  git('config', 'user.email', 'local-check@example.invalid');
  git('add', '--', '正確.mjs', '錯誤.mjs', 'index.html', 'briefing/header.html', 'data/公開路由.json', 'data/institutional-pov-contract.json', 'data/public-release-policy.json', 'scripts/build-release-lineage.mjs');
  git('commit', '--quiet', '-m', '建立門禁測試內容');
  check('乾淨內容提交產生本機紀錄，不宣告部署授權', () => {
    const result = run(process.execPath, [lineageScript, '--write']);
    assert.equal(result.status, 0, result.stderr);
    const lineage = JSON.parse(fs.readFileSync(path.join(temporary, 'data/release-lineage.json'), 'utf8'));
    assert.equal(lineage.status, 'LOCAL_VALIDATED');
    assert.match(lineage.releaseAuthorization, /不代表推送或部署授權/u);
    assert.equal(lineage.canonicalCommit, git('rev-parse', 'HEAD'));
  });
  git('add', '--', 'data/release-lineage.json');
  git('commit', '--quiet', '-m', '記錄本機來源');
  check('獨立紀錄提交後，來源集合仍與內容提交一致', () => {
    const result = run(process.execPath, [lineageScript, '--check']);
    assert.equal(result.status, 0, result.stderr);
  });
  check('來源符合時，既有 RELEASED 格式仍可驗證', () => {
    const manifestPath = path.join(temporary, 'data/release-lineage.json');
    const original = fs.readFileSync(manifestPath, 'utf8');
    fs.writeFileSync(manifestPath, JSON.stringify({ ...JSON.parse(original), status: 'RELEASED' }) + '\n');
    assert.equal(run(process.execPath, [lineageScript, '--check']).status, 0);
    fs.writeFileSync(manifestPath, original);
  });
  fs.appendFileSync(path.join(temporary, '正確.mjs'), 'const changed = true;\n');
  check('未提交的內容不允許產生來源紀錄', () => {
    assert.equal(run(process.execPath, [lineageScript, '--write']).status, 1);
  });
  git('add', '--', '正確.mjs');
  git('commit', '--quiet', '-m', '製造來源漂移');
  check('後續內容提交與舊紀錄不同時，驗證必須失敗', () => {
    const result = run(process.execPath, [lineageScript, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /目前提交的內容與發行來源紀錄不同/u);
  });
} finally {
  // 只清理本程序建立且已確認位於作業系統暫存目錄的測試庫。
  const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
  if (!path.resolve(temporary).startsWith(temporaryRoot)) throw new Error('測試清理路徑超出暫存目錄。');
  fs.rmSync(temporary, { recursive: true, force: true });
}

const report = { passed: true, checks: checks.length, results: checks };
if (process.env.NVM_QA_OUTPUT) {
  const output = path.resolve(process.env.NVM_QA_OUTPUT);
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, '檢查門禁驗證.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`通過：${checks.length} 項語法、路由與來源紀錄門禁驗證。`);
