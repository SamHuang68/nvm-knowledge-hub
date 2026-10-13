import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/u,'').replaceAll('\r\n','\n');
const base='3ca524ab2baa932f5dcfb0356d4ef43230f8d414';
const original=file=>execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replaceAll('\r\n','\n');
const pkg=JSON.parse(read('package.json')), lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'1.4.0'); assert.equal(lock.version,pkg.version); assert.equal(lock.packages[''].version,pkg.version);
assert.deepEqual(pkg.devDependencies,JSON.parse(original('package.json')).devDependencies,'既有依賴不變');
for (const suffix of ['','-en']) assert.equal(read(`data/nvm-vendor-patent-maps${suffix}.json`),original(`data/nvm-vendor-patent-maps${suffix}.json`),'原始技術與研究資料完整保留');
function withoutMap(html) {
  const start=html.indexOf('<article id="patent-maps"'); assert.ok(start>=0);
  const tags=html.slice(start).matchAll(/<\/?article\b[^>]*>/gu);
  let depth=0;
  for (const tag of tags) {
    depth+=tag[0].startsWith('</')?-1:1;
    if (!depth) return html.slice(0,start)+html.slice(start+tag.index+tag[0].length);
  }
  throw new Error('專利地圖 article 邊界不完整');
}
for (const file of ['nvm-technology-atlas.html','nvm-technology-atlas-zh.html']) {
  const before=withoutMap(original(file));
  const after=withoutMap(read(file)).replace('nvm-vendor-patent-maps.css?v=20261013-map1','nvm-vendor-patent-maps.css?v=20261012-r1');
  assert.equal(after,before,'其他 Atlas 章節與入口未被重寫');
}
const sandbox={self:{}}; vm.runInNewContext(read('data/offline-manifest.js'),sandbox);
for (const file of ['nvm-technology-atlas.html','nvm-technology-atlas-zh.html','nvm-technology-atlas.js','nvm-vendor-patent-maps.css']) {
  assert.equal(sandbox.self.NVMOfflineManifest.digests[file],crypto.createHash('sha256').update(read(file)).digest('hex'),`離線資源同步：${file}`);
}
const policy=JSON.parse(read('data/public-release-policy.json'));
const originalPolicy=JSON.parse(original('data/public-release-policy.json'));
for (const key of ['allowedClassifications','blockedClassifications','blockedAttachmentExtensions','allowedAttachmentExceptions','attachmentExceptionEvidence']) assert.deepEqual(policy[key],originalPolicy[key],'公開資料／附件限制未降低');
for (const item of policy.localizedSourcePathExceptions) assert.ok(item.basis && fs.statSync(path.join(root,item.path)).isFile(),'來源路徑例外均有實體檔與說明');
console.log('專利地圖產物核對通過：版本一致、原始資料保留、其他章節不變、四項離線資源同步與公開範圍保持。');
execFileSync(process.execPath,['scripts/build-release-lineage.mjs','--check'],{cwd:root,stdio:'inherit'});
