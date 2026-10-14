import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateVendorPatentMaps} from './nvm-vendor-patent-maps-ui.mjs';

// 正式雙語案卷是唯一編輯來源；保留既有更新入口，移除會回填誤歸公報的第二份資料。
export function syncReviewedDossiers(vendorIds, root=process.cwd()) {
  const pending=[];
  for(const suffix of ['', '-en']) {
    const source=JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${suffix}.json`),'utf8'));
    validateVendorPatentMaps(source);
    const ids=vendorIds||source.vendors.map(v=>v.id);
    for(const id of ids)if(!source.vendors.some(v=>v.id===id))throw new Error(`正式案卷缺少廠商：${id}`);
    const targetPath=path.join(root,`data/nvm-knowledge-data${suffix}.json`);
    const target=JSON.parse(fs.readFileSync(targetPath,'utf8'));
    if(!target.vendorPatentMaps?.vendors)throw new Error('生成資料缺少專利地圖');
    for(const id of ids) {
      const index=target.vendorPatentMaps.vendors.findIndex(v=>v.id===id);
      if(index<0)throw new Error(`生成資料缺少廠商：${id}`);
      target.vendorPatentMaps.vendors[index]=structuredClone(source.vendors.find(v=>v.id===id));
    }
    if(!vendorIds)target.vendorPatentMaps=structuredClone(source);
    pending.push([targetPath,JSON.stringify(target,null,2)+'\n']);
  }
  // 雙語資料均通過契約才寫入，任何缺來源的舊案卷都不回填。
  for(const [target,value] of pending)fs.writeFileSync(target,value,'utf8');
  console.log(`已同步 ${vendorIds?.length||'全部'} 家已核對案卷；正式來源未被覆寫。`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)syncReviewedDossiers();
