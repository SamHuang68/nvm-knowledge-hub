import { readFileSync } from 'node:fs';

/** @typedef {{id:string,title:string,caption:string,state:string,stimulus:string,svg:string,sourceIds:string[]}} OperationFrame */
/** @typedef {{id:string,label:string,url:string,kind:string,date:string,locator:string,limit:string}} OperationSource */
/** @typedef {{symbol:string,meaning:string}} OperationLegend */
/** @typedef {{id:string,title:string,summary:string,mechanism:string,frames:OperationFrame[],legend:OperationLegend[],sources:OperationSource[],caveat:string}} OperationVariant */
/** @typedef {{title:string,summary:string,variant:string,frames:OperationFrame[],legend:OperationLegend[],sources:OperationSource[],caveat:string,variants:OperationVariant[]}} OperationPlate */

const data = Object.fromEntries(['zh', 'en'].map(lang => [lang, JSON.parse(readFileSync(new URL(lang === 'zh' ? '../data/NVM電荷專題.json' : '../data/NVM電荷專題英文.json', import.meta.url), 'utf8'))]));
const topics = new Set(['efuse', 'antifuse', 'eeprom', 'mtp', 'nor', 'sonos', 'nand']);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const choose = (lang, zh, en) => lang === 'zh' ? zh : en;
const C = { ink: '#16334c', silicon: '#bed1e2', doped: '#7299b9', oxide: '#f3e2af', trap: '#d98762', fg: '#c2a269', metal: '#899ba9', electron: '#075f9d', hole: '#b52f43', field: '#a34b10', current: '#087766', white: '#fff' };
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-width="1.4" ${extra}/>`;
const path = (d, color = C.ink, width = 2, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const text = (x, y, value, anchor = 'middle', color = C.ink) => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="20" font-weight="600">${esc(value)}</text>`;
const dot = (x, y, hole = false, role = 'mobile') => `<circle data-charge="${role}" cx="${x}" cy="${y}" r="10" fill="${hole ? C.hole : C.electron}"/>${text(x, y + 7, hole ? '+' : '−', 'middle', C.white)}`;
const charge = (xs, y, hole = false) => xs.map(x => dot(x, y, hole, 'stored')).join('');
const block = (x, y, radius = 15) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="white" stroke="${C.hole}" stroke-width="3"/>${path(`M${x - radius * .65} ${y + radius * .65}l${radius * 1.3} ${-radius * 1.3}`, C.hole, 3)}`;
const wire = (x, y, endY) => path(`M${x} ${y}V${endY}`);

function drawingContext(prefix, lang) {
  return {
    lang, l: (zh, en) => choose(lang, zh, en),
    arrow: (d, kind = 'electron', dashed = false) => path(d, C[kind], 3, `marker-end="url(#${prefix}-${kind})"${dashed ? ' stroke-dasharray="6 5"' : ''}`),
  };
}

function wrapSvg(prefix, label, body) {
  const markers = ['electron', 'hole', 'field', 'current'].map(kind => `<marker id="${prefix}-${kind}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L8 5L1 9" fill="none" stroke="${C[kind]}" stroke-width="2"/></marker>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 270" role="img" aria-labelledby="${prefix}-title" style="font-family:Arial,'Microsoft JhengHei',sans-serif;background:#f7f9fc"><title id="${prefix}-title">${esc(label)}</title><defs>${markers}</defs>${body}</svg>`;
}

const extraSources = {
  'op-pat-sonos-fn': { url: 'https://patents.google.com/patent/WO2014008160A2/en', label: ['賽普拉斯：SONOS ONO 堆疊縮放', 'Cypress: SONOS ONO Stack Scaling'], locator: ['圖 1–3；全通道穿隧、電子寫入與電洞抹除段落', 'Figures 1–3; uniform channel tunneling, electron programming, and hole erase'], limit: ['用於具名 SONOS 穿隧原理；不推定與現行英飛凌巨集具有相同膜層或數值。', 'A named SONOS tunneling example; no equivalence to the stack or biases of a current Infineon macro is asserted.'], year: '2014' },
  'op-pat-nrom-hhi': { url: 'https://patents.google.com/patent/US6664588B2/en', label: ['Saifun：自對準 NROM 寫入與抹除區', 'Saifun: Self-Aligned NROM Programming and Erasure Areas'], locator: ['圖 4、8A、9、10–11；能帶間穿隧產生電洞及局部熱電洞注入', 'Figures 4, 8A, 9, and 10–11; band-to-band hole generation and localized hot-hole injection'], limit: ['本案的口袋植入與局部電洞路徑；不把 US5768192A 當成此抹除路徑的來源。', 'The pocket implant and local hole path belong to this example; US5768192A is not used as evidence for this erase path.'], year: '2003' },
  'op-nand-hole-erase': { url: 'https://www.kioxia.com/en-jp/rd/technology/topics/topics-88.html', label: ['鎧俠：蕭特基源極接點與電洞供應研究', 'KIOXIA: Schottky Source Contact and Hole Supply'], locator: ['圖 1、4；N+ 矽源極的 GIDL 電洞供應及蕭特基接點替代研究', 'Figures 1 and 4; GIDL hole supply from an N+ silicon source and the Schottky-contact alternative'], limit: ['只支持載子供應方向與具名研究；本圖採傳統 GIDL 分支，未把蕭特基源極併入同一結構。', 'Supports carrier supply and a named study; this diagram uses the conventional GIDL branch without merging in a Schottky source.'], year: '2025-09-18' },
  'op-pat-nand-gidl': { url: 'https://patents.google.com/patent/US10923196B1/en', label: ['SanDisk：GIDL 輔助 3D NAND 抹除', 'SanDisk: GIDL-Assisted 3D NAND Erase'], locator: ['圖 8 及 GIDL 抹除段；端點與選擇閘的電位差、電洞供應與捕捉層中和', 'Figure 8 and GIDL erase description; terminal/select-gate bias difference, hole supply, and charge neutralization'], limit: ['此變體須用自己的 BL／SL 與選擇閘偏壓；不得混入 US7696559B2 的浮接端點抹除條件。', 'Uses its own BL/SL and select-gate biases; do not substitute the floating-terminal erase conditions of US7696559B2.'], year: '2021' },
};

