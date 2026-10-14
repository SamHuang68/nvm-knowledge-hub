import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

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
cases.push(
  {name:'同來源重新導向保留內容核對',mode:'redirect',passed:true,classification:'一致',requests:2},
  {name:'跨來源重新導向拒絕',mode:'foreign',passed:false,classification:'重新導向超出來源；未取得正式資源'},
  {name:'循環重新導向有界失敗',mode:'loop',passed:false,classification:'重新導向超過上限；未取得正式資源',requests:6},
  {name:'缺少重新導向位置',status:302,passed:false,classification:'重新導向缺少位置；未取得正式資源'},
  {name:'標頭逾時',mode:'timeout',passed:false,classification:'請求逾時；未取得完整正式資源'},
  {name:'內文逾時',mode:'body-timeout',passed:false,classification:'請求逾時；未取得完整正式資源'},
  {name:'錯誤狀態即使內容相同仍失敗',status:500,body:local,passed:false,classification:'HTTP 請求失敗；未取得正式資源'},
  {name:'同批斷線保留成功結果',mode:'mixed',args:['--asset='+asset,'--asset=sw.js'],passed:false,classification:'一致',requests:2},
  {name:'無效選取覆寫舊成功',args:['--asset='],requests:0,stale:true},
  {name:'錯誤基底不擴大範圍',baseSuffix:'子路徑',requests:0},
  {name:'無效逾時設定拒絕',timeout:'NaN',requests:0}
);
cases.push(...['強制中斷不保留舊成功','同目錄並行拒絕','循序重跑使用新識別','初始報告寫入失敗停止請求','完成報告替換失敗不宣告成功','中斷處理器保存失敗','未處理例外保存失敗','舊報告移存失敗停止請求','完成報告部分寫入不破壞紀錄','報告路徑為資料夾拒絕'].map(name=>({name,lifecycle:true})));
const selected=process.argv.slice(2);
assert.ok(selected.every(arg=>arg.startsWith('--case=')&&cases.some(item=>item.name===arg.slice(7))),'必須指定存在的案例名稱');
const results=[];
for(const item of cases.filter(item=>!selected.length||selected.includes('--case='+item.name))) {
  if(item.lifecycle){await checkLifecycle(item);continue;}
  const requests=[];
  const foreignRequests=[];
  const foreign=http.createServer((request,response)=>{foreignRequests.push(request.url);response.end(local);});
  await new Promise(resolve=>foreign.listen(0,'127.0.0.1',resolve));
  const server=http.createServer((request,response)=>{
    requests.push({url:request.url,userAgent:request.headers['user-agent']});
    if(item.mode==='timeout')return;
    if(item.mode==='body-timeout'){response.writeHead(200);response.write(local.slice(0,10));return;}
    if(item.mode==='mixed'){
      if(request.url==='/sw.js'){response.writeHead(200,{'content-length':'999'});response.write('不完整');response.destroy();return;}
      response.end(local);return;
    }
    if(item.mode==='foreign'){response.writeHead(302,{location:`http://127.0.0.1:${foreign.address().port}/`+asset});response.end();return;}
    if(item.mode==='loop'||(item.mode==='redirect'&&requests.length===1)){
      response.writeHead(302,{location:encodeURI('/目的資源')});response.end();return;
    }
    if(item.mode==='redirect'){response.end(local);return;}
    response.writeHead(item.status||500,{'content-type':'text/plain; charset=utf-8',...(item.cloudflare?{'server':'cloudflare','cf-ray':'0000000000000000-TEST'}:{})});
    response.end(item.body||'未預期的請求');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const destination=fs.mkdtempSync(path.join(out,item.name+'-'));
  if(item.stale)fs.writeFileSync(path.join(destination,'live-release-verification.json'),JSON.stringify({passed:true,scope:'完整流程'}));
  try {
    const outcome=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,['scripts/verify-live-release.mjs',...(item.args||['--asset='+asset])],{
        cwd:root,env:{...process.env,NVM_QA_BASE:`http://127.0.0.1:${server.address().port}/`+(item.baseSuffix||''),NVM_QA_OUTPUT:destination,NVM_QA_TIMEOUT_MS:item.timeout||'1200'},windowsHide:true});
      let stdout='',stderr='';
      child.stdout.on('data',chunk=>{stdout+=chunk;});child.stderr.on('data',chunk=>{stderr+=chunk;});
      const timer=setTimeout(()=>{child.kill();reject(new Error('局部 HTTP 案例超過 15 秒'));},15000);
      child.on('error',error=>{clearTimeout(timer);reject(error);});
      child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
    });
    fs.writeFileSync(path.join(destination,'程序紀錄.json'),JSON.stringify(outcome,null,2));
    assert.equal(outcome.code,item.passed?0:1,item.name+'：退出碼');
    assert.equal(requests.length,item.requests??1,'只請求明列資源，不展開整站或自動重試');
    assert.equal(foreignRequests.length,0,'不得請求未指定的外部來源');
    const record=JSON.parse(fs.readFileSync(path.join(destination,'live-release-verification.json'),'utf8'));
    assert.equal(record.passed,Boolean(item.passed));assert.equal(record.scope,'指定資源');
    assert.equal(record.offlineRequested,false);assert.deepEqual(record.offline,[]);
    if(item.requests!==0) {
      assert.equal(requests[0].url,'/'+asset);
      assert.equal(requests[0].userAgent,userAgent,'使用真實具名驗證身分');
      assert.equal(record.assets.length,item.mode==='mixed'?2:1);assert.equal(record.assets[0].classification,item.classification);
      if(item.mode==='mixed'){
        assert.equal(record.assets[1].classification,'傳輸失敗；未取得完整正式資源');
        assert.ok(record.error.includes(record.assets[1].classification));
      }
      if(item.mode==='redirect'){assert.equal(record.assets[0].redirects.length,1);assert.ok(record.assets[0].finalURL.endsWith(encodeURI('/目的資源')));}
      if(item.mode?.includes('timeout'))assert.ok(record.assets[0].elapsedMs>=1000&&record.assets[0].elapsedMs<10000,'逾時須有界且留下耗時');
      assert.equal(record.assets[0].errorCode,item.cloudflare?1010:null);
      if(item.passed)assert.equal(record.assets[0].expected,record.assets[0].actual,'保留 BOM／CRLF 正規化後內容核對');
      if(item.name==='來源內容不一致')assert.notEqual(record.assets[0].expected,record.assets[0].actual,'HTTP 200 仍須驗證內容');
      if(!item.passed&&item.mode!=='mixed')assert.ok(record.error.includes(item.classification),'失敗原因保留在總結');
    }
    results.push({name:item.name,passed:true,requests,foreignRequests,destination});
  } catch(error) {
    results.push({name:item.name,passed:false,error:error.message,requests});process.exitCode=1;
  } finally {
    server.closeAllConnections();foreign.closeAllConnections();
    await Promise.all([new Promise(resolve=>server.close(resolve)),new Promise(resolve=>foreign.close(resolve))]);
  }
}
fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({results},null,2));
console.log(JSON.stringify(results.map(({name,passed,error})=>({name,passed,error}))));

