import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const whitepaperBuild = JSON.parse(fs.readFileSync(path.join(root,'whitepaper/建置清單.json'),'utf8'));
const assets = [...new Set([
  'site.webmanifest',
  'assets/favicon.svg','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png',
  'data/NVM搜尋索引.js','data/ai-nvm-opportunities-knowledge.json',
  'whitepaper/index.html','tools/whitepaper-studio/index.html','briefing/index.html',
  ...Object.keys(whitepaperBuild.outputs).filter(file => /\.(?:css|js)$/.test(file)).map(file => 'whitepaper/'+file),
  ...fs.readdirSync(root).filter(file => /\.(?:html|css|js)$/.test(file) && file !== 'sw.js')
])].sort();
const canonicalBytes = (file, bytes) => /\.(?:html|css|js|json|svg|webmanifest)$/.test(file)
  ? Buffer.from(bytes.toString('utf8').replace(/^\uFEFF/,'').replaceAll('\r\n','\n')) : bytes;
const hash = crypto.createHash('sha256');
const digests = {};
let totalBytes = 0;
for (const file of [...assets,'sw.js']) {
  hash.update(file+'\0');
  // 版本不受 Windows checkout 換行影響。
  const bytes=canonicalBytes(file,fs.readFileSync(path.join(root,file)));
  hash.update(bytes);
  if (file !== 'sw.js') {
    digests[file] = crypto.createHash('sha256').update(bytes).digest('hex');
    totalBytes += bytes.length;
  }
}
const content = 'self.NVMOfflineManifest = '+JSON.stringify({version:hash.digest('hex').slice(0,20),assets,digests,totalBytes},null,2)+';\n';
const output=path.join(root,'data/離線資源清單.js');
if(process.argv.includes('--check')) {
  if(!fs.existsSync(output)||fs.readFileSync(output,'utf8').replaceAll('\r\n','\n')!==content)throw new Error('離線資源清單與目前原始碼不同步');
} else fs.writeFileSync(output,content,'utf8');
console.log(`通過：${assets.length} 個離線資源與內容版本一致，共 ${totalBytes} 位元組（文字換行正規化後，不含大型下載附件）`);
