import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/u,'').replaceAll('\r\n','\n');
const base='ce3333c6eb7dccb685fa98c395f335e6d8474254';
const original=file=>execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replaceAll('\r\n','\n');
const pkg=JSON.parse(read('package.json')), lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'1.5.5'); assert.equal(lock.version,pkg.version); assert.equal(lock.packages[''].version,pkg.version);
assert.deepEqual(pkg.devDependencies,JSON.parse(original('package.json')).devDependencies,'既有依賴不變');
for (const suffix of ['','-en']) {
  const file=`data/nvm-vendor-patent-maps${suffix}.json`;
  const actual=JSON.parse(read(file)),before=JSON.parse(original(file));
  const stats=actual.vendors.find(v=>v.id==='ememory').patentStats;
  assert.equal(stats.totalGrantedWorldwide,suffix?'1,370+ Patents Issued':'1,370+ 件核准專利');
  assert.equal(stats.grantedSource.date,'2026-08-19');assert.equal(stats.grantedSource.page,4);
  assert.equal(stats.grantedSource.url,'https://www.ememory.com.tw/Content/Upload/files/IR/eMemory%20Briefing_eng_20260819.pdf');
  const previous=JSON.parse(execFileSync('git',['show',`ee1b3d98c4163e8433e6bab55b84a338c117cd49:${file}`],{cwd:root,encoding:'utf8'}));
  const oldStats=previous.vendors.find(v=>v.id==='ememory').patentStats;
  assert.equal(stats.foundryCoverage,oldStats.foundryCoverage,'保留原六家代工夥伴');
  assert.deepEqual(stats.grantedSource,oldStats.grantedSource,'第一張專利卡來源保持原值');
  assert.equal(stats.waferShipment,suffix?'79M+ cumulative wafers shipped':'累計 7,900 萬片以上晶圓出貨');
  assert.deepEqual(Object.keys(stats.metricSources),['keyJurisdictions','foundryCoverage','waferShipment']);
  const restored=structuredClone(actual);const rs=restored.vendors.find(v=>v.id==='ememory').patentStats;
  rs.keyJurisdictions=oldStats.keyJurisdictions;rs.waferShipment=oldStats.waferShipment;delete rs.metricSources;
  assert.deepEqual(restored,previous,'本次僅改力旺兩個值與三項來源；全部其他資料保留');
  stats.keyJurisdictions=before.vendors.find(v=>v.id==='ememory').patentStats.keyJurisdictions;
  stats.waferShipment=before.vendors.find(v=>v.id==='ememory').patentStats.waferShipment;delete stats.metricSources;
  stats.totalGrantedWorldwide=before.vendors.find(v=>v.id==='ememory').patentStats.totalGrantedWorldwide;
  delete stats.grantedSource;
  assert.deepEqual(actual,before,'累積更動僅限力旺統計與來源；資料日期及全部案卷保持原值');
}
function withoutMap(html) {
  const start=html.indexOf('<article id="patent-maps"'); assert.ok(start>=0);
  const tags=html.slice(start).matchAll(/<\/?article\b[^>]*>/gu);
  let depth=0;
  for (const tag of tags) {
    depth+=tag[0].startsWith('</')?-1:1;
    if (!depth) {
      const rest = html.slice(0,start)+html.slice(start+tag.index+tag[0].length);
      return rest.replace(/1[12] leading NVM IP vendors/g, '12 leading NVM IP vendors')
                 .replace(/1[12] 家 NVM 領導廠商/g, '12 家 NVM 領導廠商');
    }
  }
  throw new Error('專利地圖 article 邊界不完整');
}
for (const file of ['nvm-technology-atlas.html','nvm-technology-atlas-zh.html']) {
  const previous=execFileSync('git',['show',`ee1b3d98c4163e8433e6bab55b84a338c117cd49:${file}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replaceAll('\r\n','\n');
  const mask=html=>{
    let card=0;
    const statsMasked=html.replace(/<div class="nvm-vendor-stat-card">.*?<\/div>/gu,match=>{card++;return card>=2&&card<=4?'<div>本次三項統計卡</div>':match;});
    const start=statsMasked.indexOf('<section id="vendor-patent-landscape-overview"');assert.ok(start>=0);
    const prefix=statsMasked.slice(0,start),appendix=statsMasked.slice(start);
    return prefix+appendix.replace(/<tbody><tr>(.*?)<\/tr>/u,(_,row)=>{
      let cell=0;return '<tbody><tr>'+row.replace(/<td\b[^>]*>.*?<\/td>/gu,match=>++cell===5?'<td>力旺代工與出貨來源</td>':match)+'</tr>';
    });
  };
  assert.equal(mask(read(file)),mask(previous),'這次生成頁面僅更動力旺第二至四張卡及矩陣最後一格；第一張卡與其他文字、功能標記逐字不變');
  const before=withoutMap(original(file));
  const after=withoutMap(read(file));
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
const sourceExceptions=new Set(policy.localizedSourcePathExceptions.map(item=>item.path));
const addedPaths=execFileSync('git',['diff','--name-only','--diff-filter=A','-z',base,'HEAD'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
for (const file of addedPaths) {
  if (/[^\x00-\x7F]/u.test(file)) assert.ok(sourceExceptions.has(file),`新增繁體中文來源路徑須登記精確例外：${file}`);
}
console.log('專利地圖產物核對通過：版本一致、原始資料保留、其他章節不變、四項離線資源同步、公開範圍與新增來源命名保持。');
execFileSync(process.execPath,['scripts/build-release-lineage.mjs','--check'],{cwd:root,stdio:'inherit'});