function sources(ids, lang) {
  const registry = new Map(data[lang].sources.map(s => [s.id, s]));
  return [...new Set(ids)].map(id => {
    const existing = registry.get(id);
    if (existing) return { id, label: existing.label, url: existing.url, kind: existing.kind, date: existing.date, locator: id === 'ch-pat-antifuse' ? choose(lang, '圖 1、3、8：選擇、寫入與讀取；圖 12–15：應力與崩潰特性曲線', 'Figures 1, 3, and 8: selection, programming, and read; Figures 12–15: stress and breakdown-characteristic plots') : existing.locator, limit: existing.limit };
    const s = extraSources[id];
    if (!s) throw new Error(choose(lang, `找不到操作來源：${id}`, `Unknown operation source: ${id}`));
    const idx = lang === 'zh' ? 0 : 1;
    return { id, label: s.label[idx], url: s.url, kind: choose(lang, id.includes('pat-') ? '公開專利' : '原廠研究', id.includes('pat-') ? 'Public Patent' : 'Manufacturer Research'), date: `${s.year}; ${choose(lang, '2026-09-10 查閱', '2026-09-10 accessed')}`, locator: s.locator[idx], limit: s.limit[idx] };
  });
}

function legend(lang, { holes = false, otp = false, trap = false } = {}) {
  const l = (zh, en) => choose(lang, zh, en);
  return [
    { symbol: 'e−', meaning: l('藍色負號代表電子；藍色箭頭為電子移動方向。', 'Blue minus signs are electrons; blue arrows show electron motion.') },
    ...(holes ? [{ symbol: 'h+', meaning: l('紅色正號代表電洞；紅色箭頭為電洞移動方向。', 'Red plus signs are holes; red arrows show hole motion.') }] : []),
    { symbol: 'E / I', meaning: l('橙色 E 為電場；綠色 I 為傳統電流，與電子移動相反。', 'Orange E is electric field; green I is conventional current, opposite to electron motion.') },
    { symbol: 'V_P / V_E / V_R', meaning: l('分別為寫入、抹除與讀取偏壓符號；不是可直接採用的數值規格。', 'Symbolic program, erase, and read biases; these are not numerical operating specifications.') },
    { symbol: 'FLT / 0', meaning: l('FLT 為浮接；0 為本圖所選參考電位。', 'FLT means floating; 0 is the reference potential chosen for the diagram.') },
    { symbol: otp ? 'R / I_R' : trap ? 'CTL / Vₜ' : 'FG / Vₜ', meaning: otp ? l('以低場讀電流辨識電阻；未指定邏輯 0／1 編碼。', 'Low-field read current distinguishes resistance; no logic-0/1 encoding is assigned.') : trap ? l('CTL 為絕緣捕捉層；Vₜ 為讀取臨界電壓。黃層為介電層。', 'CTL is the insulating charge-trap layer; Vₜ is read threshold. Yellow layers are dielectrics.') : l('FG 為無直流接點的浮動閘極；Vₜ 為臨界電壓。黃層為介電層。', 'FG is a floating gate without a DC terminal; Vₜ is threshold. Yellow layers are dielectrics.') },
  ];
}

function thresholdPlot(ctx, erase = false) {
  const { arrow, l } = ctx;
  return path('M49 32V220H327') + text(31, 40, 'I') + text(320, 250, 'V_G')
    + path('M66 213Q114 213 138 173T183 53', C.current, 4) + path('M120 216Q198 214 220 174T266 62', C.electron, 4)
    + path('M184 35V220', C.field, 2, 'stroke-dasharray="6 5"') + text(184, 25, 'V_R')
    + text(112, 88, l('電子少', '|Q| small')) + text(276, 193, l('電子多', '|Q| large'))
    + arrow(erase ? 'M270 237H204' : 'M207 237H268', 'field') + text(108, 250, erase ? 'Vₜ ↓' : 'Vₜ ↑');
}

