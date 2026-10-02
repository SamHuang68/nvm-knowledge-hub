import path from 'node:path';
import {spawn} from 'node:child_process';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..');
const server=await startTestServer(root);
const scripts=['../tests/sram-model.test.mjs','../tests/automotive-model.test.mjs','verify-sram-estimator.mjs','verify-restored-reading-ui.mjs','verify-model-boundaries.mjs','verify-responsive-reading.mjs','verify-ai-recovery.mjs','verify-matrix-candidates.mjs','verify-check-gates.mjs','verify-repair-simulator.mjs','verify-search-and-state.mjs','verify-atlas-lazy-diagrams.mjs','verify-service-worker-redirect.mjs','verify-offline-cache.mjs','../tools/whitepaper-studio/scripts/verify-whitepaper-browser.mjs','verify-bilingual-release.mjs'];
try {
  for(const file of scripts) {
    console.log(`開始驗證：${file}`);
    const env={...process.env,NVM_QA_BASE:server.base,NVM_QA_CHANNEL:process.env.NVM_QA_BROWSER||'msedge'};
    if(file==='verify-offline-cache.mjs' || file==='verify-service-worker-redirect.mjs') delete env.NVM_QA_BASE;
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[path.join(root,'scripts',file)],{cwd:root,env,stdio:'inherit'});
      child.once('error',reject);
      child.once('exit',code=>code===0?resolve():reject(new Error(`${file} 驗證失敗（${code}）`)));
    });
  }
} finally {await server.close();}
