/** @typedef {{id:string,label:string,url:string,kind:string,date:string,locator:string,limit:string}} Source */
/** @typedef {{symbol:string,meaning:string}} Legend */
/** @typedef {{id:string,title:string,state:string,stimulus:string,caption:string,svg:string,sourceIds:string[]}} Frame */
/** @typedef {{id:string,title:string,mechanism:string,summary:string,frames:Frame[],legend:Legend[],sources:Source[],caveat:string}} Variant */
/** @typedef {{topicId:string,operationId:string,title:string,summary:string,sources:Source[],variants:Variant[]}} Operation */
/** @typedef {{id:string,structure:{title:string,svg:string,caption:string,legend:Legend[],sourceIds:string[]},operations:Operation[]}} IPStudy */

const sourceRegistry = {
  "zh": [
    {
      "id": "ymc-product",
      "label": "YMC：ymtp 邏輯製程 MTP IP",
      "url": "https://www.ymc.com.tw/index_en.php",
      "kind": "原廠公開資料",
      "date": "未標示；2026-09-10 查核",
      "locator": "About YMC 段落",
      "limit": "確認產品定位；未公開特定版本單元與寫抹偏壓。"
    },
    {
      "id": "ymc-1t1c",
      "label": "YMC：1T1C 核心技術",
      "url": "https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25",
      "kind": "原廠公開資料",
      "date": "2024；2026-09-10 查核",
      "locator": "上市前業績發表會第 25 頁",
      "limit": "確認 1T1C 技術家族及多代演進；未支撐本圖是現行產品剖面。"
    },
    {
      "id": "ymc-pat-7423903",
      "label": "YMC：單一浮動閘極歷史實施例",
      "url": "https://patents.google.com/patent/US7423903B2/en",
      "kind": "公開專利",
      "date": "2008-09-09；2026-09-10 查核",
      "locator": "圖 1、2A、2B；第一實施例；Summary 的 FN 抹除段",
      "limit": "四端 nMOS／N 型電容結構；正文使用 FN 抹除，不作 BBHH 來源。"
    },
    {
      "id": "ymc-pat-dahhi",
      "label": "YMC：DAHCI 寫入與 DAHHI 抹除變體",
      "url": "https://patents.google.com/patent/US20070158733A1/en",
      "kind": "公開專利",
      "date": "2007-07-12；2026-09-10 查核",
      "locator": "圖 3B、5A、6B、8A 及相鄰說明",
      "limit": "支持熱載子與閾值方向；雪崩熱電洞 DAHHI 不等於 BBHH。"
    },
    {
      "id": "physics-bbhh-fg",
      "label": "Wu 等：BBHH 與浮動閘極展示",
      "url": "https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/",
      "kind": "原始研究",
      "date": "2007；2026-09-10 查核",
      "locator": "IEDM 2007，頁 87–90；作者機構摘要；DOI 10.1109/IEDM.2007.4418870",
      "limit": "原文使用 BBHH 並提及浮動閘極展示；其 NAND、IIHE 寫入與數值不移入 YMC 模型。"
    },
    {
      "id": "physics-btbt-carriers",
      "label": "Chu、Wu：BTBT 熱載子路徑",
      "url": "https://ir.lib.nycu.edu.tw/bitstream/11536/30685/1/000085620800010.pdf",
      "kind": "原始研究",
      "date": "2000-03；2026-09-10 查核",
      "locator": "IEEE EDL 21(3)，頁 123 Introduction；頁 125 圖 4；DOI 10.1109/55.823576",
      "limit": "支撐矽內 BBT 載子產生與場輔助注入物理；圖 3 是 pMOS，不照搬至 nMOS。"
    },
    {
      "id": "physics-fg-hole-erase",
      "label": "IEEE：浮動閘極熱電洞抹除觀察",
      "url": "https://ieeexplore.ieee.org/document/748914/",
      "kind": "原始研究",
      "date": "1999-03；2026-09-10 查核",
      "locator": "IEEE EDL 20(3)，頁 140–142；摘要；DOI 10.1109/55.748914",
      "limit": "觀察 FN 抹除中的 BBT／可能雪崩增強；只支持 FG 熱電洞物理，不當作純 BBHH 配方。"
    },
    {
      "id": "ymc-pat-8218369",
      "label": "YMC：DAHHI 低壓抹除實施例",
      "url": "https://patents.google.com/patent/US8218369B2/en",
      "kind": "公開專利",
      "date": "2012-07-10；2026-09-10 查核",
      "locator": "Detailed Description 的 n-channel 段；Vd−Vdsat 熱電洞能量",
      "limit": "本案明載 DAHHI；不重新命名為 BBHH，也不代用為現行 ymtp 偏壓表。"
    },
    {
      "id": "ymc-pat-common-terminal",
      "label": "YMC：共用控制端與源極端變體",
      "url": "https://patents.google.com/patent/US9281312B2/en",
      "kind": "公開專利",
      "date": "2016-03-08；2026-09-10 查核",
      "locator": "圖 1、2A、2B；第一實施例",
      "limit": "獨立三端歷史變體；不併入四端 CHI／BBHH 教學模型。"
    }
  ],
  "en": [
    {
      "id": "ymc-product",
      "label": "YMC: Logic-Process ymtp MTP IP",
      "url": "https://www.ymc.com.tw/index_en.php",
      "kind": "Manufacturer Information",
      "date": "Undated; accessed 2026-09-10",
      "locator": "About YMC paragraph",
      "limit": "Confirms product positioning; no cell or operating-bias disclosure for a specific version."
    },
    {
      "id": "ymc-1t1c",
      "label": "YMC: 1T1C Core Technology",
      "url": "https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25",
      "kind": "Manufacturer Information",
      "date": "2024; accessed 2026-09-10",
      "locator": "Pre-listing business presentation, page 25",
      "limit": "Confirms a 1T1C family and multiple generations; does not establish this model as a current product cross-section."
    },
    {
      "id": "ymc-pat-7423903",
      "label": "YMC: Historical Single-Floating-Gate Example",
      "url": "https://patents.google.com/patent/US7423903B2/en",
      "kind": "Public Patent",
      "date": "2008-09-09; accessed 2026-09-10",
      "locator": "Figures 1, 2A and 2B; first embodiment; FN erase in Summary",
      "limit": "Four-terminal nMOS/N-type capacitor example; its stated FN erase is not evidence for BBHH."
    },
    {
      "id": "ymc-pat-dahhi",
      "label": "YMC: DAHCI Program and DAHHI Erase Variant",
      "url": "https://patents.google.com/patent/US20070158733A1/en",
      "kind": "Public Patent",
      "date": "2007-07-12; accessed 2026-09-10",
      "locator": "Figures 3B, 5A, 6B and 8A with adjacent description",
      "limit": "Supports hot-carrier and threshold directions; avalanche-based DAHHI is distinct from BBHH."
    },
    {
      "id": "physics-bbhh-fg",
      "label": "Wu et al.: BBHH and Floating-Gate Demonstration",
      "url": "https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/",
      "kind": "Original Research",
      "date": "2007; accessed 2026-09-10",
      "locator": "IEDM 2007, pages 87–90; author-institution abstract; DOI 10.1109/IEDM.2007.4418870",
      "limit": "Uses BBHH and reports a floating-gate demonstration; its NAND structure, IIHE programming and values are not transferred to the YMC model."
    },
    {
      "id": "physics-btbt-carriers",
      "label": "Chu and Wu: BTBT Hot-Carrier Paths",
      "url": "https://ir.lib.nycu.edu.tw/bitstream/11536/30685/1/000085620800010.pdf",
      "kind": "Original Research",
      "date": "2000-03; accessed 2026-09-10",
      "locator": "IEEE EDL 21(3), page 123 Introduction; page 125 Figure 4; DOI 10.1109/55.823576",
      "limit": "Supports silicon BBT carrier generation and field-assisted injection; Figure 3 is pMOS and is not copied into the nMOS model."
    },
    {
      "id": "physics-fg-hole-erase",
      "label": "IEEE: Hot-Hole Injection into a Floating Gate",
      "url": "https://ieeexplore.ieee.org/document/748914/",
      "kind": "Original Research",
      "date": "1999-03; accessed 2026-09-10",
      "locator": "IEEE EDL 20(3), pages 140–142; abstract; DOI 10.1109/55.748914",
      "limit": "Observes BBT/possible avalanche enhancement during FN erase; used only for floating-gate hot-hole physics, not a pure-BBHH recipe."
    },
    {
      "id": "ymc-pat-8218369",
      "label": "YMC: Low-Voltage DAHHI Erase Example",
      "url": "https://patents.google.com/patent/US8218369B2/en",
      "kind": "Public Patent",
      "date": "2012-07-10; accessed 2026-09-10",
      "locator": "Detailed Description, n-channel paragraph; hot-hole energy from Vd−Vdsat",
      "limit": "Explicitly DAHHI; not renamed BBHH or used as the operating table for current ymtp."
    },
    {
      "id": "ymc-pat-common-terminal",
      "label": "YMC: Common Control/Source Terminal Variant",
      "url": "https://patents.google.com/patent/US9281312B2/en",
      "kind": "Public Patent",
      "date": "2016-03-08; accessed 2026-09-10",
      "locator": "Figures 1, 2A and 2B; first embodiment",
      "limit": "A separate three-terminal historical variant; not merged into the four-terminal teaching model."
    }
  ]
};