function planar(ctx, kind, operation, phase) {
  const { l, arrow } = ctx;
  const trap = ['sonos', 'nrom', 'nrom-hole'].includes(kind);
  const split = ['superflash', 'well-ssi'].includes(kind);
  const local = ['nrom', 'nrom-hole'].includes(kind);
  const erase = operation === 'erase', read = operation === 'read';
  const active = phase === 1 || phase === 2;
  const loaded = read || (erase ? phase < 3 : phase === 3);
  if (read && phase === 3) return thresholdPlot(ctx);
  const gate = active ? read ? (split ? 'SG = V_R' : 'G = V_R') : erase ? (kind === 'well-ssi' ? 'SG = FLT' : kind === 'superflash' ? 'WL +V_E' : 'G − V_E') : (split ? 'SG = V_ON' : 'G + V_P') : split ? 'SG / WL' : 'G';
  let s = rect(26, 169, 308, 64, C.silicon) + rect(36, 169, 69, 29, C.doped) + rect(255, 169, 69, 29, C.doped);
  s += rect(80, 148, 200, 21, C.oxide);
  if (split) {
    if (kind === 'superflash') {
      s += rect(174, 109, 106, 39, C.oxide) + `<path d="M98 73H245V109H174V147H98Z" fill="${C.metal}" stroke="${C.ink}" stroke-width="1.4"/>` + rect(183, 122, 97, 26, C.fg);
      s += text(135, 139, 'SG') + text(190, 96, 'WL') + (phase === 2 ? '' : text(201, 145, 'FG'));
    } else {
      s += rect(98, 113, 85, 35, C.oxide) + rect(98, 118, 77, 29, C.metal) + `<path d="M122 86H276V148H183V113H122Z" fill="${C.fg}" stroke="${C.ink}" stroke-width="1.4"/>`;
      s += text(136, 140, 'SG') + text(226, 108, 'FG');
    }
  } else {
    s += rect(80, 112, 200, 36, trap ? C.trap : C.fg) + rect(80, 94, 200, 18, C.oxide) + rect(80, 66, 200, 28, C.metal);
    s += text(180, 87, 'G') + text(trap ? 180 : 217, 137, trap ? 'CTL' : 'FG');
    if (kind === 'window') s += rect(169, 148, 33, 13, C.fg) + rect(169, 161, 33, 8, C.oxide);
  }
  s += (kind === 'well-ssi' ? path('M136 35H51V130H98') : wire(split ? 136 : 180, 35, split ? 76 : 66)) + text(180, 27, gate);
  const reversedRead = kind === 'nrom';
  const leftName = split ? 'D' : 'S';
  const rightName = split ? 'S' : 'D';
  let leftBias = '', rightBias = '';
  if (active) {
    if (read) { leftBias = reversedRead ? '+V_R' : '0'; rightBias = reversedRead ? '0' : '+v'; if (split) { leftBias = '+v'; rightBias = '0'; } }
    else if (erase) { leftBias = kind === 'well-ssi' ? 'FLT' : kind === 'stacked' ? '+V_E' : '0'; rightBias = kind === 'well-ssi' ? 'FLT' : kind === 'nrom-hole' ? '+V_E' : '0'; }
    else { leftBias = '0'; rightBias = split || ['stacked', 'nrom'].includes(kind) ? '+V_P' : '0'; }
  }
  s += text(64, 258, `${leftName}${leftBias ? ` ${leftBias}` : ''}`) + text(293, 258, `${rightName}${rightBias ? ` ${rightBias}` : ''}`);
  s += text(69, 191, 'n+') + text(303, 191, 'n+') + wire(69, 199, 237) + wire(289, 199, 237);
  if (kind === 'well-ssi') s += rect(128, 207, 111, 25, '#8eacc7') + text(183, 226, erase && active ? 'W +V_E' : 'P-WELL');
  else s += text(181, 221, active && erase && kind === 'nrom-hole' ? 'BBT' : 'p-Si');
  if (kind === 'nrom-hole') s += `<path d="M233 170H255V207Q228 209 233 170Z" fill="#8f80b5" stroke="${C.ink}" stroke-width="1.3"/>` + text(282, 227, 'P+');
  if (loaded) s += charge(local ? [243, 264] : kind === 'superflash' ? [234, 262] : split ? [210, 243] : [112, 244], 132);
  if (phase === 1 && !read) {
    s += arrow(erase && kind !== 'superflash' ? 'M307 156V81' : 'M307 81V156', 'field') + text(328, 122, 'E');
    if (kind === 'nrom-hole') s += `<ellipse cx="250" cy="181" rx="24" ry="17" fill="none" stroke="${C.hole}" stroke-width="3"/>`;
  }
  if (phase === 2) {
    if (read) {
      const forward = reversedRead || split;
      s += (reversedRead ? arrow('M284 181H266') + block(244, 179) : arrow(forward ? 'M248 181H210' : 'M112 181H150') + block(183, 179)) + text(180, 60, 'I_R ↓');
    } else if (erase) {
      if (kind === 'superflash') s += arrow('M220 134Q231 116 218 87') + dot(229, 105) + text(310, 110, 'FN');
      else if (kind === 'nrom-hole') s += dot(249, 194, true) + arrow('M250 189Q222 173 245 138', 'hole') + dot(247, 160, true) + arrow('M260 170H285') + dot(273, 184);
      else if (kind === 'sonos') s += arrow('M130 188V143', 'hole') + dot(130, 165, true) + dot(230, 176, true) + text(313, 111, 'FN');
      else { const x = kind === 'stacked' ? 95 : kind === 'well-ssi' ? 225 : 185; s += arrow(`M${x} 132V190`) + dot(x, 162) + text(314, 111, 'FN'); }
    } else if (['stacked', 'nrom', 'superflash', 'well-ssi'].includes(kind)) {
      const injectX = split ? 185 : 246;
      s += arrow(`M107 180H${injectX}`) + arrow(`M${injectX} 181Q${injectX + 14} 164 ${injectX + 9} 137`) + dot(injectX + 10, 155);
      s += `<ellipse cx="${injectX}" cy="181" rx="19" ry="10" fill="none" stroke="${C.field}" stroke-width="3"/>` + text(305, 57, split ? 'SSI' : 'CHE');
    } else {
      const x = kind === 'window' ? 185 : 130;
      s += arrow(`M${x} 192V131`) + dot(x, 163) + (kind === 'sonos' ? dot(236, 161) + arrow('M236 192V134') : '') + text(314, 111, 'FN');
    }
  }
  if (phase === 3) s += text(308, 56, erase ? 'Vₜ ↓' : 'Vₜ ↑') + (erase ? dot(local ? 244 : kind === 'superflash' ? 234 : split ? 208 : 112, 132, kind === 'sonos', 'stored') : '');
  return s;
}

function singlePoly(ctx, operation, phase) {
  const { l, arrow } = ctx;
  const read = operation === 'read', erase = operation === 'erase', active = phase === 1 || phase === 2;
  if (read && phase === 3) return thresholdPlot(ctx);
  let s = rect(23, 175, 93, 56, C.silicon) + rect(145, 175, 190, 56, C.silicon);
  s += rect(35, 182, 69, 24, C.doped) + rect(29, 149, 81, 26, C.oxide);
  s += rect(151, 175, 40, 30, C.doped) + rect(292, 175, 36, 30, C.doped);
  s += rect(157, 163, 76, 12, C.oxide) + rect(233, 145, 87, 30, C.oxide);
  s += `<path d="M29 122H320V145H233V163H157V149H29Z" fill="${C.fg}" stroke="${C.ink}" stroke-width="1.5"/>`;
  s += text(73, 146, 'FG') + text(70, 201, 'CG n+') + text(191, 144, 'FG');
  s += text(166, 196, 'n+') + text(310, 196, 'n+') + text(240, 225, 'p-Si');
  s += path('M127 111V234', '#7c8996', 1.5, 'stroke-dasharray="4 5"') + text(178, 39, l('同一浮動導體', 'One Floating Gate'));
  s += text(67, 255, active ? erase ? 'CG = V_C' : read ? 'CG = V_R' : 'CG +V_P' : 'CG') + wire(68, 207, 235);
  s += text(174, 255, active && erase ? 'S +V_E' : active && read ? 'S +v' : 'S 0') + wire(172, 206, 235);
  s += text(300, 255, active && !erase && !read ? 'D +V_P' : 'D 0') + wire(310, 206, 235);
  const loaded = read || (erase ? phase < 3 : phase === 3);
  if (loaded) s += charge([102, 264], 134);
  if (phase === 1) s += arrow('M80 179V157', 'field', true) + text(78, 101, 'C_CG');
  if (phase === 2) {
    if (read) s += arrow('M285 183H264') + block(243, 182) + text(243, 82, 'I_R ↓');
    else if (erase) s += arrow('M181 144V191') + dot(182, 165) + text(183, 84, 'FN → S');
    else s += arrow('M199 183H275') + arrow('M278 182Q295 160 281 137') + dot(290, 159) + text(280, 85, 'CHE');
  }
  if (phase === 3) s += text(266, 82, erase ? 'Vₜ ↓' : 'Vₜ ↑') + (erase ? dot(102, 134, false, 'stored') : '');
  return s;
}

