import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderPhase1KB } from '../src/js/modules/phase1_kb_view.js';
import { renderPhase2Reader } from '../src/js/modules/phase2_reader.js';
import { renderMatrix } from '../src/js/modules/matrix.js';
import { renderPhase4Metadata } from '../src/js/modules/phase4_meta_view.js';
import { renderPhase3Templates } from '../src/js/modules/phase3_template_view.js';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { aiMediaNote } from '../../../scripts/ai-media-notes.mjs';
import { applySharedStyles } from '../../../scripts/hub-shared-styles.mjs';

const root = new URL('../', import.meta.url);
const outputRoot = new URL('../../../whitepaper/', import.meta.url);
const hash = value => createHash('sha256').update(value).digest('hex');
const normalizedText = value => String(value).replace(/\r\n?/g, '\n');

async function sourceFiles(url) {
  const entries = await readdir(url, { withFileTypes: true });
  const nested = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name, 'en')).map(entry => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
    return entry.isDirectory() ? sourceFiles(child) : [child];
  }));
  return nested.flat();
}

export async function buildStudio({ checkOnly = false } = {}) {
  const rendered = {
    overview: renderPhase1KB, whitepaper: renderPhase2Reader, selector: renderMatrix,
    taxonomy: renderPhase4Metadata, templates: renderPhase3Templates,
  };
  let html = normalizedText(await readFile(new URL('public-entry-template.html.tpl', root), 'utf8'));
  for (const [name, render] of Object.entries(rendered)) {
    const container = { innerHTML: '', querySelector: () => null };
    render(container);
    if (!html.includes(`{{${name}}}`)) throw new Error(`白皮書樣板缺少區塊：${name}`);
    html = html.replace(`{{${name}}}`, () => container.innerHTML);
  }
  // 分享預覽圖是 AI 生成圖，頁尾說明由媒體清單產生（scripts/ai-media-notes.mjs）。
  if (!html.includes('{{aiMediaNote}}')) throw new Error('白皮書樣板缺少區塊：aiMediaNote');
  html = html.replace('{{aiMediaNote}}', () => aiMediaNote('whitepaper/index.html'));
  // 共用樣式表與 body 類別寫進 HTML，第一次繪製即是最終版面（scripts/hub-shared-styles.mjs）。
  html = applySharedStyles(html, 'whitepaper/index.html');
  html = html.replace(/[\t ]+$/gm, '');
  const result = await build({ root: fileURLToPath(root), configFile: fileURLToPath(new URL('vite.config.js', root)), logLevel: 'warn' });
  const outputs = new Map([['index.html', html]]);
  outputs.set('assets/whitepaper_i18n.js', normalizedText(await readFile(new URL('src/js/whitepaper-locale.js', root), 'utf8')));
  for (const chunk of (Array.isArray(result) ? result : [result]).flatMap(item => item.output)) {
    outputs.set(`assets/${chunk.fileName}`, normalizedText(chunk.type === 'chunk' ? chunk.code : chunk.source));
  }
  const sources = [...await sourceFiles(new URL('src/', root)), ...['public-entry-template.html.tpl', 'index.html', 'vite.config.js', 'package.json', 'package-lock.json', 'scripts/build-whitepaper.mjs'].map(name => new URL(name, root))];
  const sourceHashes = {};
  for (const source of sources) sourceHashes[decodeURIComponent(source.href.slice(root.href.length))] = hash(normalizedText(await readFile(source, 'utf8')));
  const manifest = {
    schemaVersion: 1,
    canonicalEntry: 'whitepaper/index.html',
    alternateEntry: 'tools/whitepaper-studio/index.html',
    recordIds: nvmIpSpecs.map(item => item.id),
    dataSha256: hash(JSON.stringify(nvmIpSpecs)),
    sourceHashes,
    outputs: Object.fromEntries([...outputs].map(([name, content]) => [name, hash(content)])),
  };
  outputs.set('build-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  const changed = [];
  for (const [name, content] of outputs) {
    const target = new URL(name, outputRoot);
    const previous = await readFile(target).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
    if (previous && hash(normalizedText(previous)) === hash(content)) continue;
    changed.push(name);
    if (!checkOnly) {
      await mkdir(new URL('./', target), { recursive: true });
      await writeFile(target, content);
    }
  }
  if (checkOnly && changed.length) throw new Error(`白皮書產物未同步，請執行 npm run build:whitepaper：${changed.join('、')}`);
  console.log(`白皮書${checkOnly ? '一致性驗證' : '建置'}通過：${nvmIpSpecs.length} 筆資料，${outputs.size} 個產物。`);
  return manifest;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await buildStudio({ checkOnly: process.argv.includes('--check') });
