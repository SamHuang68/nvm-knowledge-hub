import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'qa','正式來源HTTP');
fs.mkdirSync(out,{recursive:true});
const asset='site.webmanifest';
const local=fs.readFileSync(path.join(root,asset),'utf8').replace(/^\uFEFF/u,'').replaceAll('\r\n','\n');
const userAgent='NVM-Knowledge-Hub-Verification/1.0 (+https://hub.samhuang68.org/)';
const cases=[
  {name:'具名請求與換行保全',status:200,body:'\uFEFF'+local.replaceAll('\n','\r\n'),passed:true,classification:'一致'},
  {name:'Cloudflare特徵拒絕',status:403,body:'error code: 1010\n',passed:false,classification:'用戶端特徵遭拒；未取得正式資源',cloudflare:true},
  {name:'一般HTTP拒絕',status:403,body:'拒絕存取',passed:false,classification:'HTTP 請求失敗；未取得正式資源'},
  {name:'來源內容不一致',status:200,body:local+'\n內容已改動',passed:false,classification:'內容不一致'},
  {name:'一般錯誤不冒充Cloudflare',status:403,body:'error code: 1010\n',passed:false,classification:'HTTP 請求失敗；未取得正式資源'},
  {name:'空白選取拒絕',args:['--asset='],requests:0},
  {name:'越界選取拒絕',args:['--asset=../site.webmanifest'],requests:0},
  {name:'未知選項拒絕',args:['--assset=site.webmanifest'],requests:0}
];
const results=[];
for(const item of cases) {
  const requests=[];
  const server=http.createServer((request,response)=>{
    requests.push({url:request.url,userAgent:request.headers['user-agent']});
    response.writeHead(item.status||500,{'content-type':'text/plain; charset=utf-8',...(item.cloudflare?{'server':'cloudflare','cf-ray':'0000000000000000-TEST'}:{})});
    response.end(item.body||'未預期的請求');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const destination=fs.mkdtempSync(path.join(out,item.name+'-'));
  try {
    const outcome=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,['scripts/verify-live-release.mjs',...(item.args||['--asset='+asset])],{
        cwd:root,env:{...process.env,NVM_QA_BASE:`http://127.0.0.1:${server.address().port}/`,NVM_QA_OUTPUT:destination},windowsHide:true});
      let stdout='',stderr='';
      child.stdout.on('data',chunk=>{stdout+=chunk;});child.stderr.on('data',chunk=>{stderr+=chunk;});
      const timer=setTimeout(()=>{child.kill();reject(new Error('局部 HTTP 案例超過 15 秒'));},15000);
      child.on('error',error=>{clearTimeout(timer);reject(error);});
      child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
    });
    fs.writeFileSync(path.join(destination,'程序紀錄.json'),JSON.stringify(outcome,null,2));
    assert.equal(outcome.code,item.passed?0:1,item.name+'：退出碼');
    assert.equal(requests.length,item.requests??1,'只請求明列資源，不展開整站或自動重試');
    if(item.requests!==0) {
      assert.equal(requests[0].url,'/'+asset);
      assert.equal(requests[0].userAgent,userAgent,'使用真實具名驗證身分');
      const record=JSON.parse(fs.readFileSync(path.join(destination,'live-release-verification.json'),'utf8'));
      assert.equal(record.passed,item.passed);assert.equal(record.scope,'指定資源');
      assert.equal(record.offlineRequested,false);assert.deepEqual(record.offline,[]);
      assert.equal(record.assets.length,1);assert.equal(record.assets[0].classification,item.classification);
      assert.equal(record.assets[0].errorCode,item.cloudflare?1010:null);
      if(item.passed)assert.equal(record.assets[0].expected,record.assets[0].actual,'保留 BOM／CRLF 正規化後內容核對');
      if(item.name==='來源內容不一致')assert.notEqual(record.assets[0].expected,record.assets[0].actual,'HTTP 200 仍須驗證內容');
      if(!item.passed)assert.ok(record.error.includes(item.classification),'失敗原因保留在總結');
    }
    results.push({name:item.name,passed:true,requests});
  } catch(error) {
    results.push({name:item.name,passed:false,error:error.message,requests});process.exitCode=1;
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({results},null,2));
console.log(JSON.stringify(results.map(({name,passed,error})=>({name,passed,error}))));
