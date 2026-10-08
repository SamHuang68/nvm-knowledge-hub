/** 公開原廠頁可核對的補充 IP：Actt/NSCore/Floadia/CFX/Attopsemi/SST。未知 ID 回傳 null。 */
const C = { ink: '#16334c', muted: '#5b6f82', silicon: '#bed1e2', doped: '#7299b9', oxide: '#f3e2af', trap: '#d98762', fg: '#c2a269', metal: '#899ba9', electron: '#075f9d', hole: '#b52f43', field: '#a34b10', current: '#087766', white: '#fff', panel: '#f7f9fc' };
const pick = (pair, language) => language === 'zh' ? pair[0] : pair[1];
const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const bi = (zh, en) => [zh, en];
function markerKind(stroke) {
  if (stroke === C.electron) return 'electron';
  if (stroke === C.hole) return 'hole';
  if (stroke === C.field) return 'field';
  return 'current';
}
function canvas(id, operation, language, index) {
  const prefix = `ip-${id}-${operation}-${index}-${language}`;
  return {
    prefix, language,
    t(x, y, text, anchor = 'start', fill = C.ink) { return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="22" font-weight="600">${esc(text)}</text>`; },
    text(x, y, zh, en, anchor = 'start', fill = C.ink) { return this.t(x, y, pick([zh, en], language), anchor, fill); },
    rect(x, y, w, h, fill, extra = '') { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-width="1.4" ${extra}/>`; },
    line(x1, y1, x2, y2, stroke = C.ink, width = 2) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`; },
    arrow(x1, y1, x2, y2, stroke = C.current, width = 3) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" marker-end="url(#${this.prefix}-${markerKind(stroke)})"/>`; },
    charge(x, y, hole = false) { return `<circle data-charge="stored" cx="${x}" cy="${y}" r="8" fill="${hole ? C.hole : C.electron}"/>`; },
    path(d, stroke, width = 2.4, extra = '') { return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`; },
  };
}
function svg(c, title, caption, body) {
  const markers = ['electron', 'hole', 'field', 'current'].map(kind => `<marker id="${c.prefix}-${kind}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L8 5L1 9" fill="none" stroke="${C[kind]}" stroke-width="2"/></marker>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${c.prefix}" viewBox="0 0 560 360" role="img" aria-labelledby="${c.prefix}-title ${c.prefix}-desc"><title id="${c.prefix}-title">${esc(title)}</title><desc id="${c.prefix}-desc">${esc(caption)}</desc><defs>${markers}</defs><style>#${c.prefix} text{font-family:Arial,'Microsoft JhengHei',sans-serif;font-size:22px;font-weight:600}#${c.prefix}{background:${C.panel};color:${C.ink}}</style>${c.rect(1, 1, 558, 358, C.panel, 'rx="14" stroke="none"')}${body}</svg>`;
}
function record(c, title, caption, state, stimulus, body, language, sourceIds) {
  return { id: `${c.prefix}-frame`, title: pick(title, language), state: pick(state, language), stimulus: pick(stimulus, language), caption: pick(caption, language), svg: svg(c, pick(title, language), pick(caption, language), body), sourceIds: [...sourceIds] };
}

const SOURCES = {
  'ip-actt-envm': { id: 'ip-actt-envm', label: bi('Actt eNVM 產品頁', 'Actt eNVM Product Page'), url: 'https://www.analogcircuit.cn/product/envm.html', kind: 'vendor', date: '2026-09-16', locator: bi('LogicFlash MTP：邏輯相容、0–1 道光罩、Flash-like byte PGM／sector 或 chip ERS、最高 10k 次；SuperMTP 標為開發中；未公開位元單元剖面。', 'LogicFlash MTP: logic-compatible, 0–1 extra mask, Flash-like byte PGM / sector or chip ERS, up to 10k cycles; SuperMTP marked under development; no public bit-cell cross-section.'), limit: bi('「類似 Flash」只證明介面與更新粒度，不證明 FN、HCI 或電荷捕捉層。', '"Flash-like" proves interface and update granularity, not FN, HCI, or a trap layer.') },
  'ip-actt-andes-cmt': { id: 'ip-actt-andes-cmt', label: bi('Andes：Actt 併購 CMT', 'Andes: Actt Acquired CMT'), url: 'https://www.andestech.com/en/2016/08/30/andes-technology-and-actt-announce-strategic-partnership/', kind: 'news', date: '2016-08-30', locator: bi('2016 年 Actt 併購 Chip Memory Technology (CMT)。', 'Actt acquired Chip Memory Technology (CMT) in 2016.'), limit: bi('CMT 是譜系名稱，不是現行公開 SKU。', 'CMT is a lineage name, not a current public SKU.') },
  'ip-nscore-products': { id: 'ip-nscore-products', label: bi('NSCore 產品頁', 'NSCore Products'), url: 'https://www.nscore.com/products/', kind: 'vendor', date: '2026-09-16', locator: bi('TwinBit MTP 與 PermSRAM OTP 並列；TwinBit 以 CMOS 製程、零額外光罩為賣點。', 'TwinBit MTP is listed beside PermSRAM OTP; TwinBit is sold as CMOS, zero extra mask.'), limit: bi('產品頁不把 TwinBit 寫成 PermSRAM 的熱載子氮化側牆。', 'The products page does not describe TwinBit as PermSRAM hotspot-into-SiN.') },
  'ip-nscore-twinbit-g2': { id: 'ip-nscore-twinbit-g2', label: bi('NSCore TwinBit Gen-2', 'NSCore TwinBit Gen-2'), url: 'https://www.nscore.com/twinbit_g2.html', kind: 'vendor', date: '2026-09-16', locator: bi('Gen-2 Pch Schottky；寫入熱電洞、抹除熱電子；40–22 nm、零額外光罩。', 'Gen-2 Pch Schottky; program by hot hole, erase by hot electron; 40–22 nm, zero extra mask.'), limit: bi('未公開偏壓表或接面尺寸。', 'No public bias table or junction dimensions.') },
  'ip-floadia-zt': { id: 'ip-floadia-zt', label: bi('Floadia LEE Flash ZT', 'Floadia LEE Flash ZT'), url: 'https://floadia.com/product/lee-flash-zt/', kind: 'vendor', date: '2026-09-16', locator: bi('零額外光罩 MTP；FN 寫入與抹除；180BCD 樣品；車規敘述。', 'Zero extra-mask MTP; FN program and erase; 180BCD sample; automotive narrative.'), limit: bi('頁面本文 10K 與表格 >100k 不一致；不取循環次數當共通保證。', 'Body 10K vs table >100k is inconsistent; do not take cycle counts as a common guarantee.') },
  'ip-floadia-zt-news': { id: 'ip-floadia-zt-news', label: bi('Floadia ZT 新聞：浮動閘極', 'Floadia ZT News: Floating Gate'), url: 'https://floadia.com/news/422/', kind: 'vendor', date: '2024-12-09', locator: bi('ZT 以浮動閘極為儲存節點。', 'ZT uses a floating gate as the storage node.'), limit: bi('新聞未給多晶矽層數或井結構。', 'The news item does not give poly count or well structure.') },
  'ip-cfx-otpip': { id: 'ip-cfx-otpip', label: bi('創飛芯 OTP IP', 'Chuangfeixin OTP IP'), url: 'https://www.chuangfeixin.com/otpip', kind: 'vendor', date: '2026-09-16', locator: bi('CMOS 相容 OTP IP 產品線。', 'CMOS-compatible OTP IP product line.'), limit: bi('該頁未固定單一物理機制。', 'The page does not lock a single physics mechanism.') },
  'ip-cfx-news-routes': { id: 'ip-cfx-news-routes', label: bi('創飛芯：三種 OTP 路線', 'CFX: Three OTP Routes'), url: 'https://www.chuangfeixin.com/newsinfo/8119214.html', kind: 'vendor', date: '2026-04-09', locator: bi('公開敘述並列 Anti-fuse、eFuse、Floating Gate 三條 OTP 路線。', 'Public narrative lists Anti-fuse, eFuse, and Floating Gate OTP routes.'), limit: bi('不可把三條路線壓成同一個位元單元。', 'Do not collapse the three routes into one bit cell.') },
  'ip-cfx-semiiphub': { id: 'ip-cfx-semiiphub', label: bi('Semi IP Hub：創飛芯閘極氧化層擊穿', 'Semi IP Hub: CFX Gate-Oxide Breakdown'), url: 'https://semiiphub.com/vendor/cfx-semiconductor/', kind: 'catalog', date: '2026-09-16', locator: bi('部分具名 HV 巨集以高電壓脈衝在閘極對基板造成氧化層擊穿。', 'Some named HV macros use a high-voltage pulse for gate-to-substrate oxide breakdown.'), limit: bi('目錄敘述不能覆蓋全部 CFX OTP SKU。', 'The catalog description does not cover every CFX OTP SKU.') },
  'ip-attop-home': { id: 'ip-attop-home', label: bi('Attopsemi 首頁', 'Attopsemi Home'), url: 'https://www.attopsemi.com/', kind: 'vendor', date: '2026-09-16', locator: bi('I-fuse 定位為 OTP；明確不是 AntiFuse，也不是爆炸式 eFuse。', 'I-fuse is positioned as OTP; explicitly not AntiFuse and not explosive eFuse.'), limit: bi('首頁不把 I-fuse 畫成 MOS 閘極氧化層擊穿。', 'The home page does not draw I-fuse as MOS gate-oxide breakdown.') },
  'ip-attop-ifuse': { id: 'ip-attop-ifuse', label: bi('Attopsemi I-fuse 技術', 'Attopsemi I-fuse Technology'), url: 'https://www.attopsemi.com/ifuse-technology/', kind: 'vendor', date: '2026-09-16', locator: bi('熱輔助電遷移，低於熱失控；poly／金屬閘／金屬熔絲，不是 MOS。', 'Heat-assisted electromigration below thermal runaway; poly / metal-gate / metal fuse, not MOS.'), limit: bi('未公開熔絲截面尺寸或程式電流表。', 'No public fuse cross-section dimensions or program current table.') },
  'ip-floadia-za': { id: 'ip-floadia-za', label: bi('Floadia LEE Fuse ZA', 'Floadia LEE Fuse ZA'), url: 'https://floadia.com/product/lee-fuse-za/', kind: 'vendor', date: '2026-09-16', locator: bi('Anti-fuse OTP、零額外光罩、180 nm 至 sub-10 nm；DRAM 1xnm 量產軌跡。', 'Anti-fuse OTP, zero extra mask, 180 nm to sub-10 nm; DRAM 1xnm production track.'), limit: bi('頁面一度寫成 LEE Flash ZA；產品名以 LEE Fuse ZA 為準。未公開擊穿位置剖面。', 'The page once writes LEE Flash ZA; the product name is LEE Fuse ZA. No public breakdown-site cross-section.') },
  'ip-floadia-g1': { id: 'ip-floadia-g1', label: bi('Floadia LEE Flash G1', 'Floadia LEE Flash G1'), url: 'https://floadia.com/product/lee-flash-g1/', kind: 'vendor', date: '2026-09-16', locator: bi('SONOS eFlash、2–3 道光罩、FN 寫抹、BCD。', 'SONOS eFlash, 2–3 extra masks, FN program/erase, BCD.'), limit: bi('未公開氮化層厚度或偏壓表。', 'No public nitride thickness or bias table.') },
  'ip-floadia-g2': { id: 'ip-floadia-g2', label: bi('Floadia LEE Flash G2', 'Floadia LEE Flash G2'), url: 'https://floadia.com/product/lee-flash-g2/', kind: 'vendor', date: '2026-09-16', locator: bi('SONOS 單元夾在開關電晶體之間；4 道光罩；VDD 讀取／不揮發化邏輯；標為持續開發。', 'SONOS cell sandwiched by switch transistors; 4 extra masks; VDD read / non-volatilized logic; marked ongoing development.'), limit: bi('開發中敘述不能當已量產保證。', 'An in-development note is not a production guarantee.') },
  'ip-sst-home': { id: 'ip-sst-home', label: bi('SST 首頁與服務', 'SST Home and Services'), url: 'https://www.sst.com/services/', kind: 'vendor', date: '2026-09-16', locator: bi('SuperFlash 嵌入式快閃記憶體製程整合與授權入口。', 'SuperFlash embedded Flash process-integration and licensing entry.'), limit: bi('服務頁證明產品家族，不取代技術手冊的 SSI／interpoly FN 細節。', 'The services page proves the product family; it does not replace brochure SSI / interpoly FN detail.') },
  'ip-sst-superflash': { id: 'ip-sst-superflash', label: bi('SST／微芯科技 SuperFlash 技術手冊 DS00001425F', 'SST / Microchip SuperFlash Brochure DS00001425F'), url: 'https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf', kind: 'vendor', date: '2018-03', locator: bi('第 2–3 頁：分裂閘極、源側注入寫入、閘極間 FN 抹除。', 'Pages 2–3: split-gate, source-side injection program, interpoly FN erase.'), limit: bi('結構及機制按具名 SuperFlash 世代閱讀；2018 年出貨與節點表不是 2026 年全部產品保證。', 'Read structure and mechanism within the named SuperFlash generation; 2018 shipment and node tables are not 2026 product guarantees.') },
  'ip-chingis-pfusion': { id: 'ip-chingis-pfusion', label: bi('常億科技 pFusion eFlash 產品技術', 'Chingis Technology pFusion eFlash Technology'), url: 'https://www.chingistek.com', kind: 'vendor', date: '2026-09-16', locator: bi('P-Channel 浮閘 PMOS eFlash；以能帶至能帶穿隧誘發熱電洞注入 (BBHH) 寫入與 FN 抹除；極低寫入電流，標準 CMOS 相容。', 'P-Channel floating-gate PMOS eFlash; band-to-band tunneling induced hot-hole injection (BBHH) program with FN tunneling erase; microamp write current, standard CMOS compatible.'), limit: bi('適用於微控制器與智慧卡；不以單一規格書代表全節點 PDK。', 'Applicable to MCUs and smart cards; does not represent all node PDKs from a single datasheet.') },
  'ip-chingis-pm25': { id: 'ip-chingis-pm25', label: bi('常億 pFlash SPI NOR Flash', 'Chingis pFlash SPI NOR Flash'), url: 'https://www.chingistek.com', kind: 'vendor', date: '2026-09-16', locator: bi('Pm25 系列獨立式 NOR Flash；晶豪科技 ESMT 產品線。', 'Pm25 series standalone NOR Flash; ESMT group product portfolio.'), limit: bi('獨立式封裝不等於所有嵌入式巨集。', 'Standalone packages do not represent all embedded macros.') },
  'ip-iotmemory-silvoflash': { id: 'ip-iotmemory-silvoflash', label: bi('智憶科技 SilvoFlash 超低壓 eFlash', 'IOTMemory SilvoFlash Low-Voltage eFlash'), url: 'https://iotmemory.com/en', kind: 'vendor', date: '2026-09-16', locator: bi('SilvoFlash 原生 0.9V–1.2V 超低壓 eFlash；支援 40nm SoC 與 DDR5 SPD IC 供應鏈。', 'SilvoFlash native 0.9V–1.2V ultra-low-voltage eFlash; validated in 40nm SoC and DDR5 SPD IC supply chain.'), limit: bi('核心電壓原生讀取不代表抹除無需內部升壓；量產驗證按具名產品核對。', 'Native core-voltage read does not mean erase requires no internal boost; production status verified by named products.') },
  'ip-iotmemory-silvofe': { id: 'ip-iotmemory-silvofe', label: bi('智憶科技 SilvoFE 嵌入式 eEEPROM', 'IOTMemory SilvoFE Embedded eEEPROM'), url: 'https://iotmemory.com/en', kind: 'vendor', date: '2026-09-16', locator: bi('單一製程整合 Code eFlash 與 Data eEEPROM。', 'Single process integration of Code eFlash and Data eEEPROM.'), limit: bi('兩者在同一晶片上共存需核對具名巨集組織。', 'Coexistence on a single chip must be verified on named macro architectures.') },
};

const META = {
  'actt-cmt': {
    name: bi('Actt LogicFlash MTP（CMT 譜系）', 'Actt LogicFlash MTP (CMT Lineage)'),
    hostTopic: 'mtp',
    refs: ['ip-actt-envm', 'ip-actt-andes-cmt'],
    structure: bi('邏輯製程 MTP 巨集。公開頁只保證 Flash-like 位元組寫入與扇區／晶片抹除，不公開儲存節點材料。CMT 是 2016 年併購譜系。', 'A logic-process MTP macro. The public page guarantees Flash-like byte program and sector/chip erase, not the storage-node material. CMT is the 2016 acquisition lineage.'),
    model: bi('介面級教學模型', 'Interface-Level Teaching Model'),
    mechanism: bi('公開證據停在 Flash-class PGM／ERS 介面，未指定 FN、HCI 或捕捉層。', 'Public evidence stops at a Flash-class PGM/ERS interface and does not specify FN, HCI, or a trap layer.'),
    caveat: bi('SuperMTP 在原廠頁標為開發中，不納入本單元操作圖。', 'SuperMTP is marked under development on the vendor page and is not used in this unit’s operation drawings.'),
  },
  'nscore-twinbit': {
    name: bi('NSCore TwinBit MTP', 'NSCore TwinBit MTP'),
    hostTopic: 'mtp',
    refs: ['ip-nscore-products', 'ip-nscore-twinbit-g2'],
    structure: bi('Gen-2 以 Pch Schottky 電晶體為儲存元件；零額外光罩。PermSRAM 是並列的 OTP，熱載子進氮化側牆，不畫進本圖。', 'Gen-2 uses a Pch Schottky transistor as the storage device with zero extra mask. PermSRAM is a sibling OTP that traps hot carriers in a SiN spacer and is not drawn here.'),
    model: bi('公開 Gen-2 熱載子模型', 'Published Gen-2 Hot-Carrier Model'),
    mechanism: bi('寫入熱電洞、抹除熱電子。', 'Program by hot hole; erase by hot electron.'),
    caveat: bi('未把 TwinBit 畫成 PermSRAM 側牆捕捉，也未指定偏壓數字。', 'TwinBit is not drawn as PermSRAM spacer trapping, and bias numbers are unspecified.'),
  },
  'floadia-zt': {
    name: bi('Floadia LEE Flash ZT MTP', 'Floadia LEE Flash ZT MTP'),
    hostTopic: 'mtp',
    refs: ['ip-floadia-zt', 'ip-floadia-zt-news'],
    structure: bi('零額外光罩浮動閘極 MTP；寫抹走 FN。教學圖只畫等效 FG 與耦合端。', 'Zero extra-mask floating-gate MTP; program and erase use FN. The teaching drawing shows only an equivalent FG and coupling terminal.'),
    model: bi('FN 浮動閘極教學模型', 'FN Floating-Gate Teaching Model'),
    mechanism: bi('電子經 FN 進出浮動閘極。', 'Electrons enter and leave the floating gate by FN tunneling.'),
    caveat: bi('循環次數頁面自相矛盾，不以任何次數當保證。', 'Cycle-count copy on the page conflicts with itself; no count is treated as a guarantee.'),
  },
  'cfx-otp': {
    name: bi('創飛芯 OTP（閘極氧化層擊穿教學例）', 'CFX OTP (Gate-Oxide Breakdown Teaching Case)'),
    hostTopic: 'antifuse',
    refs: ['ip-cfx-otpip', 'ip-cfx-news-routes', 'ip-cfx-semiiphub'],
    structure: bi('創飛芯公開並列 Anti-fuse、eFuse、浮動閘極三條 OTP。本圖只教 Semi IP Hub 具名 HV 巨集的閘極氧化層擊穿，不代表全部 SKU。', 'CFX publicly lists Anti-fuse, eFuse, and floating-gate OTP. This drawing teaches only the Semi IP Hub named HV-macro gate-oxide breakdown and does not represent every SKU.'),
    model: bi('氧化層擊穿教學模型', 'Oxide-Breakdown Teaching Model'),
    mechanism: bi('高電壓脈衝使閘極對基板氧化層永久導通。', 'A high-voltage pulse permanently conducts the gate-to-substrate oxide.'),
    caveat: bi('若目標巨集是 eFuse 或浮動閘極 OTP，必須另開單元，不可沿用本圖。', 'If the target macro is eFuse or floating-gate OTP, open a separate unit; do not reuse this drawing.'),
  },
  'attopsemi-ifuse': {
    name: bi('Attopsemi I-fuse OTP', 'Attopsemi I-fuse OTP'),
    hostTopic: 'efuse',
    refs: ['ip-attop-home', 'ip-attop-ifuse'],
    structure: bi('Poly／金屬閘／金屬熔絲。熱輔助電遷移改變電阻，故意低於熱失控與爆炸式熔斷。', 'A poly / metal-gate / metal fuse. Heat-assisted electromigration changes resistance while staying below thermal runaway and explosive rupture.'),
    model: bi('熱輔助電遷移模型', 'Heat-Assisted Electromigration Model'),
    mechanism: bi('局部加熱加速金屬原子遷移，提高熔絲電阻。', 'Local heating accelerates metal-atom migration and raises fuse resistance.'),
    caveat: bi('I-fuse 不是 AntiFuse，也不是傳統爆炸式 eFuse。', 'I-fuse is neither AntiFuse nor conventional explosive eFuse.'),
  },
  'floadia-za': {
    name: bi('Floadia LEE Fuse ZA OTP', 'Floadia LEE Fuse ZA OTP'),
    hostTopic: 'antifuse',
    refs: ['ip-floadia-za'],
    structure: bi('Anti-fuse OTP、零額外光罩。教學圖畫介電層擊穿前後的絕緣／導通，不指定擊穿點在閘極或電容。', 'Anti-fuse OTP with zero extra mask. The teaching drawing shows dielectric isolation then conduction and does not locate the breakdown site in a gate or capacitor.'),
    model: bi('Anti-fuse 擊穿教學模型', 'Anti-Fuse Breakdown Teaching Model'),
    mechanism: bi('一次高電壓使介電層永久導通。', 'A single high-voltage event permanently conducts the dielectric.'),
    caveat: bi('產品名是 LEE Fuse ZA；頁面誤寫 LEE Flash ZA 不改機制分類。', 'The product name is LEE Fuse ZA; a page typo of LEE Flash ZA does not change the mechanism class.'),
  },
  'floadia-g1': {
    name: bi('Floadia LEE Flash G1 eFlash', 'Floadia LEE Flash G1 eFlash'),
    hostTopic: 'sonos',
    refs: ['ip-floadia-g1'],
    structure: bi('SONOS 電荷捕捉 eFlash；2–3 道光罩；FN 寫抹。O-N-O 是教學堆疊，不是量測厚度。', 'SONOS charge-trap eFlash; 2–3 extra masks; FN program/erase. O-N-O is a teaching stack, not a measured thickness.'),
    model: bi('SONOS FN 教學模型', 'SONOS FN Teaching Model'),
    mechanism: bi('電子經 FN 進出氮化捕捉層。', 'Electrons enter and leave the nitride trap layer by FN tunneling.'),
    caveat: bi('BCD 敘述不能外推到所有邏輯節點。', 'A BCD narrative cannot be extrapolated to every logic node.'),
  },
  'floadia-g2': {
    name: bi('Floadia LEE Flash G2 eFlash', 'Floadia LEE Flash G2 eFlash'),
    hostTopic: 'sonos',
    refs: ['ip-floadia-g2'],
    structure: bi('SONOS 儲存單元夾在兩側開關電晶體之間；4 道光罩；讀取走 VDD，擴散端不需高壓。', 'A SONOS storage cell sandwiched by switch transistors; 4 extra masks; read at VDD without high voltage on diffusion terminals.'),
    model: bi('夾層 SONOS 教學模型', 'Sandwiched SONOS Teaching Model'),
    mechanism: bi('寫抹仍走電荷捕捉；讀取由側開關在 VDD 選取。', 'Program/erase still use charge trapping; read selects through side switches at VDD.'),
    caveat: bi('原廠標為持續開發，本圖只教公開結構原則。', 'The vendor marks ongoing development; this drawing teaches only the published structural principle.'),
  },
  'sst-superflash': {
    name: bi('SST SuperFlash eFlash', 'SST SuperFlash eFlash'),
    hostTopic: 'nor',
    refs: ['ip-sst-home', 'ip-sst-superflash'],
    structure: bi('分裂閘極快閃記憶體：選擇閘與浮動閘並列。寫入源側注入，抹除多晶矽間 FN。', 'Split-gate Flash: a select gate beside a floating gate. Program uses source-side injection; erase uses interpoly FN.'),
    model: bi('SSI／interpoly FN 教學模型', 'SSI / Interpoly FN Teaching Model'),
    mechanism: bi('熱電子從源側注入 FG；抹除時電子經多晶矽間氧化層離開 FG。', 'Hot electrons inject from the source side into FG; during erase, electrons leave FG through the interpoly oxide.'),
    caveat: bi('製程範圍是授權敘述，不是單一量產節點證明。', 'The process range is a licensing narrative, not proof of one production node.'),
  },
  'chingis-pfusion': {
    name: bi('常億科技 pFusion eFlash (P-Channel 浮閘)', 'Chingis Technology pFusion eFlash (P-Channel FG)'),
    hostTopic: 'nor',
    refs: ['ip-chingis-pfusion', 'ip-chingis-pm25'],
    structure: bi('P-Channel PMOS 浮動閘極 eFlash。BBHH 帶帶穿隧熱電洞注入寫入，FN 穿隧抹除；微安培級寫入電流，標準 CMOS 相容。', 'P-Channel PMOS floating-gate eFlash. Band-to-band tunneling induced hot-hole injection (BBHH) program with FN tunneling erase; microamp-class write current, standard CMOS compatible.'),
    model: bi('BBHH／FN P-Channel 浮閘教學模型', 'BBHH / FN P-Channel FG Teaching Model'),
    mechanism: bi('以能帶至能帶穿隧 (BBHH) 激發熱電洞高效注入 FG；抹除走 FN 穿隧。', 'Hot holes generated by band-to-band tunneling (BBHH) efficiently inject into FG; erase uses FN tunneling.'),
    caveat: bi('微安培級低寫入電流為 PMOS 浮閘特性，不代表抹除無需內部升壓；製程支援依目標 PDK。', 'Microamp write current is an inherent PMOS FG trait; it does not mean erase requires no boost; PDK support depends on target foundries.'),
  },
  'iotmemory-silvoflash': {
    name: bi('智憶科技 SilvoFlash 原生超低壓 eFlash', 'IOTMemory SilvoFlash Native Low-Voltage eFlash'),
    hostTopic: 'nor',
    refs: ['ip-iotmemory-silvoflash', 'ip-iotmemory-silvofe'],
    structure: bi('專利單層／低光罩 CMOS 浮閘結構。原生 0.9V–1.2V 核心邏輯電壓直接感測，破除傳統 eFlash ≥1.8V 壁壘；打入 DDR5 SPD IC 供應鏈。', 'Patented single-poly / low-mask CMOS floating-gate structure. Native 0.9V–1.2V core logic readout breaks the ≥1.8V barrier; qualified in DDR5 SPD IC supply chain.'),
    model: bi('0.9V–1.2V 原生讀取教學模型', '0.9V–1.2V Native Read Teaching Model'),
    mechanism: bi('以原生 0.9V–1.2V 核心邏輯電壓直接讀取通道；低功耗電荷泵輔助穿隧寫抹。', 'Direct channel readout at native 0.9V–1.2V core logic voltage; low-power charge pump assists tunneling program/erase.'),
    caveat: bi('讀取無需升壓不代表寫抹無需內部高壓；實際保持性與循環依代工廠 PDK 驗證。', 'Boost-free read does not mean program/erase requires no internal HV; retention and endurance must be verified on foundry PDKs.'),
  },
};

function well(c) {
  return c.rect(70, 210, 420, 90, C.silicon) + c.text(80, 292, 'P 井／基底', 'P-well / Substrate', 'start', C.muted);
}
function terminals(c, bias) {
  return c.t(88, 54, bias || '0') + c.text(20, 54, '選取端', 'Select') + c.text(430, 54, '通道端', 'Channel');
}

function genericCell(c, { on, bias, charge = 0, labelZh, labelEn }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(170, 118, 220, 36, C.metal) + c.text(280, 142, labelZh, labelEn, 'middle');
  body += c.rect(170, 154, 220, 18, C.oxide);
  body += c.rect(190, 172, 180, 38, C.doped) + c.text(280, 196, '通道', 'Channel', 'middle');
  body += c.line(280, 80, 280, 118) + c.t(296, 98, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  if (charge) {
    const hole = charge > 0;
    body += c.charge(240, 136, hole) + c.charge(280, 136, hole) + c.charge(320, 136, hole);
  }
  return body;
}
function fgCell(c, { on, bias, electrons = 0, couple = 'CG' }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(190, 86, 180, 28, C.metal) + c.t(280, 105, couple, 'middle');
  body += c.rect(200, 118, 160, 16, C.oxide);
  body += c.rect(210, 134, 140, 28, C.fg) + c.t(280, 153, 'FG', 'middle');
  body += c.rect(200, 162, 160, 14, C.oxide);
  body += c.rect(190, 176, 180, 34, C.doped) + c.text(280, 198, '通道', 'Channel', 'middle');
  body += c.line(280, 54, 280, 86) + c.t(296, 72, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < electrons; i++) body += c.charge(230 + i * 22, 148);
  return body;
}
function sonosCell(c, { on, bias, trapped = 0, switches = false }) {
  let body = terminals(c, bias) + well(c);
  if (switches) {
    body += c.rect(96, 150, 54, 50, C.doped) + c.t(123, 180, 'SW', 'middle');
    body += c.rect(410, 150, 54, 50, C.doped) + c.t(437, 180, 'SW', 'middle');
  }
  body += c.rect(190, 96, 180, 22, C.metal) + c.t(280, 112, 'CG', 'middle');
  body += c.rect(200, 118, 160, 12, C.oxide);
  body += c.rect(200, 130, 160, 22, C.trap) + c.t(280, 146, 'SiN', 'middle');
  body += c.rect(200, 152, 160, 12, C.oxide);
  body += c.rect(190, 164, 180, 36, C.doped) + c.text(280, 186, '通道', 'Channel', 'middle');
  body += c.line(280, 54, 280, 96) + c.t(296, 74, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < trapped; i++) body += c.charge(228 + i * 24, 141);
  return body;
}
function schottkyCell(c, { on, bias, holes = 0, electrons = 0 }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(170, 100, 220, 40, C.doped) + c.text(280, 125, 'Pch Schottky', 'Pch Schottky', 'middle');
  body += c.rect(190, 140, 180, 50, C.silicon) + c.text(280, 170, '通道／接面', 'Channel / Junction', 'middle');
  body += c.line(280, 54, 280, 100) + c.t(296, 76, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < holes; i++) body += c.charge(220 + i * 28, 120, true);
  for (let i = 0; i < electrons; i++) body += c.charge(232 + i * 28, 120);
  return body;
}
function oxideBreak(c, { on, bias, broken = false }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(200, 96, 160, 28, C.metal) + c.t(280, 115, 'Gate', 'middle');
  body += c.rect(210, 124, 140, broken ? 10 : 28, broken ? C.field : C.oxide);
  if (broken) body += c.path('M250 124 L270 148 L290 128 L310 150 L330 124', C.field, 3);
  else body += c.text(280, 144, 'GOX', 'GOX', 'middle', C.muted);
  body += c.rect(190, 156, 180, 40, C.doped) + c.text(280, 180, '基板／通道', 'Substrate / Channel', 'middle');
  body += c.line(280, 54, 280, 96) + c.t(296, 74, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  if (on && !broken) body += c.arrow(280, 118, 280, 168, C.field, 3);
  if (broken) body += c.t(400, 140, 'LRS', 'start', C.field);
  return body;
}
function fuseCell(c, { on, bias, migrated = false, heat = false }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(150, 120, 80, 28, C.metal) + c.rect(330, 120, 80, 28, C.metal);
  body += c.rect(230, 126, 100, 16, migrated ? C.oxide : C.metal);
  body += c.text(280, 108, '熔絲', 'Fuse', 'middle');
  if (heat) body += c.t(400, 132, 'ΔT', 'start', C.field);
  if (migrated) body += c.path('M248 134 C268 118 292 150 312 134', C.field, 3);
  body += c.line(190, 148, 190, 210) + c.line(370, 148, 370, 210);
  body += c.t(296, 74, on ? 'I_PGM' : '0', 'start', on ? C.current : C.muted);
  if (on) body += c.arrow(170, 134, 390, 134, C.current, 3);
  return body;
}
function splitGate(c, { on, bias, electrons = 0, inject = false, erase = false }) {
  let body = terminals(c, bias) + well(c);
  body += c.rect(150, 96, 90, 36, C.metal) + c.t(195, 119, 'SG', 'middle');
  body += c.rect(250, 86, 120, 46, C.fg) + c.t(310, 113, 'FG', 'middle');
  body += c.rect(150, 132, 220, 16, C.oxide);
  body += c.rect(150, 148, 80, 40, C.doped) + c.rect(250, 148, 120, 40, C.doped);
  body += c.text(195, 172, '源側', 'Source', 'middle') + c.text(310, 172, '通道', 'Channel', 'middle');
  body += c.line(195, 54, 195, 96) + c.t(211, 72, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < electrons; i++) body += c.charge(270 + i * 22, 109);
  if (inject) body += c.arrow(210, 168, 280, 118, C.electron, 3) + c.t(400, 128, 'SSI', 'start', C.electron);
  if (erase) body += c.arrow(310, 96, 310, 70, C.electron, 3) + c.text(20, 88, 'FN 出 FG', 'FN off FG', 'start', C.electron);
  return body;
}

function pmosFgCell(c, { on, bias, holes = 0, bbhh = false, erase = false }) {
  let body = terminals(c, bias);
  body += c.rect(70, 210, 420, 90, C.doped) + c.text(80, 292, 'N 井 (N-well)', 'N-well', 'start', C.ink);
  body += c.rect(100, 210, 70, 40, C.silicon) + c.text(135, 235, 'P+ 源', 'P+ S', 'middle', C.ink);
  body += c.rect(390, 210, 70, 40, C.silicon) + c.text(425, 235, 'P+ 汲', 'P+ D', 'middle', C.ink);
  body += c.rect(190, 86, 180, 28, C.metal) + c.text(280, 105, 'CG (控制閘)', 'CG', 'middle');
  body += c.rect(200, 118, 160, 16, C.oxide);
  body += c.rect(210, 134, 140, 28, C.fg) + c.text(280, 153, 'FG (浮動閘)', 'FG', 'middle');
  body += c.rect(200, 162, 160, 14, C.oxide);
  body += c.rect(170, 176, 220, 34, C.silicon) + c.text(280, 198, 'P-Channel 通道', 'P-Channel', 'middle', C.ink);
  body += c.line(280, 54, 280, 86) + c.t(296, 72, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < holes; i++) body += c.charge(240 + i * 24, 148, true);
  if (bbhh) {
    body += c.arrow(390, 215, 330, 155, C.hole, 3) + c.t(400, 175, 'BBHH', 'start', C.hole);
  }
  if (erase) {
    body += c.arrow(280, 134, 280, 110, C.electron, 3) + c.text(20, 88, 'FN 穿隧', 'FN Tunnel', 'start', C.electron);
  }
  return body;
}

function lowVoltFgCell(c, { on, bias, electrons = 0 }) {
  let body = terminals(c, bias) + well(c);
  body += c.t(430, 80, '0.9V–1.2V Core', 'middle', C.current);
  body += c.rect(190, 86, 180, 28, C.metal) + c.t(280, 105, 'CG / Control', 'middle');
  body += c.rect(200, 118, 160, 16, C.oxide);
  body += c.rect(210, 134, 140, 28, C.fg) + c.t(280, 153, 'SilvoFlash FG', 'middle');
  body += c.rect(200, 162, 160, 14, C.oxide);
  body += c.rect(190, 176, 180, 34, C.doped) + c.text(280, 198, '原生超低壓通道', 'Native Low-V Ch', 'middle');
  body += c.line(280, 54, 280, 86) + c.t(296, 72, on ? 'ON' : 'OFF', 'start', on ? C.current : C.muted);
  for (let i = 0; i < electrons; i++) body += c.charge(230 + i * 22, 148);
  return body;
}

function cellBody(id, c, props) {
  if (id === 'actt-cmt') return genericCell(c, { ...props, labelZh: '未公開儲存節點', labelEn: 'Undisclosed Node' });
  if (id === 'nscore-twinbit') return schottkyCell(c, props);
  if (id === 'floadia-zt') return fgCell(c, props);
  if (id === 'cfx-otp' || id === 'floadia-za') return oxideBreak(c, props);
  if (id === 'attopsemi-ifuse') return fuseCell(c, props);
  if (id === 'floadia-g1') return sonosCell(c, props);
  if (id === 'floadia-g2') return sonosCell(c, { ...props, switches: true });
  if (id === 'sst-superflash') return splitGate(c, props);
  if (id === 'chingis-pfusion') return pmosFgCell(c, props);
  if (id === 'iotmemory-silvoflash') return lowVoltFgCell(c, props);
  return genericCell(c, { ...props, labelZh: '儲存單元', labelEn: 'Storage Cell' });
}

function legendFor(id, language) {
  const item = (symbol, zh, en) => ({ symbol, meaning: pick(bi(zh, en), language) });
  const common = [
    item('Dielectric', '淡黃區是介電層；厚度與材料未指定。', 'Pale yellow marks a dielectric; thickness and material are unspecified.'),
    item('Channel / Well', '藍灰區是矽通道或井的功能區，不是量測剖面。', 'Blue-gray marks a silicon channel or well function, not a metrology cross-section.'),
    item('Bias / I', '綠色箭頭表示偏壓或傳統電流方向。', 'Green arrows denote bias or conventional current direction.'),
  ];
  if (id === 'nscore-twinbit') return [...common, item('h+', '紅色圓點表示熱電洞，數量只作狀態示意。', 'Red dots denote hot holes; the count is qualitative.'), item('e−', '藍色圓點表示熱電子，數量只作狀態示意。', 'Blue dots denote hot electrons; the count is qualitative.')];
  if (id === 'chingis-pfusion') return [...common, item('h+', '紅色圓點表示熱電洞，數量只作狀態示意。', 'Red dots denote hot holes; the count is qualitative.'), item('BBHH', '帶帶穿隧熱電洞注入寫入，寫入電流僅微安培級。', 'Band-to-band hot-hole injection for microamp-class write current.')];
  if (id === 'iotmemory-silvoflash') return [...common, item('0.9V', '原生 0.9V–1.2V 核心邏輯供電讀取，免去升壓電荷泵。', 'Native 0.9V–1.2V core logic read, eliminating boost charge pumps.'), item('e−', '藍色圓點表示儲存電子，數量只作電荷示意。', 'Blue dots denote stored electrons; count is qualitative.')];
  if (id === 'attopsemi-ifuse') return [...common, item('Fuse', '橘色路徑表示電遷移後的高阻熔絲，不是爆炸缺口。', 'The orange path marks a high-R fuse after electromigration, not an explosive gap.')];
  if (id === 'cfx-otp' || id === 'floadia-za') return [...common, item('BD', '橘色折線表示介電層擊穿後的導通路徑。', 'The orange polyline marks a conduction path after dielectric breakdown.')];
  if (id === 'floadia-g1' || id === 'floadia-g2') return [...common, item('SiN', '赭色標示氮化捕捉層；厚度未公開。', 'Terracotta marks the nitride trap layer; thickness is unpublished.')];
  return [...common, item('e−', '藍色圓點表示電子，數量只作電荷狀態示意。', 'Blue dots denote electrons; the count is qualitative.')];
}

function localSources(ids, language) {
  return ids.map(id => {
    const item = SOURCES[id];
    return { id: item.id, label: pick(item.label, language), url: item.url, kind: item.kind, date: item.date, locator: pick(item.locator, language), limit: pick(item.limit, language) };
  });
}

function framesFor(id, operation, language, sourceIds) {
  const frames = [];
  const script = {
    'actt-cmt': {
      write: [
        [bi('選取前：可再寫的 MTP 巨集', 'Before Select: Reusable MTP Macro'), bi('空儲存節點', 'Empty node'), bi('偏壓為零', 'Bias zero'), bi('原廠只證明 Flash-like 位元組寫入，未公開單元剖面。', 'The vendor proves Flash-like byte program, not a cell cross-section.'), {}],
        [bi('主機送出程式化命令', 'Host Issues a Program Command'), bi('寫入進行中', 'Programming'), bi('內部高壓由巨集產生', 'Internal HV from the macro'), bi('教學圖只標介面命令，不發明 FN 或 HCI 路徑。', 'The drawing marks the interface command and does not invent an FN or HCI path.'), { on: true, bias: 'PGM', charge: -1 }],
        [bi('驗證後保留寫入態', 'Retain the Programmed State after Verify'), bi('寫入態保留', 'Programmed state retained'), bi('撤去命令', 'Command removed'), bi('10k 次是產品頁上限敘述，不是本圖的保證。', '10k cycles is a product-page ceiling narrative, not a guarantee in this drawing.'), { charge: -1 }],
      ],
      erase: [
        [bi('從已寫入態開始抹除', 'Start Erase from a Programmed State'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('公開抹除粒度是扇區或晶片，不是已證實的逐位元抹除。', 'Public erase granularity is sector or chip, not a proven bit-level erase.'), { charge: -1 }],
        [bi('主機送出抹除命令', 'Host Issues an Erase Command'), bi('抹除進行中', 'Erasing'), bi('扇區／晶片 ERS', 'Sector / chip ERS'), bi('儲存節點材料仍未公開。', 'The storage-node material remains unpublished.'), { on: true, bias: 'ERS', charge: 0 }],
        [bi('驗證後回到可再寫窗口', 'Return to a Reprogrammable Window after Verify'), bi('抹除態', 'Erased'), bi('撤去命令', 'Command removed'), bi('CMT 譜系只說明來歷，不新增物理。', 'CMT lineage explains origin and adds no physics.'), {}],
      ],
      read: [
        [bi('選取已保留的寫入或抹除態', 'Select a Retained Programmed or Erased State'), bi('既有電荷未知材料', 'Existing charge; unknown material'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不在本圖發明載子機制。', 'Read does not invent a carrier mechanism in this drawing.'), { charge: -1 }],
        [bi('感測通道電流', 'Sense Channel Current'), bi('讀取中', 'Reading'), bi('小偏壓感測', 'Small-bias sense'), bi('電流差異由產品感測電路解碼。', 'Current difference is decoded by the product sense circuit.'), { on: true, bias: 'READ', charge: -1 }],
        [bi('鎖存後隔離', 'Latch then Isolate'), bi('狀態保留', 'State retained'), bi('撤去選取', 'Selection removed'), bi('讀取擾動限制須核對目標巨集。', 'Read-disturb limits must be checked on the target macro.'), { charge: -1 }],
      ],
    },
    'nscore-twinbit': {
      write: [
        [bi('Pch Schottky 初態', 'Pch Schottky Initial State'), bi('未寫入', 'Unprogrammed'), bi('偏壓為零', 'Bias zero'), bi('Gen-2 公開為 Pch Schottky，零額外光罩。', 'Gen-2 is published as Pch Schottky with zero extra mask.'), {}],
        [bi('熱電洞寫入', 'Hot-Hole Program'), bi('寫入中', 'Programming'), bi('通道熱電洞注入', 'Channel hot-hole injection'), bi('箭頭表示熱電洞方向，不是偏壓表。', 'Arrows show hot-hole direction, not a bias table.'), { on: true, bias: 'PGM', holes: 3 }],
        [bi('保留熱電洞造成的閾值偏移', 'Retain the Threshold Shift from Hot Holes'), bi('寫入態', 'Programmed'), bi('撤去偏壓', 'Bias removed'), bi('未畫 PermSRAM 氮化側牆。', 'The PermSRAM SiN spacer is not drawn.'), { holes: 2 }],
      ],
      erase: [
        [bi('從熱電洞寫入態開始', 'Start from the Hot-Hole Programmed State'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('TwinBit 可電性抹除，與 OTP 的 PermSRAM 分開。', 'TwinBit is electrically erasable and is kept separate from OTP PermSRAM.'), { holes: 2 }],
        [bi('熱電子抹除', 'Hot-Electron Erase'), bi('抹除中', 'Erasing'), bi('熱電子補償或移出電洞效應', 'Hot electrons compensate or remove the hole effect'), bi('公開語句是抹除走熱電子。', 'The published statement is erase by hot electron.'), { on: true, bias: 'ERS', electrons: 3 }],
        [bi('回到可再寫狀態', 'Return to a Reprogrammable State'), bi('抹除態', 'Erased'), bi('撤去偏壓', 'Bias removed'), bi('40–22 nm 是原廠節點敘述，不是本圖量測。', '40–22 nm is a vendor node narrative, not a measurement in this drawing.'), {}],
      ],
      read: [
        [bi('同一 Schottky 單元待讀', 'The Same Schottky Cell Awaits Read'), bi('既有閾值', 'Existing threshold'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不重複熱載子寫入。', 'Read does not repeat hot-carrier program.'), { holes: 2 }],
        [bi('感測通道電流', 'Sense Channel Current'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('閾值偏移改變電流。', 'Threshold shift changes current.'), { on: true, bias: 'READ', holes: 2 }],
        [bi('鎖存後關閉選取', 'Latch then Deselect'), bi('狀態保留', 'State retained'), bi('偏壓為零', 'Bias zero'), bi('讀取窗口由供應商條件決定。', 'The read window is set by supplier conditions.'), { holes: 2 }],
      ],
    },
    'floadia-zt': {
      write: [
        [bi('浮動閘極初態', 'Floating-Gate Initial State'), bi('少電子', 'Few electrons'), bi('偏壓為零', 'Bias zero'), bi('ZT 新聞把儲存節點寫成浮動閘極。', 'ZT news names the storage node as a floating gate.'), { electrons: 0 }],
        [bi('FN 寫入電子進入 FG', 'FN Program: Electrons Enter FG'), bi('寫入中', 'Programming'), bi('FN 穿隧', 'FN tunneling'), bi('原廠寫明寫入與抹除都走 FN。', 'The vendor states both program and erase use FN.'), { on: true, bias: '＋VFN', electrons: 3 }],
        [bi('撤壓後電子留在 FG', 'Electrons Remain on FG after Bias Removal'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('循環次數不以頁面自相矛盾的數字為準。', 'Cycle counts do not follow the page’s conflicting numbers.'), { electrons: 3 }],
      ],
      erase: [
        [bi('從 FG 電子較多的狀態開始', 'Start with More Electrons on FG'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('抹除仍是 FN，不是熱載子。', 'Erase remains FN, not hot carrier.'), { electrons: 3 }],
        [bi('反向 FN 使電子離開 FG', 'Reverse FN Removes Electrons from FG'), bi('抹除中', 'Erasing'), bi('反向 FN', 'Reverse FN'), bi('教學圖不指定井電位數字。', 'The teaching drawing does not specify well-potential numbers.'), { on: true, bias: '−VFN', electrons: 1 }],
        [bi('FG 回到可再寫窗口', 'FG Returns to a Reprogrammable Window'), bi('抹除態', 'Erased'), bi('偏壓為零', 'Bias zero'), bi('零額外光罩是整合賣點，不是剖面證明。', 'Zero extra mask is an integration claim, not a cross-section proof.'), { electrons: 0 }],
      ],
      read: [
        [bi('同一 FG 待讀', 'The Same FG Awaits Read'), bi('既有 FG 電荷', 'Existing FG charge'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不走寫入級 FN。', 'Read does not use program-level FN.'), { electrons: 3 }],
        [bi('耦合端開啟，感測通道', 'Turn on Coupling and Sense the Channel'), bi('讀取中', 'Reading'), bi('小耦合電位', 'Small coupling potential'), bi('通道電流反映 FG 電荷。', 'Channel current reflects FG charge.'), { on: true, bias: 'READ', electrons: 3 }],
        [bi('鎖存後隔離', 'Latch then Isolate'), bi('電荷保留', 'Charge retained'), bi('偏壓為零', 'Bias zero'), bi('車規敘述須核對目標產品條件。', 'Automotive narrative must be checked against target product conditions.'), { electrons: 3 }],
      ],
    },
    'cfx-otp': {
      write: [
        [bi('完整閘極氧化層', 'Intact Gate Oxide'), bi('絕緣', 'Insulating'), bi('偏壓為零', 'Bias zero'), bi('此教學例只對應 Semi IP Hub 的閘極氧化層擊穿敘述。', 'This teaching case matches only the Semi IP Hub gate-oxide-breakdown narrative.'), {}],
        [bi('高電壓脈衝施加於閘極對基板', 'High-Voltage Pulse from Gate to Substrate'), bi('擊穿進行中', 'Breaking down'), bi('HV 脈衝', 'HV pulse'), bi('創飛芯另有 eFuse 與浮動閘極 OTP，不畫在此格。', 'CFX also has eFuse and floating-gate OTP, which are not drawn in this frame.'), { on: true, bias: 'HV', broken: false }],
        [bi('氧化層留下永久導通路徑', 'The Oxide Leaves a Permanent Conduction Path'), bi('已程式化', 'Programmed'), bi('撤去脈衝', 'Pulse removed'), bi('OTP 沒有電性抹除回到絕緣態。', 'OTP has no electrical erase back to insulation.'), { broken: true }],
      ],
      erase: [
        [bi('已擊穿的單元不可電性還原', 'A Broken-Down Cell Cannot Be Electrically Restored'), bi('永久導通', 'Permanently conducting'), bi('無抹除命令', 'No erase command'), bi('OTP 單元沒有回到完整氧化層的電性循環。', 'An OTP cell has no electrical cycle back to an intact oxide.'), { broken: true }],
        [bi('主機不可送出抹除脈衝', 'The Host Must Not Send an Erase Pulse'), bi('仍為導通', 'Still conducting'), bi('操作拒絕', 'Operation refused'), bi('若需要可重寫，應改看 MTP／eFlash 單元。', 'If rewrite is required, use an MTP or eFlash unit instead.'), { broken: true }],
        [bi('狀態只能被讀取', 'The State Can Only Be Read'), bi('OTP 終態', 'OTP final state'), bi('偏壓為零', 'Bias zero'), bi('三條 OTP 路線仍須在選型時分開核對。', 'The three OTP routes still must be checked separately during selection.'), { broken: true }],
      ],
      read: [
        [bi('完整與擊穿是兩種替代初態', 'Intact and Broken-Down Are Alternative Initial States'), bi('既有導通或絕緣', 'Already conducting or insulating'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不用寫入級高壓。', 'Read does not use program-level high voltage.'), { broken: true }],
        [bi('小偏壓感測導通與否', 'Sense Conduction at Small Bias'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('導通單元電流較大。', 'A conducting cell draws larger current.'), { on: true, bias: 'READ', broken: true }],
        [bi('鎖存後隔離', 'Latch then Isolate'), bi('狀態保留', 'State retained'), bi('偏壓為零', 'Bias zero'), bi('實際讀取時間與窗口由巨集定義。', 'Actual read time and window are defined by the macro.'), { broken: true }],
      ],
    },
    'attopsemi-ifuse': {
      write: [
        [bi('低阻熔絲初態', 'Low-Resistance Fuse Initial State'), bi('連續熔絲', 'Continuous fuse'), bi('偏壓為零', 'Bias zero'), bi('I-fuse 是熔絲，不是 MOS 氧化層。', 'I-fuse is a fuse, not a MOS oxide.'), {}],
        [bi('熱輔助電遷移，低於熱失控', 'Heat-Assisted Electromigration below Thermal Runaway'), bi('遷移中', 'Migrating'), bi('程式電流加熱', 'Program current heating'), bi('原廠明確排除爆炸式熔斷與 AntiFuse。', 'The vendor explicitly excludes explosive rupture and AntiFuse.'), { on: true, bias: 'I_PGM', heat: true }],
        [bi('熔絲電阻提高並保留', 'Fuse Resistance Rises and Is Retained'), bi('高阻態', 'High-R state'), bi('撤去電流', 'Current removed'), bi('poly／金屬閘／金屬熔絲都屬此家族，本圖不指定哪一種截面。', 'Poly, metal-gate, and metal fuses belong to this family; this drawing does not pick one cross-section.'), { migrated: true }],
      ],
      erase: [
        [bi('高阻熔絲不可電性還原', 'A High-R Fuse Cannot Be Electrically Restored'), bi('高阻', 'High R'), bi('無抹除電流', 'No erase current'), bi('OTP 熔絲沒有回到低阻的電性循環。', 'An OTP fuse has no electrical cycle back to low R.'), { migrated: true }],
        [bi('不可施加反向熔斷', 'Do Not Apply Reverse Blow'), bi('仍為高阻', 'Still high R'), bi('操作拒絕', 'Operation refused'), bi('這不是可重寫 MTP。', 'This is not a rewritable MTP.'), { migrated: true }],
        [bi('終態只能被讀取', 'The Final State Can Only Be Read'), bi('OTP 終態', 'OTP final state'), bi('偏壓為零', 'Bias zero'), bi('與傳統爆炸式 eFuse 的物理邊界必須保留。', 'The physics boundary versus conventional explosive eFuse must be kept.'), { migrated: true }],
      ],
      read: [
        [bi('低阻與高阻是替代初態', 'Low R and High R Are Alternative Initial States'), bi('既有電阻', 'Existing resistance'), bi('小感測電流', 'Small sense current'), bi('讀取電流遠小於程式電流。', 'Sense current is far below program current.'), { migrated: true }],
        [bi('比較熔絲電阻', 'Compare Fuse Resistance'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('高阻與低阻由感測電路分辨。', 'Sense circuits distinguish high R from low R.'), { on: true, bias: 'READ', migrated: true }],
        [bi('鎖存後撤去電流', 'Latch then Remove Current'), bi('電阻保留', 'Resistance retained'), bi('偏壓為零', 'Bias zero'), bi('讀取不應把熔絲推近熱失控。', 'Read must not drive the fuse near thermal runaway.'), { migrated: true }],
      ],
    },
    'floadia-za': {
      write: [
        [bi('完整 Anti-fuse 介電層', 'Intact Anti-Fuse Dielectric'), bi('絕緣', 'Insulating'), bi('偏壓為零', 'Bias zero'), bi('產品名是 LEE Fuse ZA。', 'The product name is LEE Fuse ZA.'), {}],
        [bi('高電壓造成介電層擊穿', 'High Voltage Breaks Down the Dielectric'), bi('擊穿中', 'Breaking down'), bi('HV', 'HV'), bi('零額外光罩是整合賣點；擊穿點位置未公開。', 'Zero extra mask is the integration claim; the breakdown site is unpublished.'), { on: true, bias: 'HV' }],
        [bi('留下永久導通路徑', 'Leave a Permanent Conduction Path'), bi('已程式化', 'Programmed'), bi('撤去高壓', 'High voltage removed'), bi('DRAM 1xnm 量產軌跡不能外推成每一邏輯節點的同一剖面。', 'A DRAM 1xnm production track cannot be extrapolated as the same cross-section on every logic node.'), { broken: true }],
      ],
      erase: [
        [bi('已擊穿單元沒有電性抹除', 'A Broken-Down Cell Has No Electrical Erase'), bi('永久導通', 'Permanently conducting'), bi('無抹除命令', 'No erase command'), bi('Anti-fuse OTP 與 LEE Flash ZT／G1／G2 分開。', 'Anti-fuse OTP is kept separate from LEE Flash ZT/G1/G2.'), { broken: true }],
        [bi('拒絕抹除操作', 'Refuse the Erase Operation'), bi('仍為導通', 'Still conducting'), bi('操作拒絕', 'Operation refused'), bi('頁面誤寫 LEE Flash ZA 不把本單元改成 eFlash。', 'A page typo of LEE Flash ZA does not turn this unit into eFlash.'), { broken: true }],
        [bi('終態只能讀取', 'The Final State Can Only Be Read'), bi('OTP 終態', 'OTP final state'), bi('偏壓為零', 'Bias zero'), bi('180 nm 至 sub-10 nm 是原廠節點敘述。', '180 nm to sub-10 nm is a vendor node narrative.'), { broken: true }],
      ],
      read: [
        [bi('絕緣與導通是替代初態', 'Insulation and Conduction Are Alternative Initial States'), bi('既有狀態', 'Existing state'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不用寫入級高壓。', 'Read does not use program-level high voltage.'), { broken: true }],
        [bi('小偏壓感測', 'Sense at Small Bias'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('導通單元電流較大。', 'A conducting cell draws larger current.'), { on: true, bias: 'READ', broken: true }],
        [bi('鎖存後隔離', 'Latch then Isolate'), bi('狀態保留', 'State retained'), bi('偏壓為零', 'Bias zero'), bi('實際規格以目標授權版本為準。', 'Actual specifications follow the licensed target version.'), { broken: true }],
      ],
    },
    'floadia-g1': {
      write: [
        [bi('SONOS 捕捉層初態', 'SONOS Trap-Layer Initial State'), bi('少捕捉電子', 'Few trapped electrons'), bi('偏壓為零', 'Bias zero'), bi('G1 公開為 SONOS、2–3 道光罩。', 'G1 is published as SONOS with 2–3 extra masks.'), {}],
        [bi('FN 使電子進入氮化層', 'FN Moves Electrons into the Nitride'), bi('寫入中', 'Programming'), bi('FN', 'FN'), bi('寫抹都走 FN。', 'Program and erase both use FN.'), { on: true, bias: '＋VFN', trapped: 3 }],
        [bi('電子留在捕捉層', 'Electrons Remain in the Trap Layer'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('O-N-O 厚度未公開。', 'O-N-O thickness is unpublished.'), { trapped: 3 }],
      ],
      erase: [
        [bi('從已捕捉電子開始', 'Start from Trapped Electrons'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('抹除不是熱電洞補償的 TwinBit 路徑。', 'Erase is not TwinBit hot-hole compensation.'), { trapped: 3 }],
        [bi('反向 FN 使電子離開氮化層', 'Reverse FN Removes Electrons from Nitride'), bi('抹除中', 'Erasing'), bi('反向 FN', 'Reverse FN'), bi('BCD 敘述不能外推到全部邏輯平台。', 'A BCD narrative cannot be extrapolated to every logic platform.'), { on: true, bias: '−VFN', trapped: 1 }],
        [bi('回到可再寫捕捉窗口', 'Return to a Reprogrammable Trap Window'), bi('抹除態', 'Erased'), bi('偏壓為零', 'Bias zero'), bi('光罩數是整合成本，不是耐久保證。', 'Mask count is integration cost, not an endurance guarantee.'), {}],
      ],
      read: [
        [bi('同一 SONOS 單元待讀', 'The Same SONOS Cell Awaits Read'), bi('既有捕捉電荷', 'Existing trapped charge'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不走寫入級 FN。', 'Read does not use program-level FN.'), { trapped: 3 }],
        [bi('感測通道電流', 'Sense Channel Current'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('捕捉電荷改變閾值。', 'Trapped charge shifts threshold.'), { on: true, bias: 'READ', trapped: 3 }],
        [bi('鎖存後隔離', 'Latch then Isolate'), bi('電荷保留', 'Charge retained'), bi('偏壓為零', 'Bias zero'), bi('讀取擾動須核對目標巨集。', 'Read disturb must be checked on the target macro.'), { trapped: 3 }],
      ],
    },
    'floadia-g2': {
      write: [
        [bi('側開關關閉的 SONOS 夾層單元', 'Sandwiched SONOS Cell with Side Switches Off'), bi('少捕捉電子', 'Few trapped electrons'), bi('開關關閉', 'Switches off'), bi('G2 把 SONOS 夾在開關電晶體之間。', 'G2 sandwiches SONOS between switch transistors.'), { switches: true }],
        [bi('經側開關施加 FN 寫入', 'Apply FN Program through Side Switches'), bi('寫入中', 'Programming'), bi('側開關開啟；FN', 'Side switches on; FN'), bi('4 道光罩是公開整合數字。', 'Four extra masks is the published integration number.'), { on: true, bias: '＋VFN', trapped: 3, switches: true }],
        [bi('關閉開關，電荷留在氮化層', 'Turn Switches Off; Charge Remains in Nitride'), bi('寫入態', 'Programmed'), bi('開關關閉', 'Switches off'), bi('原廠標為持續開發。', 'The vendor marks ongoing development.'), { trapped: 3, switches: true }],
      ],
      erase: [
        [bi('夾層單元仍持有捕捉電荷', 'The Sandwiched Cell Still Holds Trapped Charge'), bi('寫入態', 'Programmed'), bi('開關關閉', 'Switches off'), bi('抹除仍是電荷捕捉物理，不是熔絲。', 'Erase remains charge-trap physics, not a fuse.'), { trapped: 3, switches: true }],
        [bi('經側開關做反向 FN 抹除', 'Reverse FN Erase through Side Switches'), bi('抹除中', 'Erasing'), bi('側開關開啟；反向 FN', 'Side switches on; reverse FN'), bi('擴散端不需高壓是原廠讀取／邏輯賣點，抹除仍可能需要內部高壓產生。', 'No high voltage on diffusion is a vendor read/logic claim; erase may still need internal HV generation.'), { on: true, bias: '−VFN', trapped: 1, switches: true }],
        [bi('關閉開關，回到可再寫', 'Turn Switches Off and Return to Reprogrammable'), bi('抹除態', 'Erased'), bi('開關關閉', 'Switches off'), bi('開發中敘述不是量產保證。', 'An in-development note is not a production guarantee.'), { switches: true }],
      ],
      read: [
        [bi('VDD 讀取前先選取側開關', 'Select Side Switches before VDD Read'), bi('既有捕捉電荷', 'Existing trapped charge'), bi('準備 VDD 讀取', 'Prepare VDD read'), bi('原廠強調讀取走 VDD。', 'The vendor emphasizes read at VDD.'), { trapped: 3, switches: true }],
        [bi('側開關在 VDD 開啟並感測', 'Side Switches Turn On at VDD and Sense'), bi('讀取中', 'Reading'), bi('VDD；開關開啟', 'VDD; switches on'), bi('擴散端不施加寫入級高壓。', 'Diffusion terminals do not take program-level high voltage.'), { on: true, bias: 'VDD', trapped: 3, switches: true }],
        [bi('鎖存後關閉開關', 'Latch then Turn Switches Off'), bi('電荷保留', 'Charge retained'), bi('開關關閉', 'Switches off'), bi('不揮發化邏輯是產品定位，不是通用標準單元庫證明。', 'Non-volatilized logic is product positioning, not proof of a generic standard-cell library.'), { trapped: 3, switches: true }],
      ],
    },
    'sst-superflash': {
      write: [
        [bi('分裂閘極：選擇閘與浮動閘並列', 'Split Gate: Select Gate beside Floating Gate'), bi('FG 電子較少', 'Fewer FG electrons'), bi('偏壓為零', 'Bias zero'), bi('SuperFlash 公開為分裂閘極架構。', 'SuperFlash is published as a split-gate architecture.'), {}],
        [bi('源側注入把熱電子寫入 FG', 'Source-Side Injection Writes Hot Electrons into FG'), bi('寫入中', 'Programming'), bi('SSI', 'SSI'), bi('寫入機制是源側注入，不是通道熱電子的通用標籤。', 'The program mechanism is source-side injection, not a generic CHE label.'), { on: true, bias: 'PGM', inject: true, electrons: 3 }],
        [bi('電子留在 FG', 'Electrons Remain on FG'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('授權製程範圍不能當成單一節點證明。', 'The licensed process range is not proof of one node.'), { electrons: 3 }],
      ],
      erase: [
        [bi('FG 已有注入電子', 'FG Already Holds Injected Electrons'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('抹除走多晶矽間 FN，不是源側注入的逆過程電流。', 'Erase uses interpoly FN, not a reverse SSI current.'), { electrons: 3 }],
        [bi('多晶矽間 FN 使電子離開 FG', 'Interpoly FN Removes Electrons from FG'), bi('抹除中', 'Erasing'), bi('interpoly FN', 'interpoly FN'), bi('電子穿過選擇閘與浮動閘之間的氧化層。', 'Electrons cross the oxide between select gate and floating gate.'), { on: true, bias: 'ERS', erase: true, electrons: 1 }],
        [bi('FG 回到可再寫窗口', 'FG Returns to a Reprogrammable Window'), bi('抹除態', 'Erased'), bi('偏壓為零', 'Bias zero'), bi('教學圖不是特定代工廠量測剖面。', 'The teaching drawing is not a foundry metrology cross-section.'), {}],
      ],
      read: [
        [bi('同一分裂閘極單元待讀', 'The Same Split-Gate Cell Awaits Read'), bi('既有 FG 電荷', 'Existing FG charge'), bi('讀取偏壓待產品定義', 'Read bias is product-defined'), bi('讀取不重複 SSI 寫入。', 'Read does not repeat SSI program.'), { electrons: 3 }],
        [bi('選擇閘開啟並感測通道', 'Turn on Select Gate and Sense the Channel'), bi('讀取中', 'Reading'), bi('小偏壓', 'Small bias'), bi('通道電流反映 FG 電荷。', 'Channel current reflects FG charge.'), { on: true, bias: 'READ', electrons: 3 }],
        [bi('鎖存後關閉選擇閘', 'Latch then Turn off Select Gate'), bi('電荷保留', 'Charge retained'), bi('偏壓為零', 'Bias zero'), bi('讀取速度規格須核對目標授權版本。', 'Read-speed ratings must be checked on the licensed target version.'), { electrons: 3 }],
      ],
    },
    'chingis-pfusion': {
      write: [
        [bi('P-Channel 浮閘單元：待編程狀態', 'P-Channel FG Cell: Ready to Program'), bi('初始浮閘中性或少電洞', 'Initial FG neutral or few holes'), bi('偏壓為零', 'Bias zero'), bi('常億 pFusion 採 PMOS 浮閘架構。', 'Chingis pFusion uses a PMOS floating-gate architecture.'), {}],
        [bi('BBHH 帶帶穿隧誘發熱電洞注入', 'BBHH Band-to-Band Hot-Hole Injection'), bi('寫入中', 'Programming'), bi('汲極反偏；BBHH 注入', 'Drain reverse-biased; BBHH injection'), bi('帶帶穿隧在汲極能帶彎曲處激發熱電洞，高效注入 FG；寫入電流僅微安培級。', 'Band-to-band tunneling generates hot holes injected into FG; programming current is microamp-class.'), { on: true, bias: 'V_BBHH', bbhh: true, holes: 3 }],
        [bi('熱電洞累積於浮閘，PMOS 導通', 'Hot Holes Retained in FG; PMOS Conducts'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('熱電洞降低浮閘電位使通道導通，片上電荷泵負擔極小。', 'Holes lower FG potential to turn on channel, minimizing charge pump overhead.'), { holes: 3 }],
      ],
      erase: [
        [bi('單元持有累積電洞電荷', 'Cell Holds Accumulated Hole Charge'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('抹除走 FN 穿隧，不是熔絲。', 'Erase uses FN tunneling, not a fuse.'), { holes: 3 }],
        [bi('高電場 FN 穿隧導出電洞／注入電子', 'High-Field FN Tunneling Depletes Holes / Injects Electrons'), bi('抹除中', 'Erasing'), bi('FN 抹除偏壓', 'FN Erase Bias'), bi('FN 電場使浮閘回到中性或高閾值抹除窗口。', 'FN electric field restores FG to neutral or high-threshold erase window.'), { on: true, bias: 'V_FN', erase: true, holes: 1 }],
        [bi('浮閘回到可再寫抹除態', 'FG Restored to Reprogrammable Window'), bi('抹除態', 'Erased'), bi('偏壓為零', 'Bias zero'), bi('單元進入高阻或截止狀態，可再次執行 BBHH 寫入。', 'Cell enters off-state, ready for next BBHH program.'), {}],
      ],
      read: [
        [bi('P-Channel 浮閘單元待讀取', 'P-Channel FG Cell Awaits Read'), bi('既有浮閘狀態', 'Existing FG state'), bi('準備感測', 'Prepare sensing'), bi('讀取操作以低刺激進行。', 'Read operates at low electrical stress.'), { holes: 3 }],
        [bi('施加微小讀取偏壓感測 P 溝道', 'Apply Small Read Bias to Sense P-Channel'), bi('讀取中', 'Reading'), bi('讀取偏壓 V_READ', 'Read bias V_READ'), bi('導通通道電流反映浮閘電洞累積量。', 'Channel conduction current reflects accumulated FG holes.'), { on: true, bias: 'V_READ', holes: 3 }],
        [bi('感測放大器鎖存資料', 'Sense Amplifier Latches Data'), bi('資料鎖存', 'Data latched'), bi('偏壓復原', 'Bias restored'), bi('極低讀取擾動，保障數十年高溫資料留存。', 'Low read disturb ensures multi-decade high-temp retention.'), { holes: 3 }],
      ],
    },
    'iotmemory-silvoflash': {
      write: [
        [bi('SilvoFlash 超低壓單元：待寫入', 'SilvoFlash Ultra-Low-Voltage Cell: Ready'), bi('浮閘無累積電荷', 'FG uncharged'), bi('偏壓為零', 'Bias zero'), bi('專利 CMOS 相容單層/低光罩結構。', 'Patented CMOS-compatible single-poly / low-mask structure.'), {}],
        [bi('內部微電荷泵穿隧注入', 'Internal Micro-Pump Tunneling Injection'), bi('寫入中', 'Programming'), bi('穿隧寫入脈衝', 'Tunneling write pulse'), bi('低功耗電荷泵提供局部穿隧電場，不干擾外部邏輯。', 'Low-power pump provides local tunneling field without external logic disturbance.'), { on: true, bias: 'V_PGM', electrons: 3 }],
        [bi('電荷保留於浮閘，完成寫入', 'Charge Retained on FG; Program Complete'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('單元完成資料寫入，回到待機低漏電態。', 'Cell completes data storage and returns to low-leakage standby.'), { electrons: 3 }],
      ],
      erase: [
        [bi('單元持有儲存電荷', 'Cell Holds Stored Charge'), bi('寫入態', 'Programmed'), bi('偏壓為零', 'Bias zero'), bi('可重複抹除多次，支援 Code Flash 與 Data EEPROM 雙模。', 'Multiple rewrites supported; dual-mode for Code Flash and Data EEPROM.'), { electrons: 3 }],
        [bi('穿隧抹除導出電荷', 'Tunneling Erase Discharges FG'), bi('抹除中', 'Erasing'), bi('抹除脈衝', 'Erase pulse'), bi('電荷自浮閘導出，恢復未寫入臨界電壓。', 'Charge discharged from FG, restoring virgin threshold voltage.'), { on: true, bias: 'V_ERS', electrons: 1 }],
        [bi('回到可再寫窗口', 'Cell Restored to Reprogrammable Window'), bi('抹除態', 'Erased'), bi('偏壓為零', 'Bias zero'), bi('兼具 SilvoFlash 代碼與 SilvoFE 資料儲存特性。', 'Features both SilvoFlash code and SilvoFE data storage.'), {}],
      ],
      read: [
        [bi('原生 0.9V–1.2V 核心電壓就緒', 'Native 0.9V–1.2V Core Voltage Ready'), bi('既有儲存狀態', 'Existing stored state'), bi('核心供電軌 VDD', 'Core supply rail VDD'), bi('無需升壓電荷泵，破除傳統 eFlash ≥1.8V 讀取壁壘。', 'No read charge pump needed, eliminating the ≥1.8V conventional barrier.'), { electrons: 3 }],
        [bi('以 0.9V–1.2V 原生讀取通道', 'Sense Channel at Native 0.9V–1.2V'), bi('讀取中', 'Reading'), bi('VDD = 0.9V~1.2V', 'VDD = 0.9V~1.2V'), bi('與近閾值 CPU 核心共用供電軌直接讀出，量產於 DDR5 SPD IC。', 'Direct readout sharing power rail with near-threshold core; qualified in DDR5 SPD ICs.'), { on: true, bias: '0.9V', electrons: 3 }],
        [bi('讀取完成，零升壓待機', 'Read Complete; Zero-Boost Standby'), bi('資料鎖存', 'Data latched'), bi('維持核心供電', 'Core rail maintained'), bi('大幅縮減靜態待機漏電，為 IoT 與邊緣 SoC 提供高能效。', 'Minimizes standby leakage for high-efficiency IoT and edge SoCs.'), { electrons: 3 }],
      ],
    },
  }[id][operation];
  for (let i = 0; i < script.length; i++) {
    const [title, state, stimulus, caption, props] = script[i];
    const c = canvas(id, operation, language, i + 1);
    const body = cellBody(id, c, props) + c.text(20, 338, '原創結構示意；非比例剖面', 'Original Structure Model; Not to Scale', 'start', C.muted);
    frames.push(record(c, title, caption, state, stimulus, body, language, sourceIds));
  }
  return frames;
}

export function getIPStudy(id, language = 'en') {
  if (!Object.hasOwn(META, id)) return null;
  if (language !== 'zh' && language !== 'en') throw new TypeError('Unsupported language');
  const meta = META[id];
  const sources = localSources(meta.refs, language);
  const sourceIds = sources.map(item => item.id);
  const legend = legendFor(id, language);
  const title = pick(meta.name, language);
  const caption = pick(meta.structure, language);
  const c = canvas(id, 'structure', language, 0);
  const structureBody = cellBody(id, c, {}) + c.text(20, 338, '原創結構示意；非比例剖面', 'Original Structure Model; Not to Scale', 'start', C.muted);
  const operations = ['write', 'erase', 'read'].map(operationId => {
    const action = operationId === 'read' ? bi('讀取', 'Read') : operationId === 'erase' ? bi('抹除／還原限制', 'Erase / Restore Limit') : bi('寫入', 'Write');
    const frames = framesFor(id, operationId, language, sourceIds);
    const summary = pick(operationId === 'read' ? bi('以產品讀取條件感測已保留狀態，再鎖存與隔離。', 'Sense the retained state under product read conditions, then latch and isolate.') : operationId === 'erase' ? bi(META[id].hostTopic === 'antifuse' || META[id].hostTopic === 'efuse' ? 'OTP 沒有電性抹除回到初態；本段只標出還原限制。' : '依公開機制做電性抹除，使單元回到可再寫窗口。', META[id].hostTopic === 'antifuse' || META[id].hostTopic === 'efuse' ? 'OTP has no electrical erase back to the initial state; this section only marks the restore limit.' : 'Electrically erase by the published mechanism so the cell returns to a reprogrammable window.') : bi('依公開機制建立寫入態，不拼接未公開偏壓表。', 'Establish the programmed state by the published mechanism without splicing unpublished bias tables.'), language);
    return { topicId: `ip-${id}`, operationId, title: `${title} — ${pick(action, language)}`, summary, sources, variants: [{ id: 'published-model', title: pick(meta.model, language), mechanism: pick(meta.mechanism, language), summary, frames, legend, sources, caveat: pick(meta.caveat, language) }] };
  });
  return { id, structure: { title, svg: svg(c, title, caption, structureBody), caption, legend, sourceIds }, operations };
}
