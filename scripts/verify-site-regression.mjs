import path from 'node:path';
import {spawn} from 'node:child_process';
import {startTestServer} from './test-server.mjs';

import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export async function runRegression() {
const root=path.resolve(import.meta.dirname,'..');
const server=await startTestServer(root);
const scripts=['../tests/sram-model.test.mjs','../tests/sram-scenarios.test.mjs','evidence-summary.test.mjs','../tools/whitepaper-studio/scripts/process-boundary.test.mjs','../tests/automotive-model.test.mjs','verify-sram-estimator.mjs','verify-sram-scenarios.mjs','verify-evidence-whitepaper.mjs','verify-evidence-workbench.mjs','verify-named-comparison.mjs','verify-task-search.mjs','verify-page-loading.mjs','verify-restored-reading-ui.mjs','verify-model-boundaries.mjs','驗證模型數值複製.mjs','驗證新增模型複製狀態.mjs','驗證模型曲線與匯出.mjs','驗證特種製程匯出.mjs','驗證最新模型匯出.mjs','驗證審查匯出修正.mjs','驗證續審匯出邊界.mjs','驗證審查圖解狀態.mjs','verify-responsive-reading.mjs','verify-ai-recovery.mjs','verify-matrix-candidates.mjs','verify-shell-accessibility.mjs','verify-content-accessibility.mjs','verify-language-entry.mjs','verify-touch-accessibility.mjs','verify-check-gates.mjs','verify-repair-simulator.mjs','verify-search-and-state.mjs','verify-atlas-lazy-diagrams.mjs','verify-service-worker-redirect.mjs','verify-offline-cache.mjs','../tools/whitepaper-studio/scripts/verify-whitepaper-browser.mjs','verify-bilingual-release.mjs'];
scripts.push('驗證資料來源與模型判讀.mjs');
scripts.push('驗證穿隧與高溫模型契約.mjs');
try {
  for(const file of scripts) {
    console.log(`開始驗證：${file}`);
    const env={...process.env,NVM_QA_BASE:server.base,NVM_QA_CHANNEL:process.env.NVM_QA_BROWSER||'msedge'};
    if(file==='驗證穿隧與高溫模型契約.mjs') env.NVM_QA_MODEL='全部';
    if(file==='verify-offline-cache.mjs' || file==='verify-service-worker-redirect.mjs') delete env.NVM_QA_BASE;
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[path.join(root,'scripts',file)],{cwd:root,env,stdio:'inherit'});
      child.once('error',reject);
      child.once('exit',code=>code===0?resolve():reject(new Error(`${file} 驗證失敗（${code}）`)));
    });
  }
} finally {await server.close();}

}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const index = process.argv.indexOf('--plan');
  if (index < 0 || !process.argv[index + 1]) throw new Error('完整回歸須提供 --plan 授權計畫，CI 環境或舊 --allow-full-scan 旗標不能代替明確授權。');
  const workspaceIndex = process.argv.indexOf('--workspace-root');
  if (workspaceIndex < 0 || !process.argv[workspaceIndex + 1]) throw new Error('完整回歸須明列 --workspace-root 作為證據保存範圍。');
  execFileSync(process.env.PYTHON || 'python', ['tools/codex/完整驗證入口.py', '--plan', process.argv[index + 1], '--workspace-root', process.argv[workspaceIndex + 1]], {cwd: path.resolve(import.meta.dirname, '..'), stdio: 'inherit', env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'}});
}