function fuse(ctx, kind, operation, phase) {
  const { l, arrow } = ctx;
  const antifuse = kind === 'antifuse', via = kind === 'via', erase = operation === 'erase', read = operation === 'read';
  const changed = erase ? phase > 0 : read ? true : phase >= 2;
  let s = '';
  if (antifuse) {
    s += rect(55, 177, 250, 49, C.silicon) + rect(69, 144, 222, 33, C.oxide) + rect(69, 108, 222, 36, C.metal);
    s += text(111, 133, 'G / C') + text(180, 212, l('Si／內部節點', 'Si / Internal Node')) + wire(180, 54, 108) + wire(180, 226, 244);
    if (changed) s += path('M181 143l-7 9 12 8-7 18', C.hole, 8);
    else s += text(180, 168, l('完整介電層', 'Intact Dielectric'));
    if (!erase && phase === 1) s += arrow('M321 112V178', 'field') + text(330, 102, 'E');
    if (!erase && phase === 2) s += arrow('M186 185V135') + dot(181, 157);
    const banner = erase && phase === 2 ? l('無合格反向操作', 'No Qualified Reverse') : read && phase === 2 ? 'I_R ↑' : operation === 'write' && phase === 3 ? 'V_R; I_R ↑' : !erase && phase === 1 ? (read ? 'V_R' : '+V_P') : changed ? 'R ↓' : 'R ↑';
    s += text(181, 35, banner);
  } else if (via) {
    s += rect(52, 149, 255, 81, C.oxide) + rect(44, 172, 137, 34, C.metal) + rect(181, 79, 128, 35, C.metal) + rect(163, 113, 38, 77, C.metal);
    if (changed) s += rect(166, 169, 29, 17, C.oxide);
    s += text(103, 165, 'A') + text(268, 69, 'K') + text(288, 255, changed ? 'R ↑' : 'R ↓');
    if (!erase && phase === 1) s += arrow('M122 185H180V128', 'current') + text(95, 121, read ? 'I_R' : 'I_P');
    if (!erase && phase === 2) s += (read ? block(183, 176, 12) : arrow('M183 124V158') + dot(183, 143) + path('M216 143q-12 8 0 16t0 16', C.field, 3)) + text(95, 107, l('缺口', 'Gap'));
  } else {
    s += rect(30, 165, 300, 56, C.oxide) + `<path d="M38 114H119L144 137H216L241 114H322V177H241L216 156H144L119 177H38Z" fill="${C.fg}" stroke="${C.ink}" stroke-width="1.5"/>`;
    s += path('M47 120H115L144 140H214L245 120H312', C.metal, 9);
    if (changed) s += path('M160 139H183', C.oxide, 13);
    s += text(64, 101, 'K') + text(296, 101, 'A') + text(181, 214, 'SiO₂');
    if (!erase && phase === 1) s += arrow('M302 68H64', 'current') + text(180, 58, read ? 'I_R' : 'I_P');
    if (!erase && phase === 2) s += (read ? block(171, 144, 12) : arrow('M179 149H229') + dot(204, 149)) + text(160, 95, l('空洞', 'Void'));
    s += text(180, 255, changed ? 'R ↑' : 'R ↓');
  }
  if (erase && phase === 2) s += block(antifuse ? 323 : 183, antifuse ? 157 : 75, antifuse ? 19 : 22) + (antifuse ? '' : text(180, 35, l('無合格反向操作', 'No Qualified Reverse')));
  if (read && phase === 2 && !antifuse) s += text(180, 35, 'I_R ↓');
  if (operation === 'write' && phase === 3 && !antifuse) s += text(180, 35, 'V_R; I_R ↓');
  if (read && phase === 3) {
    s = path('M48 42V218H325') + text(30, 41, 'I_R') + rect(88, antifuse ? 168 : 80, 67, antifuse ? 50 : 138, C.current) + rect(230, antifuse ? 80 : 168, 67, antifuse ? 138 : 50, C.electron) + text(120, 248, l('原始', 'Initial')) + text(262, 248, l('已寫入', 'Written')) + text(187, 34, 'V_R = const.');
  }
  return s;
}

function nandString(ctx, { phase = 0, operation = 'write', gidl = false, inhibit = false, offset = 0, compact = false } = {}) {
  const { l, arrow } = ctx;
  const center = compact ? 85 + offset : 188, active = phase === 1 || phase === 2 || (operation === 'read' && phase === 3);
  const left = center - 59, right = center + 44;
  let s = rect(center - 12, 50, 24, 184, C.silicon);
  for (const y of [81, 123, 165]) {
    s += rect(left, y, 15, 26, C.metal) + rect(right, y, 15, 26, C.metal);
    s += rect(center - 44, y, 6, 26, C.oxide) + rect(center + 38, y, 6, 26, C.oxide);
    s += rect(center - 38, y, 22, 26, C.trap) + rect(center + 16, y, 22, 26, C.trap);
    s += rect(center - 16, y, 4, 26, C.oxide) + rect(center + 12, y, 4, 26, C.oxide);
  }
  s += rect(center - 31, 50, 15, 18, C.metal) + rect(center - 16, 50, 4, 18, C.oxide) + rect(center - 31, 216, 15, 18, C.metal) + rect(center - 16, 216, 4, 18, C.oxide) + wire(center, 28, 50) + wire(center, 234, 241);
  if (compact) {
    s += text(center, 23, inhibit ? 'BL = V_DD' : 'BL = 0');
    s += text(center, 261, inhibit ? 'V_CH ↑' : 'V_CH = 0');
    s += inhibit ? block(center + 16, 137, 12) : dot(center + 27, 136, false, 'stored');
    return s;
  }
  let top = 'BL', bottom = 'SL';
  if (active) {
    if (operation === 'write') { top = 'BL = 0'; bottom = 'SL = 0'; }
    if (operation === 'read') { top = phase === 1 ? 'BL ← V_R' : phase === 2 ? 'BL ↓' : 'BL ≈ V_R'; bottom = 'SL = 0'; }
    if (operation === 'erase') { top = gidl ? 'BL +V_E' : 'BL = FLT'; bottom = 'SL +V_E'; }
  }
  s += text(center, 22, top) + text(center, 264, bottom);
  s += text(26, 102, active ? operation === 'erase' ? 'WL=0' : 'V_PASS' : 'WL', 'start');
  s += text(26, 143, active ? operation === 'write' ? 'V_PGM' : operation === 'read' ? 'V_R' : 'WL=0' : 'WL*', 'start');
  s += text(26, 185, active ? operation === 'erase' ? 'WL=0' : 'V_PASS' : 'WL', 'start');
  s += path(`M111 93H${left}M111 135H${left}M111 177H${left}`);
  if (operation === 'erase' && active) s += text(274, 64, gidl ? 'V_GIDL' : 'SG FLT') + text(275, 230, gidl ? 'V_GIDL' : 'SG FLT');
  else s += text(280, 61, active ? operation === 'read' ? 'SGD ON' : 'SGD +V_SG' : 'SGD') + text(280, 232, active ? operation === 'read' ? 'SGS ON' : 'SGS <0' : 'SGS');
  if (operation === 'read' && phase === 2) s += arrow(`M${center} 229V56`) + text(298, 138, 'e−');
  if (operation === 'read' && phase === 3) s += charge([center - 27, center + 27], 135) + block(center, 137) + text(299, 142, 'I_R ↓');
  if (operation === 'erase' && gidl && phase === 1) s += dot(center, 58, true) + arrow(`M${center} 73V117`, 'hole') + arrow(`M${center + 7} 59V34`) + text(287, 103, 'GIDL');
  return s;
}

