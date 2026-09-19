import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './驗證伺服器.mjs';
import {captureLanguageSurface,assessLanguageSurface} from './雙語畫面契約.mjs';

const root = path.resolve(import.meta.dirname,'..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root,'qa','公開頁面語系'));
fs.mkdirSync(output,{recursive:true});
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const routes = JSON.parse(fs.readFileSync(path.join(root,'data/公開路由.json'),'utf8')).pages;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({headless:true,...(channel === 'chromium' ? {} : {channel})});
const results = [];
try {
  for (const language of ['en','zh']) {
    const context = await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:960}});
    // 不依賴第三方字型／分析服務完成載入；本站請求與動態資料照常執行。
    await context.route('**/*',route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    for (const file of routes) {
      const page = await context.newPage();
      try {
        await page.goto(new URL(file+'?lang='+language,base).href,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(expected => document.documentElement.lang === (expected === 'zh' ? 'zh-Hant' : 'en'),language);
        if (file === 'ai-nvm-opportunities.html') await page.waitForFunction(() => document.body.dataset.knowledgeState === 'canonical');
        if (file.includes('whitepaper')) await page.locator('#panel-overview h2').waitFor();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const snapshot = await page.evaluate(captureLanguageSurface);
        const failures = assessLanguageSurface(snapshot,language);
        results.push({file,requestedLanguage:language,passed:failures.length === 0,failures,snapshot});
      } catch(error) {
        results.push({file,requestedLanguage:language,passed:false,error:error.message});
      } finally {await page.close();}
    }
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await server.close();
  fs.writeFileSync(path.join(output,'公開頁面語系.json'),JSON.stringify({base,results},null,2)+'\n');
}
const failures = results.filter(result => !result.passed);
console.log(`公開頁面語系：${results.length-failures.length}/${results.length} 通過。`);
if (failures.length) {
  console.error(JSON.stringify(failures.map(({snapshot,...result})=>result),null,2));
  process.exitCode = 1;
}
