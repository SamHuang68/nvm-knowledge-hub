import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {captureLanguageSurface,assessLanguageSurface} from './雙語畫面契約.mjs';

const root = path.resolve(import.meta.dirname,'..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root,'qa','雙語門禁'));
fs.mkdirSync(output,{recursive:true});
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({headless:true,...(channel === 'chromium' ? {} : {channel})});
const results = [];
const fixtures = [
  {name:'間接動態中文正文必須拒絕',language:'en',reject:true,html:'<main></main><script>const message="資料載入失敗";document.querySelector("main").textContent=message;</script>'},
  {name:'動態中文無障礙名稱必須拒絕',language:'en',reject:true,html:'<button>Diagram</button><script>document.querySelector("button").setAttribute("aria-label","開啟圖解");</script>'},
  {name:'繁中操作控制未翻譯必須拒絕',language:'zh',reject:true,html:'<button data-lang="zh">Export current profiles as CSV</button>'},
  {name:'CSS 覆蓋隱藏規則必須拒絕',language:'en',reject:true,html:'<style>[data-lang="zh"]{display:none}.card span:first-child{display:block!important}</style><main class="card"><p><span data-lang="zh">不可顯示的中文</span><span data-lang="en">Visible English</span></p></main>'},
  {name:'隱藏的雙語備用內容不誤判',language:'en',reject:false,html:'<style>[data-lang="zh"]{display:none}</style><main><span data-lang="en">Visible English</span><span data-lang="zh">保留中文內容</span></main>'},
  {name:'合理技術縮寫與翻譯按鈕通過',language:'zh',reject:false,html:'<button>BIST</button><button>匯出 CSV</button><p>SRAM PUF · AES-256</p>'},
];
try {
  const page = await browser.newPage();
  for (const fixture of fixtures) {
    await page.setContent(`<!doctype html><html lang="${fixture.language === 'zh' ? 'zh-Hant' : 'en'}"><title>Gate</title><body>${fixture.html}</body></html>`);
    const snapshot = await page.evaluate(captureLanguageSurface);
    const failures = assessLanguageSurface(snapshot,fixture.language);
    const passed = fixture.reject ? failures.length > 0 : failures.length === 0;
    results.push({name:fixture.name,passed,failures});
    assert.ok(passed,fixture.name);
  }
} finally {
  await browser.close();
  fs.writeFileSync(path.join(output,'雙語門禁反例.json'),JSON.stringify({results},null,2)+'\n');
}
console.log(`通過：${results.length} 個實際 DOM 雙語門禁正反例。`);