async function checkLifecycle(item) {
  const destination=fs.mkdtempSync(path.join(out,item.name+'-'));
  const report=path.join(destination,'live-release-verification.json');
  fs.writeFileSync(report,JSON.stringify({passed:true,runId:'舊執行',state:'通過'}));
  if(item.name==='報告路徑為資料夾拒絕'){
    fs.unlinkSync(report);fs.mkdirSync(report);fs.writeFileSync(path.join(report,'保留資料.txt'),'原有資料');
  }
  const requests=[],children=[],pending=[];
  let body=local;
  const held=['強制中斷不保留舊成功','同目錄並行拒絕','中斷處理器保存失敗','未處理例外保存失敗'].includes(item.name);
  let requestReady,duplicateRequest;
  const ready=new Promise(resolve=>{requestReady=resolve;});
  const duplicate=new Promise(resolve=>{duplicateRequest=resolve;});
  const server=http.createServer((request,response)=>{
    requests.push(request.url);requestReady();if(requests.length>1)duplicateRequest();
    if(held)pending.push(response);else response.end(body);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const fixture=path.join(destination,'故障夾具.mjs');
  let fixtureCode={
    '初始報告寫入失敗停止請求':`import fs from 'node:fs'; const original=fs.writeFileSync; fs.writeFileSync=(target,data,...rest)=>{if(typeof data==='string'&&data.includes('"base"')){throw Object.assign(new Error('夾具拒絕報告寫入'),{code:'EACCES'});}return original(target,data,...rest);};`,
    '完成報告替換失敗不宣告成功':`import fs from 'node:fs'; const original=fs.renameSync; let writes=0; fs.renameSync=(from,to)=>{if(String(to).endsWith('live-release-verification.json')&&++writes>1)throw Object.assign(new Error('夾具拒絕完成報告替換'),{code:'EACCES'});return original(from,to);};`,
    '舊報告移存失敗停止請求':`import fs from 'node:fs'; const original=fs.renameSync; fs.renameSync=(from,to)=>{if(String(from).endsWith('live-release-verification.json'))throw Object.assign(new Error('夾具拒絕舊報告移存'),{code:'EACCES'});return original(from,to);};`,
    '完成報告部分寫入不破壞紀錄':`import fs from 'node:fs'; const original=fs.writeFileSync; fs.writeFileSync=(target,data,...rest)=>{if(typeof data==='string'&&data.includes('"base"')&&JSON.parse(data).passed){original(target,'{"未完成":');throw Object.assign(new Error('夾具模擬部分寫入後空間不足'),{code:'ENOSPC'});}return original(target,data,...rest);};`,
    '中斷處理器保存失敗':`import fs from 'node:fs'; const original=fs.renameSync; fs.renameSync=(from,to)=>{const value=original(from,to);if(String(to).endsWith('live-release-verification.json')){const record=JSON.parse(fs.readFileSync(to,'utf8'));if(record.state==='執行中')setTimeout(()=>process.emit('SIGTERM'),250);}return value;};`,
    '未處理例外保存失敗':`import fs from 'node:fs'; const original=fs.renameSync; fs.renameSync=(from,to)=>{const value=original(from,to);if(String(to).endsWith('live-release-verification.json')){const record=JSON.parse(fs.readFileSync(to,'utf8'));if(record.state==='執行中')setTimeout(()=>{throw new Error('夾具非預期例外');},250);}return value;};`
  }[item.name];
  if(item.name==='中斷處理器保存失敗'&&process.platform!=='win32')fixtureCode=null;
  if(fixtureCode)fs.writeFileSync(fixture,fixtureCode);
  function start() {
    const child=spawn(process.execPath,[...(fixtureCode?['--import',pathToFileURL(fixture).href]:[]),'scripts/verify-live-release.mjs','--asset='+asset],{
      cwd:root,env:{...process.env,NVM_QA_BASE:`http://127.0.0.1:${server.address().port}/`,NVM_QA_OUTPUT:destination},windowsHide:true});
    const trace={pid:child.pid,stdout:'',stderr:''};
    child.stdout.on('data',data=>{trace.stdout+=data;});child.stderr.on('data',data=>{trace.stderr+=data;});
    const done=new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('程序生命週期案例超過 10 秒'));},10000);
      child.once('error',error=>{clearTimeout(timer);reject(error);});
      child.once('close',(code,signal)=>{clearTimeout(timer);Object.assign(trace,{code,signal});resolve(trace);});
    });
    children.push({child,done,trace});return {child,done,trace};
  }
  const read=()=>JSON.parse(fs.readFileSync(report,'utf8'));
  try {
    const first=start();
    if(item.name==='強制中斷不保留舊成功'||item.name==='同目錄並行拒絕') {
      await Promise.race([ready,first.done.then(()=>{throw new Error('收到請求前程序已結束');})]);
      const running=read();
      if(item.name==='強制中斷不保留舊成功') {
        first.child.kill('SIGKILL');assert.notEqual((await first.done).code,0);
        assert.equal(read().passed,false,'強制終止不能留下成功');
        const retry=await start().done;assert.equal(retry.code,1);assert.match(retry.stderr,/執行鎖/u);
        assert.equal(read().runId,running.runId,'重試不得覆寫未完成的原執行');
      } else {
        const second=await Promise.race([start().done,duplicate.then(()=>{throw new Error('重複程序已發出第二筆請求');})]);assert.equal(second.code,1);assert.match(second.stderr,/執行鎖/u);
        assert.equal(read().runId,running.runId);assert.equal(read().passed,false);
        pending.forEach(response=>response.end(local));assert.equal((await first.done).code,0);
        assert.equal(read().runId,running.runId);assert.equal(read().passed,true);
      }
      assert.equal(running.passed,false);assert.equal(running.state,'執行中');assert.notEqual(running.runId,'舊執行');
      assert.equal(requests.length,1,'拒絕的重複程序不得發出請求');
    } else if(item.name==='循序重跑使用新識別') {
      assert.equal((await first.done).code,0);const prior=read();assert.equal(prior.passed,true);
      body='不同內容';assert.equal((await start().done).code,1);const failed=read();assert.equal(failed.passed,false);assert.notEqual(failed.runId,prior.runId);
      body=local;assert.equal((await start().done).code,0);assert.equal(read().passed,true);assert.notEqual(read().runId,failed.runId);assert.equal(requests.length,3);
    } else {
      if(item.name==='中斷處理器保存失敗'&&process.platform!=='win32'){
        await Promise.race([ready,first.done.then(()=>{throw new Error('收到請求前程序已結束');})]);first.child.kill('SIGTERM');
      }
      const outcome=await first.done;assert.notEqual(outcome.code,0);
      if(item.name==='初始報告寫入失敗停止請求') {
        assert.equal(requests.length,0);assert.match(outcome.stderr,/本次結果無法寫入/u);
        assert.ok(!fs.existsSync(report),'啟動前已移存舊報告，寫入失敗不得沿用成功');
      } else if(item.name==='報告路徑為資料夾拒絕'){
        assert.equal(requests.length,0);assert.match(outcome.stderr,/本次結果無法寫入/u);
        assert.equal(fs.readFileSync(path.join(report,'保留資料.txt'),'utf8'),'原有資料','不可移動或刪除既有資料夾');
      } else if(item.name==='舊報告移存失敗停止請求'){
        assert.equal(requests.length,0);assert.match(outcome.stderr,/本次結果無法寫入/u);assert.match(outcome.stderr,/既有報告不得當成本次完成證據/u);
        assert.equal(read().runId,'舊執行','沒有寫入權限時不得冒充已修改受保護的舊報告');
      } else {
        assert.equal(read().passed,false);assert.notEqual(read().runId,'舊執行');
        if(item.name==='完成報告替換失敗不宣告成功'){assert.equal(read().state,'執行中');assert.match(outcome.stderr,/本次結果無法寫入/u);}
        if(item.name==='完成報告部分寫入不破壞紀錄'){assert.equal(read().state,'報告寫入失敗');assert.ok(!fs.readdirSync(destination).some(name=>name.endsWith('.tmp')));}
        if(item.name==='中斷處理器保存失敗')assert.equal(read().state,'已中斷');
        if(item.name==='未處理例外保存失敗')assert.equal(read().state,'已中斷');
      }
    }
    results.push({name:item.name,passed:true,requests,destination});
  } catch(error) {
    results.push({name:item.name,passed:false,error:error.message,requests,destination});process.exitCode=1;
  } finally {
    children.forEach(({child})=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');});
    await Promise.allSettled(children.map(({done})=>done));
    fs.writeFileSync(path.join(destination,'程序紀錄.json'),JSON.stringify(children.map(({trace})=>trace),null,2));
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  }
}