function nandWall(ctx, operation, phase, gidl) {
  const { l, arrow } = ctx;
  let s = rect(38, 53, 65, 152, C.metal) + rect(103, 53, 31, 152, C.oxide) + rect(134, 53, 48, 152, C.trap) + rect(182, 53, 30, 152, C.oxide) + rect(212, 53, gidl ? 49 : 106, 152, C.silicon) + (gidl ? rect(261, 53, 57, 152, '#eef2f5') : '');
  s += text(71, 43, 'WL') + text(158, 43, 'CTL') + text(237, 43, 'CH');
  s += text(71, 230, l('閘', 'Gate')) + text(198, 230, l('穿隧', 'Tunnel')) + text(292, 230, gidl ? l('核心', 'Core') : l('柱體', 'Body'));
  const erase = operation === 'erase', loaded = erase || phase === 3;
  if (loaded) s += dot(157, 99, false, 'stored') + dot(156, 163, false, 'stored');
  if (phase === 2) {
    if (erase && gidl) s += arrow('M239 129H154', 'hole') + dot(220, 129, true) + text(180, 261, 'h+ + e− → |Q| ↓');
    else if (erase) s += arrow('M155 130H243') + dot(205, 130) + text(180, 261, 'e−: CTL → CH');
    else s += arrow('M240 130H152') + dot(203, 130) + text(180, 261, 'e−: CH → CTL');
  } else s += text(180, 260, erase ? 'Q < 0' : 'Q ≈ 0');
  return s;
}

function nandDraw(ctx, kind, operation, phase) {
  const gidl = kind === 'gidl';
  if (operation === 'write' && phase === 3) return nandString(ctx, { compact: true }) + nandString(ctx, { compact: true, inhibit: true, offset: 190 }) + path('M180 38V87M180 157V232', '#7d91a4', 1.5, 'stroke-dasharray="4 5"') + path('M144 135H216') + text(180, 119, 'V_PGM');
  if (operation === 'erase' && phase === 0) return nandWall(ctx, operation, phase, gidl);
  if (operation === 'erase' && phase === 3) return thresholdPlot(ctx, true);
  if (phase === 2 && operation !== 'read') return nandWall(ctx, operation, phase, gidl);
  return nandString(ctx, { operation, phase, gidl });
}

