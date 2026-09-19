import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/雙語修正部署/SharePoint跨平台'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'nvm-sharepoint-line-endings-'));
const results = [];
const note = (condition, description) => {
  results.push({ description, passed: Boolean(condition) });
  assert.ok(condition, description);
};
const normalize = value => value.replaceAll('\r\n', '\n');
const hash = value => crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
const run = (script, args = []) => spawnSync(process.execPath, [path.join(temporary, 'scripts', script), ...args], { cwd: temporary, encoding: 'utf8' });
const fixtures = [
  'scripts/build-oip-sharepoint.mjs', 'scripts/build-ai-nvm-sharepoint.mjs',
  'data/oip-secure-storage-knowledge.json', 'data/ai-nvm-opportunities-knowledge.json',
  'data/ai-nvm-opportunities-schema.json', 'data/institutional-pov-contract.json',
  'secure-storage.html', 'oip-secure-storage.html',
];

try {
  for (const file of fixtures) {
    const target = path.join(temporary, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, normalize(fs.readFileSync(path.join(root, file), 'utf8')));
  }
  for (const entry of [
    { name: 'OIP', script: 'build-oip-sharepoint.mjs', json: 'oip-secure-storage-knowledge.json', csv: ['oip-sharepoint-import.csv'], title: 'title' },
    { name: 'AI', script: 'build-ai-nvm-sharepoint.mjs', json: 'ai-nvm-opportunities-knowledge.json', csv: ['ai-nvm-sharepoint-import.csv', 'ai-nvm-research-intake.csv'], title: 'titleEn' },
  ]) {
    const sourcePath = path.join(temporary, 'data', entry.json);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const expectedHash = hash(source);
    let baseline;
    for (const ending of ['LF', 'CRLF']) {
      fs.writeFileSync(sourcePath, ending === 'LF' ? source : source.replaceAll('\n', '\r\n'));
      const generated = run(entry.script);
      note(generated.status === 0, `${entry.name} ${ending} 來源可產生 CSV：${generated.stderr.trim()}`);
      const actual = entry.csv.map(file => fs.readFileSync(path.join(temporary, 'data', file), 'utf8'));
      note(actual[0].includes(`"${expectedHash}"`), `${entry.name} ${ending} 來源譜系雜湊採 LF 位元組`);
      if (baseline) note(actual.every((value, index) => value === baseline[index]), `${entry.name} LF 與 CRLF 來源產出完全相同`);
      else baseline = actual;
      for (const file of entry.csv) {
        const target = path.join(temporary, 'data', file);
        fs.writeFileSync(target, normalize(fs.readFileSync(target, 'utf8')));
      }
      note(run(entry.script, ['--check']).status === 0, `${entry.name} ${ending} 來源可驗證 Git LF CSV`);
    }
    const changed = JSON.parse(source);
    changed.records[0][entry.title] += '!';
    fs.writeFileSync(sourcePath, JSON.stringify(changed, null, 2) + '\n');
    note(run(entry.script, ['--check']).status !== 0, `${entry.name} 來源內容改變時拒絕舊 CSV`);
    const changedExport = run(entry.script);
    note(changedExport.status === 0, `${entry.name} 內容變更後可產生新 CSV：${changedExport.stderr.trim()}`);
    const updated = fs.readFileSync(path.join(temporary, 'data', entry.csv[0]), 'utf8');
    const updatedHash = hash(fs.readFileSync(sourcePath, 'utf8'));
    note(updatedHash !== expectedHash && updated.includes(`"${updatedHash}"`) && !updated.includes(`"${expectedHash}"`), `${entry.name} 真正內容變更會更新來源雜湊`);
    fs.writeFileSync(path.join(temporary, 'data', entry.csv[0]), updated.replace('SchemaVersion', 'SchemaVersion反例'));
    note(run(entry.script, ['--check']).status !== 0, `${entry.name} 比對仍拒絕 CSV 欄位被修改`);
  }
} finally {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'SharePoint換行驗證.json'), JSON.stringify({ passed: results.every(item => item.passed), checks: results.length, results }, null, 2) + '\n');
  const resolved = path.resolve(temporary);
  const parent = path.resolve(os.tmpdir());
  if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith('nvm-sharepoint-line-endings-')) throw new Error('測試暫存目錄超出預期範圍');
  fs.rmSync(resolved, { recursive: true, force: true });
}
console.log(`通過：SharePoint 跨平台換行與內容反例 ${results.length} 項`);