const C = { ink: '#16334c', silicon: '#d7e6f0', doped: '#92b6cf', oxide: '#f6e9bf', fg: '#d6bd81', electron: '#075f9d', hole: '#b52f43', current: '#087766', white: '#fff', panel: '#f7f9fc' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tx = (x, y, value, size = 22, color = C.ink, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="600" fill="${color}">${esc(value)}</text>`;
const line = (d, color = C.ink, width = 2, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const box = (x, y, width, height, fill, extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${C.ink}" stroke-width="1.5" ${extra}/>`;
const particle = (x, y, hole = false) => `<circle cx="${x}" cy="${y}" r="10" fill="${hole ? C.hole : C.electron}"/>${tx(x, y + 7, hole ? '+' : '−', 20, C.white)}`;
const phrase = (language, zh, en) => language === 'en' ? en : zh;

/** @param {string[]} ids @param {'zh'|'en'} language @returns {Source[]} */
function sources(ids, language) {
  const byId = new Map(sourceRegistry[language].map(source => [source.id, source]));
  return [...new Set(ids)].map(id => {
    const source = byId.get(id);
    if (!source) throw new Error(`缺少 YMC 圖解來源：${id}`);
    return { ...source };
  });
}

/** @param {'zh'|'en'} language @returns {Legend[]} */
function legend(language) {
  const l = (zh, en) => phrase(language, zh, en);
  return [
    { symbol: 'FG / Cc / CG', meaning: l('FG 是無直流接點的浮動閘極；Cc 是功能耦合電容，CG 是其外部控制端。', 'FG is a floating gate with no DC terminal. Cc is a functional coupling capacitor; CG is its external control terminal.') },
    { symbol: 'N+ / p / B', meaning: l('N+ 是模型源／汲極，p 是 nMOS 的本體，B 為本體端；未指定濃度、井配置或尺寸。', 'N+ denotes model source/drain regions, p the nMOS body, and B its terminal. Concentrations, well layout and dimensions are unspecified.') },
    { symbol: 'S / D*', meaning: l('S 是模型源極；D* 是本圖選定的高場端與模型汲極，不是 ymtp 巨集腳位對照。', 'S is the model source. D* is the selected high-field end and model drain, not a ymtp macro-pin mapping.') },
    { symbol: 'e− / h+', meaning: l('藍色 e− 與箭頭代表電子，紅色 h+ 與箭頭代表電洞；粒子數與動畫速度不代表物理量。', 'Blue e− and arrows represent electrons; red h+ and arrows represent holes. Particle counts and animation speed are qualitative.') },
    { symbol: 'I / I_R / Iref', meaning: l('綠色 I 是傳統電流，方向與電子相反；I_R 為讀取電流，Iref 為判讀參考。', 'Green I is conventional current, opposite to electron motion. I_R is read current and Iref is the sensing reference.') },
    { symbol: 'BBT / BBHH', meaning: l('BBT 是矽內能帶間穿隧；BBHH 是其產生電洞後的熱電洞注入。跨介電層的注入是後一步。', 'BBT is band-to-band tunneling in silicon. BBHH uses the resulting holes for hot-hole injection; crossing the dielectric is a subsequent step.') },
    { symbol: 'Vth / QFG', meaning: l('Vth 為等效 nMOS 閾值，QFG 為 FG 電荷；偏壓、讀取窗口與邏輯 0／1 僅由實際產品定義。', 'Vth is the effective nMOS threshold and QFG is FG charge. The actual product defines biases, sensing margins and logic encoding.') },
  ];
}

/** @param {string} prefix @param {string} label @param {string} body @returns {string} */
function wrap(prefix, label, body) {
  const defs = ['electron', 'hole', 'current', 'ink'].map(kind => `<marker id="${prefix}-${kind}" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L9 5.5L1 10" fill="none" stroke="${C[kind]}" stroke-width="2"/></marker>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 390" role="img" aria-labelledby="${prefix}-title" style="font-family:Arial,'Microsoft JhengHei',sans-serif;background:${C.panel}"><title id="${prefix}-title">${esc(label)}</title><defs>${defs}</defs>${body}</svg>`;
}

/** @param {string} value @param {'zh'|'en'} language @returns {string} */
function footerLines(value, language) {
  const units = language === 'en' ? value.split(' ') : [...value];
  const limit = 25;
  const visualLength = text => [...text].reduce((sum, char) => sum + (/\s/.test(char) ? 0.3 : /[\u3400-\u9fff]/.test(char) ? 1 : 0.55), 0);
  const join = language === 'en' ? ' ' : '';
  const rows = [''];
  for (const unit of units) {
    const row = rows.at(-1);
    const next = row ? row + join + unit : unit;
    if (visualLength(next) > limit && row) rows.push(unit);
    else rows[rows.length - 1] = next;
  }
  const firstY = rows.length === 1 ? 352 : 338;
  return rows.map((row, index) => tx(280, firstY + index * 24, row, 20)).join('');
}

/** @param {'zh'|'en'} language @param {'structure'|'write'|'erase'|'read'} operation @param {number} phase @param {string} label @returns {string} */
function diagram(language, operation, phase, label) {
  const l = (zh, en) => phrase(language, zh, en);
  const prefix = `ymc-${language}-${operation}-${phase}`;
  const arrow = (d, kind = 'electron', dashed = false) => line(d, C[kind], 3, `marker-end="url(#${prefix}-${kind})"${dashed ? ' stroke-dasharray="6 5"' : ''}`);
  const structure = operation === 'structure';
  const active = phase === 1 || phase === 2;
  const counts = operation === 'write' ? [1, 1, 2, 4] : [4, 4, 3, 1];
  const chargeCount = structure ? 2 : counts[phase];
  let s = tx(280, 30, structure ? l('1T1C 浮動閘極等效模型', 'Equivalent 1T1C Floating-Gate Cell') : operation === 'write' ? l('CHI · 電子寫入', 'CHI · Electron Programming') : operation === 'erase' ? l('BBHH · 熱電洞抹除', 'BBHH · Hot-Hole Erase') : l('讀取 · 電流辨識', 'Read · Current Sensing'));
  const condition = structure ? l('耦合控制與電荷儲存', 'Capacitive Control and Charge Storage') : operation === 'write' ? 'D* > S · CG → Cc → FG' : operation === 'erase' ? 'D* > B · FG < D*' : l('A／B：替代初態，相同讀取條件', 'A / B: Alternative States at the Same Read Bias');
  s += tx(280, 64, condition, 20);
  s += box(38, 208, 368, 91, C.silicon, 'rx="3"') + box(58, 208, 80, 34, C.doped) + box(306, 208, 80, 34, C.doped);
  s += box(145, 187, 170, 21, C.oxide) + box(150, 142, 160, 45, C.fg);
  s += tx(98, 233, 'N+', 20) + tx(346, 233, 'N+', 20) + tx(240, 278, 'p', 22);
  s += line('M98 208V180') + tx(98, 169, 'S') + line('M346 208V180') + tx(346, 169, 'D*');
  s += line('M65 299V282') + tx(65, 276, 'B', 20);
  s += tx(230, 131, 'FG');
  s += line('M448 101V120M416 120H480M416 143H480M448 143V154H397V108H320V165H310');
  s += tx(448, 92, 'CG') + tx(506, 140, 'Cc');
  s += line('M377 282H294', C.ink, 1.5) + tx(439, 284, l('本體', 'Body'), 20);
  if (structure) {
    s += tx(228, 106, l('封閉儲存節點', 'Isolated Storage'), 20);
    s += line('M422 194H316', C.ink, 1.5) + tx(459, 201, l('介電層', 'Dielectric'), 20);
    s += tx(226, 235, l('通道', 'Channel'), 20);
  }
  const positions = chargeCount === 1 ? [180] : chargeCount === 2 ? [180, 215] : chargeCount === 3 ? [180, 215, 250] : [172, 207, 242, 277];
  s += operation === 'read' ? tx(230, 171, 'QFG (A / B)', 20) : positions.map(x => particle(x, 165)).join('');
  let footer = structure ? l('等效模型 · 未按比例 · 無數值偏壓', 'Equivalent Model · Not to Scale · No Numerical Biases') : '';
  if (operation === 'write') {
    if (phase === 0) {
      s += line('M139 221H305', C.current, 4) + tx(223, 246, l('通道形成', 'Channel Forms'), 20);
      footer = l('CG 透過 Cc 控制 FG，沒有直流短路', 'CG Controls FG through Cc, without a DC Short');
    } else if (active) {
      s += arrow('M145 221H292') + particle(171, 221) + particle(217, 221);
      if (phase === 2) s += arrow('M288 221Q301 203 280 181') + particle(286, 200);
      s += arrow('M287 251H156', 'current') + tx(321, 259, 'I', 20, C.current);
      footer = phase === 1 ? l('e−：S → D*，高場區加速', 'e−: S → D*, Accelerated near the High-Field End') : l('部分高能電子跨介電層進入 FG', 'Some Energetic Electrons Cross the Dielectric into FG');
    } else {
      s += tx(223, 232, l('電荷保留', 'Charge Retained'), 20);
      footer = 'QFG: more e− · Vth ↑ · I_R ↓';
    }
  }
  if (operation === 'erase') {
    if (phase < 3) {
      s += `<ellipse cx="308" cy="217" rx="35" ry="30" fill="none" stroke="${C.hole}" stroke-width="2" stroke-dasharray="5 4"/>`;
      s += line('M418 249L338 230', C.ink, 1.5) + tx(454, 255, 'BBT', 22);
    }
    if (phase === 0) footer = l('反向接面與閘極場集中於模型高場端', 'Junction and Gate Fields at the Model High-Field End');
    if (phase === 1 || phase === 2) {
      s += particle(307, 217) + particle(277, 235, true) + arrow('M320 218H365') + arrow('M296 234H251', 'hole');
      if (phase === 2) s += arrow('M264 230Q268 201 256 183', 'hole') + particle(264, 202, true);
      footer = phase === 1 ? l('矽內：價帶 → 導帶，產生 e−／h+', 'In Silicon: Valence → Conduction Band; e− / h+') : l('部分 h+ 跨介電層，降低 FG 淨負電荷', 'Some h+ Cross the Dielectric, Reducing Negative FG Charge');
    }
    if (phase === 3) {
      s += tx(223, 246, '|QFG| ↓', 20);
      footer = 'QFG: fewer e− · Vth ↓ · I_R ↑';
    }
  }
  if (operation === 'read') {
    s += arrow('M284 248H161', 'current') + tx(223, 236, 'I_R ↔ Iref', 20, C.current);
  }
  s += `<rect x="10" y="315" width="540" height="62" rx="6" fill="#e8eff5"/>` + (operation === 'read'
    ? tx(280, 338, l('A：負電荷多 · Vth 高 · I_R 小', 'A: More Negative Charge · High Vth · Small I_R'), 20)
      + tx(280, 362, l('B：負電荷少 · Vth 低 · I_R 大', 'B: Less Negative Charge · Low Vth · Large I_R'), 20)
    : footerLines(footer, language));
  return wrap(prefix, label, s);
}

const wording = {
  write: {
    title: ['CHI 寫入：電子進入浮動閘極', 'CHI Program: Electrons Enter the Floating Gate'],
    mechanism: ['通道熱載子注入；nMOS 模型以電子入 FG', 'Channel Hot-Carrier Injection; Electrons Enter FG in This nMOS Model'],
    summary: ['CG 經耦合電容控制通道，電子在模型高場端加速；少數電子跨過介電層，讓儲存狀態轉為較高 Vth、較低讀取電流。', 'CG controls the channel through the coupling capacitor. Electrons accelerate near the model high-field end; a fraction crosses the dielectric, producing higher Vth and lower read current.'],
    sourceIds: ['ymc-product', 'ymc-1t1c', 'ymc-pat-7423903', 'ymc-pat-dahhi'],
    frames: [
      [['建立導通通道', 'Form the Conducting Channel'], ['FG 保有初始電荷。', 'FG holds its initial charge.'], ['CG 透過 Cc 耦合；D* 高於 S。', 'CG couples through Cc; D* is above S.'], ['CG 與 FG 隔著電容介電層；模型的源／汲極間形成電子通道。', 'CG and FG remain separated by the capacitor dielectric; an electron channel forms between the model source and drain.']],
      [['通道電子在高場區加速', 'Accelerate Channel Electrons'], ['電子從 S 沿通道向 D* 移動。', 'Electrons move from S through the channel toward D*.'], ['源／汲極電位差建立橫向場。', 'The source/drain potential difference establishes a lateral field.'], ['藍色箭頭跟隨電子；綠色箭頭表示反向的傳統電流。只有部分電子取得足夠注入能量。', 'Blue arrows follow electrons; green arrows show conventional current in the opposite direction. Only a fraction acquires sufficient injection energy.']],
      [['高能電子跨介電層入 FG', 'Inject Energetic Electrons into FG'], ['高場端的部分電子已獲能；注入區局部垂直場 E⊥ 指向矽。', 'Some high-field electrons have gained energy; local E⊥ points toward silicon at the injection region.'], ['通道加速配合局部 E⊥ 向矽，使電子受力朝 FG。', 'Channel acceleration combines with local E⊥ toward silicon, so the electron force is toward FG.'], ['局部垂直場方向是本圖的注入條件，不能只由 D* 與 S 的端點關係推定。電子跨介電層進 FG，使淨負電荷增加；這不是氧化層破裂或 CG 與 FG 的直流導通。', 'The local vertical field is an explicit injection condition, not implied by D* relative to S alone. Electrons cross the dielectric into FG and increase negative charge; this is neither oxide rupture nor a CG-to-FG DC connection.']],
      [['保留較多負電荷', 'Retain More Negative Charge'], ['注入後 FG 儲存較多電子。', 'FG stores more electrons after injection.'], ['結束寫入刺激；後續用讀取條件比較。', 'Remove program stimulation; compare later under read conditions.'], ['同一讀取偏壓下，等效 nMOS 的 Vth 較高、I_R 較小；這是電荷狀態的讀出結果。', 'At the same read bias, the effective nMOS has higher Vth and smaller I_R: the sensed consequence of its charge state.']],
    ],
  },
  erase: {
    title: ['BBHH 抹除：電洞降低 FG 淨負電荷', 'BBHH Erase: Holes Reduce Negative FG Charge'],
    mechanism: ['能帶間穿隧產生載子，再以熱電洞注入 FG', 'Band-to-Band Carrier Generation Followed by Hot-Hole Injection into FG'],
    summary: ['矽內高場區先產生電子／電洞，再由部分電洞跨介電層進入 FG。將「矽內 BBT」與「入 FG 的熱載子注入」分成兩個物理步驟。', 'A high-field region in silicon first produces electron/hole pairs. Some holes then cross the dielectric into FG. Silicon BBT and hot-carrier injection into FG are distinct physical steps.'],
    sourceIds: ['ymc-product', 'ymc-1t1c', 'physics-bbhh-fg', 'physics-btbt-carriers', 'physics-fg-hole-erase'],
    frames: [
      [['建立高場接面', 'Establish the High-Field Junction'], ['FG 保有寫入後的淨負電荷。', 'FG holds net negative charge from programming.'], ['D* 相對 B 為正；FG 相對 D* 較低。注入另需局部 E⊥ 向 FG。', 'D* is positive relative to B; FG is lower than D*. Injection also requires local E⊥ toward FG.'], ['端點關係描述模型接面條件，不能單獨保證注入區垂直場。局部 E⊥ 向 FG 是另列條件；D* 不是現行 ymtp 端點規格。', 'Terminal relationships describe the model junction condition but do not alone guarantee the local vertical field. E⊥ toward FG is a separate condition; D* is not a current ymtp terminal specification.']],
      [['矽內能帶間穿隧產生電洞', 'Generate Holes by BBT in Silicon'], ['高場區形成可發生 BBT 的能帶彎曲。', 'Band bending in the high-field region permits BBT.'], ['價帶電子穿隧至導帶，留下電洞。', 'A valence-band electron tunnels into the conduction band, leaving a hole.'], ['電子由高場接面收集，電洞往通道／本體側移動；本格的穿隧發生在矽內，不是穿越 FG 氧化層。', 'Electrons are collected by the high-field junction while holes move toward the channel/body side. This tunneling occurs in silicon, not across the FG oxide.']],
      [['熱電洞進入 FG', 'Inject Hot Holes into FG'], ['部分電洞已獲能；注入區局部 E⊥ 指向 FG。', 'Some holes have gained energy; local E⊥ points toward FG at the injection region.'], ['橫向加速配合局部 E⊥ 向 FG，電洞受力與電場同向。', 'Lateral acceleration combines with local E⊥ toward FG; hole force follows the field.'], ['在此局部場條件下，少數紅色電洞跨介電層進 FG，降低儲存淨負電荷。矽內 BBT 產生電洞與其後的跨介電層注入各自需要適當條件；未借用 FN 電子移出或 DAHHI 雪崩機制。', 'Under this local field condition, a few red holes cross the dielectric into FG and reduce negative charge. Silicon BBT generation and subsequent dielectric injection each require suitable conditions; neither FN electron removal nor DAHHI avalanche generation is substituted.']],
      [['恢復較低的閾值狀態', 'Reach a Lower-Threshold State'], ['FG 的淨負電荷較少。', 'FG holds less net negative charge.'], ['結束抹除刺激，回到讀取條件。', 'End erase stimulation and return to read conditions.'], ['相同讀偏壓下 Vth 較低、I_R 較大。此方向示意不保證完全中性、固定終點或自收斂抹除。', 'Vth is lower and I_R is larger at the same read bias. This qualitative direction does not guarantee neutrality, a fixed endpoint or self-convergent erase.']],
    ],
  },
  read: {
    title: ['讀取：將 FG 電荷轉成電流差', 'Read: Translate FG Charge into a Current Difference'],
    mechanism: ['nMOS 閾值調變與參考電流判讀', 'nMOS Threshold Modulation and Reference-Current Sensing'],
    summary: ['固定對照替代初態 A／B；各格不是連續改寫。相同讀取條件下，A 的負電荷較多、Vth 較高、電流較小；B 則相反，讀取保留各自電荷。', 'A and B are fixed alternative initial states, not sequential updates. At the same read bias, A has more negative charge, higher Vth and smaller current; B has the opposite. Reading preserves either state.'],
    sourceIds: ['ymc-product', 'ymc-1t1c', 'ymc-pat-dahhi', 'physics-bbhh-fg'],
    frames: [
      [['施加相同讀取條件', 'Apply the Same Read Conditions'], ['A／B 是分別已建立的兩種替代初態。', 'A and B are two separately established alternative initial states.'], ['CG 耦合控制電位；S/D* 提供相同感測條件。', 'CG couples a control potential; S/D* provide the same sensing conditions.'], ['四格固定顯示兩態對照；沒有 A→B 寫入或抹除，也沒有載子跨介電層。', 'All four frames retain the same two-state comparison. There is no A-to-B program or erase and no carrier transfer across the dielectric.']],
      [['替代初態 A：低讀取電流', 'Alternative State A: Lower Read Current'], ['A 在讀取前已有較多負電荷與較高 Vth。', 'Before reading, A already has more negative charge and higher Vth.'], ['對 A 施加與 B 相同的讀取偏壓；保持 A 電荷。', 'Apply the same read bias used for B while retaining A charge.'], ['這是 A 的獨立讀取例。較高 Vth 使 I_R 較小，讀取不產生更多 FG 電子。', 'This is an independent read example for A. Higher Vth gives smaller I_R; reading does not add FG electrons.']],
      [['替代初態 B：高讀取電流', 'Alternative State B: Higher Read Current'], ['B 在讀取前已有較少負電荷與較低 Vth。', 'Before reading, B already has less negative charge and lower Vth.'], ['對 B 施加與 A 相同的讀取偏壓；保持 B 電荷。', 'Apply the same read bias used for A while retaining B charge.'], ['這是 B 的替代例，未由上一格 A 轉換而來。較低 Vth 使 I_R 較大；綠箭頭表示傳統電流。', 'B is an alternative example, not a conversion from A in the previous frame. Lower Vth gives larger I_R; the green arrow denotes conventional current.']],
      [['用 Iref 判斷既有狀態', 'Sense the Existing State with Iref'], ['A／B 的既有電荷各自保留，形成不同讀取電流。', 'A and B retain their respective charge and produce different read currents.'], ['感測電路比較 I_R 與參考 Iref，不更新 FG。', 'The sensing circuit compares I_R with Iref without updating FG.'], ['Iref 與兩種狀態需有可辨識間距；圖中對照與前格固定相同。實際窗口受製程、溫度與使用歷程影響，0／1 編碼及規格由產品定義。', 'Iref must separate the states with adequate margin; the comparison is unchanged from earlier frames. Process, temperature and usage history affect the window; product specifications define margins and 0/1 encoding.']],
    ],
  },
};

/** @param {string} id @param {string} language @returns {IPStudy|null} */
export function getIPStudy(id, language = 'zh') {
  if (id !== 'ymc-mtp') return null;
  const lang = language === 'en' ? 'en' : 'zh';
  const idx = lang === 'en' ? 1 : 0;
  const l = (zh, en) => phrase(lang, zh, en);
  const caveat = l('本組為 YMC ymtp 的 CHI／BBHH 教學操作模型；使用等效 1T1C 與方向示意，不是現行特定版本剖面或偏壓表。BBHH 物理由獨立原始研究支撐；YMC 公開專利的 FN／DAHHI 變體維持各自機制。', 'A CHI / BBHH teaching model for YMC ymtp, using an equivalent 1T1C and qualitative directions rather than a current version-specific cross-section or bias table. Independent original research supports BBHH physics; YMC FN/DAHHI patent variants retain their distinct mechanisms.');
  const structureTitle = l('YMC ymtp：CHI／BBHH 1T1C 操作模型', 'YMC ymtp: CHI / BBHH 1T1C Operating Model');
  return {
    id,
    structure: {
      title: structureTitle,
      svg: diagram(lang, 'structure', 0, structureTitle),
      caption: l('一個 nMOS 與一個功能耦合電容共享 FG。官方資料支持 ymtp 與 1T1C 技術家族；此原創等效圖不主張現行產品的接面、井結構或尺寸。FG 與 CG 沒有直流短路。', 'One nMOS and one functional coupling capacitor share FG. Official information supports ymtp and the 1T1C family; this original equivalent drawing does not assert current product junctions, wells or dimensions. FG and CG have no DC short.'),
      legend: legend(lang),
      sourceIds: ['ymc-product', 'ymc-1t1c', 'physics-bbhh-fg'],
    },
    operations: Object.entries(wording).map(([operationId, words]) => {
      const operationSources = sources(words.sourceIds, lang);
      const frames = words.frames.map((frame, index) => ({ id: `${operationId}-${index + 1}`, title: frame[0][idx], state: frame[1][idx], stimulus: frame[2][idx], caption: frame[3][idx], svg: diagram(lang, operationId, index, frame[0][idx]), sourceIds: [...words.sourceIds] }));
      return { topicId: `ip-${id}`, operationId, title: words.title[idx], summary: words.summary[idx], sources: operationSources, variants: [{ id: 'mechanism-model', title: words.title[idx], mechanism: words.mechanism[idx], summary: words.summary[idx], frames, legend: legend(lang), sources: operationSources, caveat }] };
    }),
  };
}
