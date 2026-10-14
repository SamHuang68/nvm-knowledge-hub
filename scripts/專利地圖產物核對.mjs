import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import os from 'node:os';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/u,'').replaceAll('\r\n','\n');
const base='dcea45ff36fe40b4d6f0f52428fc88b7c0efc98c';
const original=file=>execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replaceAll('\r\n','\n');
const currentRenderer=await import('./nvm-vendor-patent-maps-ui.mjs');
const pkg=JSON.parse(read('package.json')), lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'1.6.0'); assert.equal(lock.version,pkg.version); assert.equal(lock.packages[''].version,pkg.version);
assert.deepEqual(pkg.devDependencies,JSON.parse(original('package.json')).devDependencies,'既有依賴不變');
for (const suffix of ['','-en']) {
  const file=`data/nvm-vendor-patent-maps${suffix}.json`;
  const actual=JSON.parse(read(file)),before=JSON.parse(original(file));
  currentRenderer.validateVendorPatentMaps(actual);
  const restored=structuredClone(actual); restored.asOf=before.asOf;
  for(const vendor of restored.vendors){
    const old=before.vendors.find(v=>v.id===vendor.id);
    assert.deepEqual(vendor.patentStats,old.patentStats,'十二家統計精確保留');
    if(vendor.id==='attopsemi')assert.deepEqual(vendor,old,'上峰全部資料精確保留');
    else {
      assert.equal(vendor.families.length,old.families.length);
      assert.deepEqual(vendor.families.map(f=>[f.id,f.patents.length]),old.families.map(f=>[f.id,f.patents.length]),'保留技術組合入口與案卷涵蓋數');
      for(const field of ['founders','strategy','families','milestones','litigationDefense','attributionNote','personnelSource','researchSources','dossierReview']) {
        if(field in old)vendor[field]=old[field];else delete vendor[field];
      }
    }
  }
  assert.deepEqual(restored,before,'僅更正十一家案卷、人員與直接相關說明');
  const ids=actual.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.map(p=>p.id)));
  assert.equal(ids.length,61);assert.equal(new Set(ids).size,61,'不同公報不得因誤歸跨公司重複計入');
  const generated=`data/nvm-knowledge-data${suffix}.json`;
  const currentPackage=JSON.parse(read(generated)),oldPackage=JSON.parse(original(generated));
  assert.deepEqual(currentPackage.vendorPatentMaps,actual,'生成資料套件共用同一統計來源');
  currentPackage.vendorPatentMaps=oldPackage.vendorPatentMaps;
  assert.deepEqual(currentPackage,oldPackage,'生成資料其他章節與契約保留');
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
  const before=withoutMap(original(file));
  const after=withoutMap(read(file));
  assert.equal(after,before,'其他 Atlas 章節與入口未被重寫');
}
// 隔離執行保留的六個入口：修復指定廠商、保留其他資料、再次執行冪等。
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nvm-reviewed-'));
try {
 fs.mkdirSync(path.join(temp,'data'));
 const scopes=[null,['ememory','kilopass','sidense','attopsemi'],['ymc','impinj-aeon','nscore'],['sst','floadia'],['everspin','weebit'],['pufsecurity']];
 for(const [index,scope] of scopes.entries()){
  const expected={};
  for(const suffix of ['','-en']){
   const sourceFile=`data/nvm-vendor-patent-maps${suffix}.json`,targetFile=`data/nvm-knowledge-data${suffix}.json`;
   fs.writeFileSync(path.join(temp,sourceFile),read(sourceFile));
   const target=JSON.parse(read(targetFile)); expected[suffix]=structuredClone(target);
   target.vendorPatentMaps.vendors.forEach(v=>{if(!scope||scope.includes(v.id))v.strategy='待同步';});
   fs.writeFileSync(path.join(temp,targetFile),JSON.stringify(target));
  }
  const script=index?`update-stage${index}-dossiers.mjs`:'enrich-patents.mjs';
  for(let repeat=0;repeat<2;repeat++){
   execFileSync(process.execPath,[path.join(root,'scripts',script)],{cwd:temp,stdio:'pipe'});
   for(const suffix of ['','-en']){
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(temp,`data/nvm-knowledge-data${suffix}.json`),'utf8')),expected[suffix],'入口同步及冪等，其他知識保全');
    assert.equal(fs.readFileSync(path.join(temp,`data/nvm-vendor-patent-maps${suffix}.json`),'utf8'),read(`data/nvm-vendor-patent-maps${suffix}.json`),'正式來源不被寫入');
   }
  }
  const broken=JSON.parse(read('data/nvm-vendor-patent-maps-en.json'));
  delete broken.vendors.find(v=>v.id==='ememory').families[0].patents[0].researchSources;
  fs.writeFileSync(path.join(temp,'data/nvm-vendor-patent-maps-en.json'),JSON.stringify(broken));
  const before=['','-en'].map(suffix=>fs.readFileSync(path.join(temp,`data/nvm-knowledge-data${suffix}.json`),'utf8'));
  assert.throws(()=>execFileSync(process.execPath,[path.join(root,'scripts',script)],{cwd:temp,stdio:'pipe'}),'缺來源案卷拒絕同步');
  assert.deepEqual(['','-en'].map(suffix=>fs.readFileSync(path.join(temp,`data/nvm-knowledge-data${suffix}.json`),'utf8')),before,'英文失敗時中文亦不寫入');
 }
} finally {assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));fs.rmSync(temp,{recursive:true,force:true});}
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
