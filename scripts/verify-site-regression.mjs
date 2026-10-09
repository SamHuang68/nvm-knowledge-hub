import path from 'node:path';
import {spawn} from 'node:child_process';
import {startTestServer} from './test-server.mjs';

const isCI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const hasExplicitConsent = process.argv.includes('--allow-full-scan');
if (!isCI && !hasExplicitConsent) {
  console.error('【安全防呆門禁阻斷】verify-site-regression.mjs 屬於耗時耗資源之全站深度回歸掃描。依規則 0008/0009 與全域執行規範，本機執行前必須先獲得 USER 明確同意並加上 --allow-full-scan 旗標。');
  process.exit(1);
}

const root=path.resolve(import.meta.dirname,'..');
const server=await startTestServer(root);
const scripts=['../tests/sram-model.test.mjs','../tests/sram-scenarios.test.mjs','evidence-summary.test.mjs','../tools/whitepaper-studio/scripts/process-boundary.test.mjs','../tests/automotive-model.test.mjs','verify-sram-estimator.mjs','verify-sram-scenarios.mjs','verify-evidence-whitepaper.mjs','verify-evidence-workbench.mjs','verify-named-comparison.mjs','verify-task-search.mjs','verify-page-loading.mjs','verify-restored-reading-ui.mjs','verify-model-boundaries.mjs','驗證模型數值複製.mjs','驗證新增模型複製狀態.mjs','驗證模型曲線與匯出.mjs','驗證特種製程匯出.mjs','驗證最新模型匯出.mjs','驗證審查匯出修正.mjs','驗證續審匯出邊界.mjs','驗證審查圖解狀態.mjs','verify-responsive-reading.mjs','verify-ai-recovery.mjs','verify-matrix-candidates.mjs','verify-shell-accessibility.mjs','verify-content-accessibility.mjs','verify-language-entry.mjs','verify-touch-accessibility.mjs','verify-check-gates.mjs','verify-repair-simulator.mjs','verify-search-and-state.mjs','verify-atlas-lazy-diagrams.mjs','verify-service-worker-redirect.mjs','verify-offline-cache.mjs','../tools/whitepaper-studio/scripts/verify-whitepaper-browser.mjs','verify-bilingual-release.mjs'];
scripts.push('驗證資料來源與模型判讀.mjs');
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
