import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { renderPhase1KB } from '../src/js/modules/phase1_kb_view.js';
import { renderPhase2Reader } from '../src/js/modules/phase2_reader.js';
import { renderPhase3Templates } from '../src/js/modules/phase3_template_view.js';
import { renderPhase4Metadata } from '../src/js/modules/phase4_meta_view.js';

const officialProductSources = {
  NeoMTP: 'https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP',
};

export function visibleText(html) {
  return html.replace(/<!--[^]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[^]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/[^\s"<>]+/g, ' ');
}

export function inspectVisibleContent(html) {
  const text = visibleText(html);
  const rules = [
    ['機密標記', /INTERNAL\s+CONFIDENTIAL/i],
    ['受限範例', /Customer\s+Restricted\s+NDA/i],
    ['未附來源的實作或量產聲稱', /silicon[- ]proven|mass production proven|foundry[- ]verified|量產驗證|已通過認證/i],
    ['未渲染標題', /(^|\n)\s*#{2,6}\s/m],
    ['未渲染粗體', /\*\*[^*]+\*\*/],
    ['未渲染公式', /\$V_\{|\\text\{|10\^\{/],
    ['未經資料契約審查的產品名稱', /\bNeo(?:OTP|MTP|PUF)\b/],
  ];
  return rules.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

export function inspectProfile(profile) {
  const failures = [];
  const review = profile.evidenceReview;
  if (!profile.id || !profile.boundary) failures.push('缺少紀錄識別或技術限制');
  if (!review || review.status !== 'source-needed' || typeof review.scope !== 'string' || review.scope.length < 60) failures.push('原稿聲稱缺少待查證狀態與適用範圍');
  const sources = review?.sources || [];
  for (const source of sources) {
    if (source.url !== officialProductSources[source.product] || !source.fields?.length || !source.claim || !source.limitation || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt || '')) failures.push('產品來源、欄位、聲稱或限制不完整');
  }
  for (const [field, value] of Object.entries(profile)) {
    if (typeof value !== 'string') continue;
    if (/INTERNAL\s+CONFIDENTIAL|Customer\s+Restricted\s+NDA/i.test(value)) failures.push(`受限內容：${field}`);
    for (const product of value.match(/\bNeo(?:OTP|MTP|PUF)\b/g) || []) {
      if (!sources.some(source => source.product === product && source.url === officialProductSources[product] && source.fields?.includes(field))) failures.push(`產品 ${product} 的 ${field} 缺少指定官方來源與欄位範圍`);
    }
  }
  return failures;
}

export async function checkPublic() {
  const failures = [];
  const template = await readFile(new URL('../公開入口樣板.html.tpl', import.meta.url), 'utf8');
  failures.push(...inspectVisibleContent(template));
  for (const render of [renderPhase1KB, renderPhase2Reader, renderPhase3Templates, renderPhase4Metadata]) {
    const container = { innerHTML: '' };
    render(container);
    failures.push(...inspectVisibleContent(container.innerHTML).map(item => `${render.name}：${item}`));
  }
  for (const profile of nvmIpSpecs) failures.push(...inspectProfile(profile).map(item => `${profile.id}：${item}`));
  if ((template.match(/<h1\b/g) || []).length !== 1) failures.push('入口樣板必須只有一個 H1');
  if (!template.includes('role="tablist"') || !template.includes('rel="canonical"')) failures.push('缺少頁籤或正式網址契約');
  const matrix = await readFile(new URL('../src/js/modules/matrix.js', import.meta.url), 'utf8');
  if (!matrix.includes('item.evidenceReview.scope') || !matrix.includes('Draft claim — verification pending')) failures.push('矩陣未顯示逐筆證據限制');
  if (failures.length) throw new Error('公開內容查核失敗：\n' + failures.map(item => `- ${item}`).join('\n'));
  console.log(`公開內容查核通過：${nvmIpSpecs.length} 筆紀錄、逐筆來源範圍與原稿狀態；不以 URL 或程式字串判定公開聲稱。`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await checkPublic();
