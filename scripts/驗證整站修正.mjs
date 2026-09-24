import path from 'node:path';
import {spawn} from 'node:child_process';
import {startTestServer} from './驗證伺服器.mjs';

const root=path.resolve(import.meta.dirname,'..');
const server=await startTestServer(root);
const scripts=['../tests/sram-model.test.mjs','驗證SRAM估算器.mjs','驗證檢查門禁.mjs','驗證模擬備援.mjs','驗證搜尋與狀態修正.mjs','驗證全景延後載入.mjs','驗證服務工作者轉址.mjs','驗證離線快取.mjs','../tools/whitepaper-studio/scripts/驗證白皮書瀏覽器.mjs','驗證雙語發布.mjs'];
try {
  for(const file of scripts) {
    console.log(`開始驗證：${file}`);
    const env={...process.env,NVM_QA_BASE:server.base,NVM_QA_CHANNEL:process.env.NVM_QA_BROWSER||'msedge'};
    if(file==='驗證離線快取.mjs' || file==='驗證服務工作者轉址.mjs') delete env.NVM_QA_BASE;
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[path.join(root,'scripts',file)],{cwd:root,env,stdio:'inherit'});
      child.once('error',reject);
      child.once('exit',code=>code===0?resolve():reject(new Error(`${file} 驗證失敗（${code}）`)));
    });
  }
} finally {await server.close();}
