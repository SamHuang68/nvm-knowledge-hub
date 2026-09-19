#!/usr/bin/env node
/**
 * One-shot Host Gate P1/P2 data patches. Run from repo root, then `npm run build:nvm`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const yflashClaimZh =
  '採用單層多晶矽浮閘；依 Tower 公開 NVM 原理與 arXiv:2202.10228，寫入為通道熱電子注入 (CHE)、抹除為能帶間穿隧 (BBT) 電洞，非 FN/FN。0 額外光罩，原生相容 Tower 高壓 BCD 與電源管理平台，公開敘事支援 1K~10K 次抹寫與高溫保持；具名產品 Ta、Tj 與 AEC-Q100 資格須分開引用。';
const yflashClaimEn =
  "Single-poly floating gate; per Tower's public NVM brief and arXiv:2202.10228, program uses channel hot-electron injection (CHE) and erase uses band-to-band-tunneling (BBT) holes — not FN/FN. Zero mask adders integrate with Tower HV BCD/power platforms; public briefs cite 1K–10K endurance and high-temperature retention; name Ta, Tj, and AEC-Q100 qualification per product.";
const yflashMaturityZh =
  '0.18µm 與 65nm BCD 平台已公開；官方文件提及 Grade 0 保持敘述，但環境溫度 Ta 與接面 Tj 試驗條件須分開，不得把 175°C 一律等同整體認證。';
const yflashMaturityEn =
  '0.18µm and 65nm BCD platforms are public; vendor briefs mention Grade 0 retention narratives, but ambient Ta and junction Tj test conditions must be cited separately — do not equate 175°C with blanket certification.';

const weebitClaimZh =
  '公開 OxRAM 路線以 SiOx 活性層為主（例如 TiN 底電極／Ti 頂電極的 IMW 2019 樣本）；DB HiTek 130nm 提供 qualified IP（2 masks、10K cycles、125°C 保持等具名條件）。SkyWater 130nm 與 GF 22FDX 為不同平台階段；類比 CIM 研究與客戶量產須分開，不得合成單一規格。';
const weebitClaimEn =
  'Public OxRAM route centers on SiOx active layers (e.g., IMW 2019 samples with TiN bottom / Ti top electrodes). DB HiTek 130nm offers a qualified IP macro (2 masks, 10K cycles, 125°C retention under named conditions). SkyWater 130nm and GF 22FDX are distinct platform stages; analog CIM studies and customer production must not be merged into one spec sheet.';
const weebitMaturityZh =
  'DB HiTek 130nm qualified IP；SkyWater 130nm 與 GF 22FDX 為平台／評估階段，客戶產品量產需具名佐證。';
const weebitMaturityEn =
  'DB HiTek 130nm qualified IP; SkyWater 130nm and GF 22FDX are platform/evaluation stages — customer production needs named evidence.';

const urlReplacements = [
  ['https://www.attopsemi.com/ifuse-technology/', 'https://www.attopsemi.com/technology/i-fuse/'],
  ['https://www.nscore.com/twinbit_g2.html', 'https://www.nscore.com/products/twinbit-gen2/'],
  ['https://www.weebit-nano.com/reram-technology/', 'https://www.weebit-nano.com/products/embedded-reram-ip/'],
  ['https://www.everspin.com/storage-accelerators-and-raid', 'https://www.everspin.com/products'],
  ['https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf', 'https://crossbar-inc.com/blogs/all/overview-of-crossbar-hardware-reram-and-chip'],
  ['https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf', 'https://crossbar-inc.com/blogs/all/overview-of-crossbar-hardware-reram-and-chip'],
  ['https://www.chuangfeixin.com/newsinfo/8119214.html', 'https://www.chuangfeixin.com/'],
  ['https://semiiphub.com/vendor/cfx-semiconductor/', 'https://www.chuangfeixin.com/'],
  ['https://www.st.com/en/automotive-microcontrollers/stellar-32-bit-arm-cortex-mcus.html', 'https://www.st.com/content/st_com/en/about/innovation-and-technology/pcm.html'],
];

function patchJson(file, mutator) {
  const full = path.join(root, file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  mutator(data);
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log('patched', file);
}

function replaceUrlsDeep(value) {
  if (typeof value === 'string') {
    let out = value;
    for (const [from, to] of urlReplacements) out = out.split(from).join(to);
    return out;
  }
  if (Array.isArray(value)) return value.map(replaceUrlsDeep);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = replaceUrlsDeep(value[key]);
  }
  return value;
}

function patchResearch(file, isEn) {
  patchJson(file, data => {
    replaceUrlsDeep(data);
    const card = data.landscape?.find(c => c.id === 'tower-yflash');
    if (card) {
      card.claim = isEn ? yflashClaimEn : yflashClaimZh;
      card.maturity = isEn ? yflashMaturityEn : yflashMaturityZh;
      card.search = card.search?.replace(/FN\/FN/g, 'CHE/BBT') ?? card.search;
    }
    const weebit = data.landscape?.find(c => c.id === 'weebit-reram-cim');
    if (weebit) {
      weebit.claim = isEn ? weebitClaimEn : weebitClaimZh;
      weebit.maturity = isEn ? weebitMaturityEn : weebitMaturityZh;
      weebit.technology = isEn ? 'Embedded ReRAM (OxRAM) & analog CIM research' : '嵌入式 ReRAM (OxRAM) 與類比 CIM 研究';
    }
    const src = data.sources?.find(s => s.id === 'RES-TOWER-YFLASH-2024');
    if (src) {
      src.url = 'https://towersemi.com/technology/non-volatile-memory-nvm/';
      src.claim = isEn ? yflashClaimEn : yflashClaimZh;
      src.limit = isEn
        ? 'Single-poly cells suit low-to-mid density PMIC/BMS trim; cite CHE/BBT per Tower primary sources, not FN/FN.'
        : '單層多晶矽適合中低容量 PMIC/BMS 修調；機制依 Tower 一次來源為 CHE/BBT，非 FN/FN。';
    }
    const weeSrc = data.sources?.find(s => s.id === 'RES-WEEBIT-RERAM-2025');
    if (weeSrc) {
      weeSrc.url = 'https://www.weebit-nano.com/products/embedded-reram-ip/wbt-dbh-db130lva-reram-rram/';
      weeSrc.limit = isEn ? weebitMaturityEn : weebitMaturityZh;
    }
  });
}

patchResearch('data/NVM產研比較.json', false);
patchResearch('data/NVM產研比較英文.json', true);

for (const file of ['data/NVM知識資料.json', 'data/NVM知識資料英文.json']) {
  if (!fs.existsSync(path.join(root, file))) continue;
  patchJson(file, data => {
    replaceUrlsDeep(data);
    const touch = obj => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.id === 'tower-yflash' && obj.claim) {
        obj.claim = file.includes('英文') ? yflashClaimEn : yflashClaimZh;
        if (obj.maturity) obj.maturity = file.includes('英文') ? yflashMaturityEn : yflashMaturityZh;
      }
      if (obj.id === 'weebit-reram-cim' && obj.claim) {
        obj.claim = file.includes('英文') ? weebitClaimEn : weebitClaimZh;
        if (obj.maturity) obj.maturity = file.includes('英文') ? weebitMaturityEn : weebitMaturityZh;
      }
      for (const v of Object.values(obj)) {
        if (Array.isArray(v) || (v && typeof v === 'object')) touch(v);
      }
    };
    touch(data);
  });
}

// Chinese foundry milestone trim + English parity
const milestoneEn = [
  {
    id: 'SEC-2019',
    year: 2019,
    foundry: 'Samsung Foundry',
    technology: 'eMRAM',
    node: '28FDS (28nm FD-SOI)',
    stage: 'Volume production',
    claim: 'Samsung announced commercial shipment of 28nm FD-SOI embedded MRAM.',
    limit: 'FD-SOI platform with BEOL adders; do not equate with logic-roadmap 0-mask claims or bulk FinFET NVM.',
    sourceIds: ['FND-SEC-2019-28FDS'],
  },
  {
    id: 'INTC-2019',
    year: 2019,
    foundry: 'Intel Foundry',
    technology: 'STT-MRAM',
    node: '22FFL (22nm FinFET)',
    stage: 'Production-ready',
    claim: 'IEDM 2018/2019 publications describe 22FFL embedded STT-MRAM approaching production readiness.',
    limit: 'Evidence centers on 22FFL test vehicles; not an open PDK for every customer.',
    sourceIds: ['FND-INTC-2018-22FFL'],
  },
  {
    id: 'SEC-2024',
    year: 2024,
    foundry: 'Samsung Foundry',
    technology: 'Next-gen eMRAM / MBCFET GAA',
    node: 'SF3 / SF2',
    stage: 'Roadmap / R&D',
    claim: 'Samsung Foundry Forum materials discuss advanced-node eMRAM direction alongside MBCFET logic roadmaps.',
    limit: 'SF3/SF2 logic announcements do not by themselves prove shipped eMRAM macros; separate NVM milestones required.',
    sourceIds: ['FND-SEC-2024-MBCFET'],
  },
  {
    id: 'INTC-2024',
    year: 2024,
    foundry: 'Intel Foundry',
    technology: '18A RibbonFET + embedded NVM ecosystem',
    node: '18A',
    stage: 'Production preparation',
    claim: 'Intel Foundry Direct Connect 2024 describes 18A production preparation, PowerVia BSPDN, and embedded IP ecosystem goals.',
    limit: 'RibbonFET/PowerVia logic progress does not automatically prove native AntiFuse, eMRAM, or FeFET NVM at named nodes.',
    sourceIds: ['FND-INTC-2024-18A'],
  },
];

const englishFoundrySources = [
  {
    id: 'FND-SEC-2019-28FDS',
    label: 'Samsung Foundry: 28FDS eMRAM commercial production announcement',
    url: 'https://news.samsung.com/global/',
    kind: 'Vendor official press release',
    date: '2019-03-06',
    locator: '28FDS eMRAM commercial shipment and reliability section',
    claim:
      'Samsung announced commercial shipment of 28nm FD-SOI embedded MRAM with faster writes and lower power versus eFlash alternatives.',
    evidence: 'Full official press release reviewed',
    limit: '28FDS-specific platform; extensions to 14FDS and 8nm automotive/radio require separate macro qualification.',
    accessedAt: '2026-09-10',
  },
  {
    id: 'FND-SEC-2024-MBCFET',
    label: 'Samsung Foundry: SF3 / SF2 MBCFET advanced nodes and next-gen eMRAM roadmap',
    url: 'https://semiconductor.samsung.com/foundry/process-technology/',
    kind: 'Vendor technology forum and product brief',
    date: '2024-06-12',
    locator: 'SFF 2024 MBCFET GAA and advanced embedded NVM planning',
    claim:
      'Samsung publicly discusses SF3/SF2 GAA platforms with advanced embedded eMRAM development goals for automotive HPC and edge AI.',
    evidence: 'Official technology forum summary reviewed',
    limit: 'SF3/SF2 eMRAM remains in R&D/validation targets — not declared volume production.',
    accessedAt: '2026-09-10',
  },
  {
    id: 'FND-INTC-2018-22FFL',
    label: 'Intel Foundry: 22FFL embedded STT-MRAM (IEDM 2018)',
    url: 'https://www.intel.com/content/www/us/en/newsroom/news/intel-showcases-technologies-iedm-2018.html',
    kind: 'Conference paper and official release',
    date: '2018-12-03',
    locator: 'IEDM 2018 paper 13.3, 22FFL STT-MRAM cell and reliability',
    claim:
      'Intel published 22FFL FinFET embedded STT-MRAM with 0.0446 µm² cell, 10^6 endurance, 200°C retention, and 1E-9 BER under named ECC conditions.',
    evidence: 'IEDM paper and official release reviewed',
    limit: '22FFL low-power FinFET specialty process; metrics depend on ECC and temperature.',
    accessedAt: '2026-09-10',
  },
  {
    id: 'FND-INTC-2024-18A',
    label: 'Intel Foundry: 18A RibbonFET and PowerVia BSPDN roadmap',
    url: 'https://www.intel.com/content/www/us/en/newsroom/news/intel-foundry-direct-connect-2024.html',
    kind: 'Vendor official event release',
    date: '2024-02-21',
    locator: 'IFDC 2024 18A production plan, PowerVia back-side power, embedded IP ecosystem',
    claim:
      'Intel 18A integrates RibbonFET GAA with PowerVia BSPDN for next-gen dense embedded memory and logic AntiFuse OTP key cells.',
    evidence: 'Official release and technical brief reviewed',
    limit: '18A enters production preparation in 2024–2025; forward eNVM/MRAM still in R&D validation.',
    accessedAt: '2026-09-10',
  },
];

patchJson('data/NVM晶圓代工路線圖英文.json', data => {
  const ids = new Set(data.milestones.map(m => m.id));
  for (const m of milestoneEn) if (!ids.has(m.id)) data.milestones.push(m);
  const sourceIds = new Set(data.sources.map(s => s.id));
  for (const src of englishFoundrySources) if (!sourceIds.has(src.id)) data.sources.push(src);
});

patchJson('data/NVM晶圓代工路線圖.json', data => {
  const fix = id => data.milestones.find(m => m.id === id);
  const sec19 = fix('SEC-2019');
  if (sec19) sec19.limit = '28FDS 商用 eMRAM 有公開出貨紀錄，但 BEOL 需額外光罩層；不得寫成 0-Mask Adder，亦不能由 SF3/SF2 邏輯路線直接推出同名 eMRAM 量產。';
  const sec24 = fix('SEC-2024');
  if (sec24) sec24.limit = 'SF3/SF2 為邏輯與 GAA 路線公告；eMRAM 仍屬研發／驗證目標，不能等同已量產嵌入式巨集。';
  const intc24 = fix('INTC-2024');
  if (intc24) {
    intc24.technology = '18A RibbonFET 與嵌入式 IP 生態';
    intc24.claim = 'Intel Foundry Direct Connect 2024 描述 18A 進入生產準備、PowerVia 背面供電與嵌入式 IP 生態目標。';
    intc24.limit = 'RibbonFET/PowerVia 邏輯進度不能自動推出具名節點的原生 AntiFuse、eMRAM 或 FeFET NVM 量產。';
  }
});

// Search index tag line
const searchIndex = path.join(root, 'data/NVM搜尋索引.js');
let searchText = fs.readFileSync(searchIndex, 'utf8');
searchText = searchText.replace(/FN\/FN tunneling/g, 'CHE/BBT program-erase');
searchText = searchText.replace(/FN\/FN 穿隧/g, 'CHE/BBT 寫抹');
fs.writeFileSync(searchIndex, searchText, 'utf8');
console.log('patched data/NVM搜尋索引.js');

const trootMaturityZh =
  '廣泛部署敘述；官方公開將 Automotive HSM 列為 ASIL-B，OTP NVM 另列 ASIL-D — 不得合併為單一「tRoot ASIL-D」或 CC/PSA 組合認證。';
const trootMaturityEn =
  'Widely deployed narrative; Synopsys public pages list the Automotive HSM as ASIL-B and OTP NVM separately as ASIL-D — do not merge into one “tRoot ASIL-D” or CC/PSA bundle certification.';
const trootClaimZh =
  '獨立安全處理器與 AntiFuse OTP 整合的 HSM 子系統；公開功能含 Secure Boot、金鑰封裝與防回滾介面 — 具名 crypto mode、時序與 PSA/CC 組合須對應產品文件，不得由 portfolio 最高等級移植。';
const trootClaimEn =
  'HSM subsystem integrating a security processor with AntiFuse OTP; public features include secure boot, key wrapping, and rollback interfaces — named crypto modes, timing, and PSA/CC bundles require product documentation; do not port portfolio peak tiers.';

for (const file of ['data/NVM產研比較.json', 'data/NVM產研比較英文.json', 'data/NVM知識資料.json', 'data/NVM知識資料英文.json']) {
  patchJson(file, data => {
    const touch = obj => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.id === 'synopsys-troot-hsm') {
        obj.maturity = file.includes('英文') ? trootMaturityEn : trootMaturityZh;
        obj.claim = file.includes('英文') ? trootClaimEn : trootClaimZh;
      }
      for (const v of Object.values(obj)) {
        if (Array.isArray(v) || (v && typeof v === 'object')) touch(v);
      }
    };
    touch(data);
  });
}

console.log('Host Gate data patches complete.');