const variantSpecs = {
  efuse: [
    { id: 'silicide-poly', kind: 'poly', label: ['矽化物／多晶矽電熔絲', 'Silicide/Polysilicon eFuse'], sourceIds: ['ch-pat-efuse-poly'], mechanism: 'EM', note: ['局部頸部的電遷移與矽化物缺口；下層多晶矽可能仍存在，不能把高電阻一律畫成整體斷裂。', 'Electromigration opens a silicide gap at the neck; underlying polysilicon can remain, so high resistance does not imply complete physical separation.'] },
    { id: 'metal-via', kind: 'via', label: ['金屬導孔電熔絲', 'Metal-Via eFuse'], sourceIds: ['ch-pat-efuse-via'], mechanism: 'Joule', note: ['以導孔接觸處的電流聚集、局部熱與熔化分離示意；不套用矽化物電遷移的同一原子路徑。', 'Shows current crowding, local heating, and melt separation near the via; a silicide electromigration path is not substituted.'] },
  ],
  antifuse: [{ id: 'mos-breakdown', kind: 'antifuse', label: ['MOS 介電層崩潰反熔絲', 'MOS Dielectric-Breakdown Antifuse'], sourceIds: ['ch-pat-antifuse'], mechanism: 'BD', note: ['只畫儲存元件：閘極接欄線 C，矽端為內部節點；串接選擇 MOS 與陣列周邊省略，不代表完整商用 OTP 單元。', 'Storage element only: gate connects to column C, silicon to an internal node. The series select MOS and array periphery are omitted, not a complete commercial OTP cell.'] }],
  eeprom: [
    { id: 'local-window', kind: 'window', label: ['局部窗口：FN 寫入／穿隧抹除', 'Local Window: FN Program/Tunnel Erase'], sourceIds: ['ch-pat-eeprom-window'], mechanism: 'FN', note: ['依 US4115914A 明示容許的 n 通道分支，將局部窗口重繪為 n+ 接點與 p 型矽；原文多數製程圖以 p 通道為例，本圖不逐項複製該製程剖面。本序列只採穿隧變體。', 'The n-channel branch expressly permitted by US4115914A is redrawn with n+ contacts and p-type silicon. Most original process figures use a p-channel example; this is not a literal reproduction of that process section. This sequence uses tunneling only.'] },
  ],
  mtp: [
    { id: 'double-poly-window', kind: 'window', label: ['雙層多晶矽 EEPROM：局部窗口原理', 'Double-Poly EEPROM: Local-Window Principle'], sourceIds: ['ch-pat-eeprom-window'], mechanism: 'FN', note: ['本圖用 US4115914A 的控制閘極／浮動閘極及局部窗口，說明雙層多晶矽 EEPROM 路徑；並非特定 foundry 巨集的製程截面。具名製程、穿隧端及操作條件仍以供應商文件為準。', 'Uses the control/floating gates and local window in US4115914A to explain the double-poly EEPROM route. This is not a named foundry macro cross-section; process details, tunneling terminals and operating conditions remain vendor-specific.'] },
    { id: 'buried-control', kind: 'single-poly', label: ['單層多晶矽：埋入控制端 CHE／源極 FN 範例', 'Single Poly: Buried-Control CHE/Source FN Example'], sourceIds: ['ch-pat-eeprom-singlepoly'], mechanism: 'CHE / FN', note: ['US5844271A 的圖 4、5 兩個剖切方向以同一 FG 導體連結，控制端位於矽中。這是單層多晶矽結構與操作的代表教案，不代替現行各家 MTP IP 的實際單元與載子路徑。CG 抹除耦合採符號表示，未複製正文與表 2 不一致的讀取欄。', 'Figures 4 and 5 of US5844271A share one FG conductor, with control buried in silicon. This teaching example does not define current vendors’ MTP cells or carrier paths. Erase coupling remains symbolic; inconsistent read entries in Table 2 are not reproduced.'] },
  ],
  nor: [
    { id: 'stacked-che', kind: 'stacked', label: ['堆疊閘：汲極 CHE／源極 FN', 'Stacked Gate: Drain CHE/Source FN'], sourceIds: ['ch-pat-nor-splitgate'], mechanism: 'CHE / FN', note: ['對照 US6232180B1 背景中的傳統堆疊閘機制；不把它標為該案提出的新分離閘結構。', 'Corresponds to conventional stacked-gate mechanisms in the background of US6232180B1, not to its proposed split-gate invention.'] },
    { id: 'superflash-ssi', kind: 'superflash', label: ['SuperFlash：SSI／閘極間 FN', 'SuperFlash: SSI/Inter-Gate FN'], sourceIds: ['ch-tech-superflash'], mechanism: 'SSI / FN', note: ['第一代／第二代的 WL 多晶矽抹除出口；未混入第三代獨立抹除閘，也未使用另一專利的井區抹除條件。', 'WL-poly erase exit of the first/second generation; third-generation dedicated erase gates and another patent’s well-erase conditions are not substituted.'] },
    { id: 'well-erase-ssi', kind: 'well-ssi', label: ['US6232180B1：SSI／井區通道 FN', 'US6232180B1: SSI/Well-Channel FN'], sourceIds: ['ch-pat-nor-splitgate'], mechanism: 'SSI / FN', note: ['SG 在下、FG 部分覆於 SG 上；受選寫入源極較高，抹除時 SG／S／D 浮接且井區升壓。', 'SG is below an overlapping FG; source is raised for program, while SG/S/D float and the well is raised for erase.'] },
  ],
  sonos: [
    { id: 'uniform-fn', kind: 'sonos', label: ['全通道 SONOS：電子／電洞穿隧', 'Uniform SONOS: Electron/Hole Tunneling'], sourceIds: ['ch-product-sonos', 'ch-pat-sonos', 'op-pat-sonos-fn'], mechanism: 'FN', holes: true, note: ['剖面為儲存電晶體局部；英飛凌 2T 單元另有串接選擇器。載子路徑對照公開 Cypress 專利，不推定現行巨集的完整膜層。', 'Storage-transistor detail; Infineon’s 2T cell also has a series selector. Carrier paths follow the public Cypress patent without asserting a current macro’s complete stack.'] },
    { id: 'localized-nrom', kind: 'nrom', label: ['局部 NROM：CHE／反向讀取', 'Localized NROM: CHE/Reverse Read'], sourceIds: ['ch-pat-nrom'], mechanism: 'CHE', operations: ['write', 'read'], note: ['端點 S／D 始終以寫入時名稱保留；反向讀取只改偏壓與電流方向，不在無提示下交換端點名稱。', 'S/D keep their programming-time names; reverse read changes bias and current direction without silently renaming terminals.'] },
    { id: 'nrom-pocket-hhi', kind: 'nrom-hole', label: ['US6664588B2：口袋區 BBT／熱電洞抹除', 'US6664588B2: Pocket BBT/Hot-Hole Erase'], sourceIds: ['op-pat-nrom-hhi'], mechanism: 'BBT / HHI', holes: true, operations: ['erase'], note: ['對照單端口袋植入的圖 8A、9；局部電洞注入區須對準原電子區。這是獨立抹除案例，不聲稱 US5768192A 已揭露此流程。', 'Follows the one-sided pocket of Figures 8A and 9; hole injection must overlap the stored-electron region. This separate erase example is not attributed to US5768192A.'] },
  ],
  nand: [
    { id: 'vertical-electron', kind: 'vertical', label: ['US7696559B2：垂直字串與電子穿隧', 'US7696559B2: Vertical String/Electron Tunneling'], sourceIds: ['ch-pat-nand-vertical', 'ch-tech-nand'], mechanism: 'FN', note: ['字串為拓撲簡圖，局部膜層攤平展示順序。抹除依該案源線升壓／電子釋出，不宣稱此案採 GIDL 電洞注入。', 'A string topology with an unfolded local film section. Erase follows source-line raising and electron release, not an asserted GIDL hole mechanism.'] },
    { id: 'gidl-hole', kind: 'gidl', label: ['GIDL 輔助：電洞供應與捕捉層中和', 'GIDL Assist: Hole Supply/Trap Neutralization'], sourceIds: ['op-nand-hole-erase', 'op-pat-nand-gidl'], mechanism: 'GIDL / FN', holes: true, operations: ['erase'], note: ['端點正偏壓高於選擇閘以產生電子—電洞對；圖中只展開上端供應，另一端可依具名實作參與。與舊專利浮接端點條件分開。', 'A positive terminal above the select-gate potential generates electron–hole pairs. Only the upper supply is expanded; the other end depends on the example. Separate from the older floating-terminal erase.'] },
  ],
};

function frameWords(ctx, topic, spec, op, phase) {
  const { l } = ctx;
  const otp = topic === 'efuse' || topic === 'antifuse';
  const anti = topic === 'antifuse';
  if (otp) {
    if (op === 'read') return [
      [l('已寫材料仍保留', 'Written Material Retained'), l('先固定已永久改變的材料狀態，讀取不修復材料。', 'Start with permanently changed material; reading does not repair it.'), anti ? 'R ↓' : 'R ↑', l('尚未施加讀取偏壓', 'Before read bias')],
      [l('施加低場讀取', 'Apply Low-Field Read'), l('以低於寫入應力的讀取條件觀察原有路徑。', 'Observe the existing path under read conditions below program stress.'), anti ? 'R ↓' : 'R ↑', 'V_R ≪ V_P'],
      [l('量測既有電流響應', 'Measure Existing Conduction'), anti ? l('已崩潰區導電較強；其幾何與前一張相同。', 'The broken-down region conducts more strongly; its geometry is unchanged.') : l('缺口使讀電流較小；高電阻不等於理想開路。', 'The gap reduces read current; high resistance does not mean an ideal open circuit.'), anti ? 'I_R ↑' : 'I_R ↓', l('維持低場讀取', 'Maintain low-field read')],
      [l('原始與已寫分支比較', 'Compare Initial and Written Branches'), l('以相同 V_R 比較兩個既有狀態，不表示讀取改變材料。', 'Compare two pre-existing states at equal V_R; reading did not change the material.'), l('電阻窗口可辨', 'Resistance window distinguished'), 'V_R = const.'],
    ][phase];
    if (op === 'erase') return [
      [l('原始材料', 'Original Material'), l('保留尚未程式化的結構作比較。', 'Keep the unprogrammed structure as a reference.'), anti ? 'R ↑' : 'R ↓', l('未施加高場', 'No high-field pulse')],
      [l('永久改變後', 'After Permanent Change'), l('正常移除電源不會恢復原始材料。', 'Removing normal power does not restore the original material.'), anti ? 'R ↓' : 'R ↑', l('程式化已完成', 'Program pulse completed')],
      [l('反向操作不成立', 'Reverse Operation Unavailable'), l('沒有合格電抹除路徑；讀取仍辨識已改變的狀態。', 'No qualified electrical erase path exists; read still detects the changed state.'), anti ? 'I_R ↑' : 'I_R ↓', l('禁止把反向偏壓當抹除', 'Reverse bias is not an erase procedure')],
    ][phase];
    if (op === 'write') return [
      [l('建立原始路徑', 'Initial Path'), anti ? l('完整介電層阻擋低場直流。', 'Intact dielectric blocks low-field DC.') : l('完整導體提供低電阻路徑。', 'The intact conductor provides a low-resistance path.'), anti ? 'R ↑' : 'R ↓', l('未寫入', 'Unprogrammed')],
      [l('施加寫入條件', 'Apply Program Conditions'), anti ? l('在薄介電層形成高場，周邊限制應力。', 'A high field stresses the thin dielectric; periphery limits stress.') : spec.kind === 'via' ? l('電流在導孔附近聚集並產生局部熱。', 'Current crowding generates local heat near the via.') : l('電流在狹窄區聚集並產生局部熱與電遷移。', 'Current crowds at the constriction, producing local heat and electromigration.'), l('轉換前', 'Before transition'), anti ? 'V_P → E' : 'I_P → J ↑'],
      [l('形成局部永久改變', 'Local Permanent Change'), anti ? l('形成局部導電路徑，電子可穿越原介電區。', 'A local conducting path lets electrons cross the former dielectric region.') : spec.kind === 'via' ? l('導孔附近材料受熱熔化、分離並留下高電阻缺口。', 'Material near the via heats, melts, and separates, leaving a high-resistance gap.') : l('材料遷移留下局部空洞或缺口。', 'Material migration leaves a local void or gap.'), anti ? 'R ↓' : 'R ↑', l('受控寫入脈衝', 'Controlled program pulse')],
      [l('低場驗證狀態', 'Verify at Low Field'), l('移除寫入應力後，依讀電流辨識永久狀態。', 'After program stress is removed, read current identifies the permanent state.'), anti ? 'I_R ↑' : 'I_R ↓', 'V_R ≪ V_P'],
    ][phase];
  }
  if (op === 'read') return [
    [l('儲存狀態仍保留', 'Stored State Retained'), l('圖中載子代表儲存電荷，不是讀電流來源。', 'Drawn stored carriers represent data, not the source of read current.'), topic === 'nand' ? l('先讀低臨界狀態', 'Start with a low-threshold state') : 'Q < 0', l('先確認既有狀態', 'Inspect the existing state')],
    [l('建立低場讀取偏壓', 'Apply Low-Field Read Bias'), spec.kind === 'nrom' ? l('原 S 加讀偏壓、原 D 接低電位，與寫入相反。', 'Bias original S and ground original D, reversing the program direction.') : l('選擇受測路徑並施加低場讀取條件。', 'Select the measured path and apply low-field read conditions.'), l('電荷不搬離儲存層', 'Charge remains in storage'), 'V_R; |V_DS| = v'],
    [l('通道或導體響應', 'Conduction Response'), topic === 'nand' ? l('低臨界狀態及未選通過閘導通，BL 可放電；電子由 SL 往 BL。', 'A low-threshold selected cell and pass-biased neighbors permit BL discharge; electrons travel SL to BL.') : l('同一讀偏壓下，儲存狀態決定感測電流。', 'The stored state determines sense current under the same read bias.'), topic === 'nand' ? 'I_R ↑' : otp ? (anti ? 'I_R ↑' : 'I_R ↓') : 'I_R ↓', l('正常讀取場', 'Normal read field')],
    [l('比較感測結果', 'Compare Sense Results'), topic === 'nand' ? l('比較分支：高臨界受選單元阻斷字串；這不是讀取造成電荷改變。', 'Comparison branch: a high-threshold selected cell blocks the string; reading did not change its charge.') : l('以相同讀取條件比較不同儲存狀態；不指定邏輯編碼。', 'Compare stored states under equal read conditions; logic encoding is not assigned.'), l('可分辨讀取窗口', 'Distinguishable read window'), 'V_R = const.'],
  ][phase];
  if (topic === 'nand' && op === 'write') return [
    [l('先辨識串接單元', 'Identify the String'), l('WL* 是目標層，SGD／SGS 決定端點連通。', 'WL* identifies the target level; SGD/SGS control terminal access.'), 'Q ≈ 0', l('尚未施加寫入脈衝', 'Before the program pulse')],
    [l('設定受選通道', 'Bias the Selected Channel'), l('BL=0 維持低通道電位；目標 WL 加 V_PGM，其餘加 V_PASS。', 'BL=0 keeps the selected channel low; target WL receives V_PGM and neighbors V_PASS.'), 'V_CH ≈ 0', 'V_PGM > V_PASS'],
    [l('電子穿入儲存層', 'Electrons Enter Storage'), l('局部展開 CH→穿隧介電層→CTL，電子留在絕緣捕捉層。', 'The local section traces CH through tunnel dielectric into CTL, where electrons are trapped.'), 'Q < 0; Vₜ ↑', 'V_WL > V_CH'],
    [l('受選與抑制對照', 'Selected versus Inhibited'), l('左側低通道可寫入；右側 BL=V_DD 後通道浮接升壓，降低穿隧場。', 'The low channel at left programs; BL=V_DD at right precharges a floating, boosted channel and reduces tunneling field.'), l('左：寫入；右：保留', 'Left: program; right: retain'), l('相同 V_PGM，不同 V_CH', 'Same V_PGM, different V_CH')],
  ][phase];
  const erase = op === 'erase';
  const hole = erase && ['sonos', 'nrom-hole', 'gidl'].includes(spec.kind);
  const motion = erase ? hole ? l('電洞進入捕捉層，降低儲存淨負電荷。', 'Holes enter the trap layer and reduce net stored negative charge.') : l('電子經本變體指定出口離開儲存層。', 'Electrons leave storage through this variant’s specified exit.') : ['stacked', 'nrom', 'superflash', 'well-ssi', 'single-poly'].includes(spec.kind) ? l('通道電子先加速，再由局部高場注入儲存區。', 'Channel electrons accelerate before local injection into storage.') : l('電子穿越局部能障，進入隔離儲存區。', 'Electrons tunnel through the local barrier into isolated storage.');
  const stimulus = erase ? spec.kind === 'well-ssi' ? 'SG/S/D = FLT; W +V_E' : spec.kind === 'gidl' ? 'V_BL/SL > V_GIDL; WL = 0' : spec.kind === 'vertical' ? 'SL +V_E; BL/SG = FLT' : spec.kind === 'nrom-hole' ? 'G −V_E; D +V_E' : spec.kind === 'single-poly' ? 'V_S > V_FG' : spec.kind === 'superflash' ? 'V_WL > V_FG' : 'V_G < V_CH' : ['superflash', 'well-ssi'].includes(spec.kind) ? 'SG = V_ON; S +V_P; D = 0' : ['stacked', 'single-poly', 'nrom'].includes(spec.kind) ? 'G/CG +V_P; D +V_P; S = 0' : 'V_G > V_CH';
  return [
    [l('已知初始電荷', 'Known Initial Charge'), erase ? l('先定位程式化電荷及本變體的指定出口。', 'Locate programmed charge and this variant’s exit.') : l('隔離儲存區位於可程式化的初始窗口。', 'Isolated storage starts within its programmable window.'), erase ? 'Q < 0; Vₜ ↑' : 'Q ≈ 0', l('未施加操作脈衝', 'Before the operation pulse')],
    [l('建立指定電場', 'Establish the Required Field'), spec.kind === 'nrom-hole' ? l('負閘極與正汲極在口袋接面形成 BBT 及局部高場。', 'Negative gate and positive drain establish BBT and a local field at the pocket junction.') : spec.kind === 'gidl' ? l('正端點高於選擇閘，分離電子與電洞；電洞送入通道。', 'A positive terminal above the select gate separates electron–hole pairs and supplies channel holes.') : l('端點條件只屬目前具名變體。', 'Terminal conditions belong only to the named variant.'), erase ? 'Q < 0' : 'Q ≈ 0', stimulus],
    [hole ? l('電洞供應與中和', 'Hole Supply and Neutralization') : l('追蹤電子傳輸', 'Track Electron Transfer'), motion, erase ? 'Q → 0' : 'Q < 0', stimulus],
    [l('移除高場並驗證', 'Remove High Field and Verify'), l('狀態移入目標窗口；圖中不把殘留電荷或缺陷假設為零。', 'The state shifts toward its target window; residual charge and defects are not assumed absent.'), erase ? 'Vₜ ↓' : 'Vₜ ↑', l('低場讀取驗證', 'Low-field read verification')],
  ][phase];
}

/**
 * 產生具名、雙語的物理操作序列；供網站建置時使用，不修改來源資料。
 * @param {string} topicId
 * @param {string} operationId
 * @param {string} [language='en']
 * @returns {OperationPlate|null}
 */
export function operationPlate(topicId, operationId, language = 'en') {
  if (!topics.has(topicId) || !['write', 'erase', 'read'].includes(operationId)) return null;
  const lang = language.startsWith('zh') ? 'zh' : 'en';
  const l = (zh, en) => choose(lang, zh, en);
  const topic = data[lang].topics.find(t => t.id === topicId);
  const operation = topic.operations.find(o => o.id === operationId);
  const specs = variantSpecs[topicId].filter(spec => !spec.operations || spec.operations.includes(operationId));
  const otp = ['efuse', 'antifuse'].includes(topicId);
  const variants = specs.map(spec => {
    const title = spec.label[lang === 'zh' ? 0 : 1];
    const frames = Array.from({ length: otp && operationId === 'erase' ? 3 : 4 }, (_, phase) => {
      const id = `op-${topicId}-${operationId}-${spec.id}-${phase + 1}-${lang}`;
      const ctx = drawingContext(id, lang);
      const [frameTitle, caption, state, stimulus] = frameWords(ctx, topicId, spec, operationId, phase);
      const body = otp ? fuse(ctx, spec.kind, operationId, phase) : topicId === 'nand' ? nandDraw(ctx, spec.kind, operationId, phase) : spec.kind === 'single-poly' ? singlePoly(ctx, operationId, phase) : planar(ctx, spec.kind, operationId, phase);
      return { id, title: frameTitle, caption, state, stimulus, svg: wrapSvg(id, `${title} — ${frameTitle}. ${caption}`, body), sourceIds: [...spec.sourceIds] };
    });
    return { id: spec.id, title, summary: spec.note[lang === 'zh' ? 0 : 1], mechanism: spec.mechanism, frames, legend: legend(lang, { holes: spec.holes, otp, trap: ['sonos', 'nand'].includes(topicId) }), sources: sources(spec.sourceIds, lang), caveat: l('公開來源重繪的原理圖；非按比例製程截面。箭頭代表本圖載子或電場，數值設計須另查具體元件規格。', 'A principle drawing redrawn from public sources, not a process cross-section to scale. Arrows represent the stated carrier or field; numerical design requires device-specific specifications.') };
  });
  const first = variants[0];
  // 最外層 frames 與第一個具名變體相同；整合介面只需遍歷 variants。
  return { title: operation.title, summary: operation.explanation, variant: variants.map(v => v.title).join(' / '), frames: first.frames, legend: first.legend, sources: sources([...topic.sourceIds, ...specs.flatMap(s => s.sourceIds)], lang), caveat: l('每個具名變體有自己的單元結構、端點與指定操作條件；比較時須保留完整操作序列及來源。', 'Each named variant has its own cell structure, terminals, and specified operating conditions; preserve the complete sequence and source when comparing.'), variants };
}
