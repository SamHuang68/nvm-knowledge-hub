import { NEUTRAL, MATERIAL, EMERGING } from '../visual-tokens.js';
/**
 * 2.5D 等角爆炸圖：把單元的層次拆開排列，圖內只放編號，名稱與說明放在 HTML（中英共用同一張圖）。
 * 方塊資料同時供 3D 試點（iso-3d-view.js）使用，兩種檢視不另建第二份結構。
 * 層次順序依各專題既有來源的一般結構；厚度、間距與寬度為閱讀而調整，不依比例。
 */
const C = Object.freeze({ink:NEUTRAL.ink,line:NEUTRAL.line,white:NEUTRAL.white,silicon:MATERIAL.silicon,doped:MATERIAL.doped,oxide:MATERIAL.oxide,poly:MATERIAL.floatingGate,metal:MATERIAL.metal,electrode:EMERGING.electrode,electrodeLight:EMERGING.electrodeLight,barrier:EMERGING.switchingOxide,free:EMERGING.freeLayer,reference:EMERGING.referenceLayer,copper:EMERGING.copper});
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair = (zh, en) => ({zh, en});
// o：不透明度。翻面朝下的上晶粒以半透明呈現，才看得到朝下的銅墊。
const box = (g, x, y, z, w, d, h, color, o = 1) => ({g, x, y, z, w, d, h, color, o});

// 每個結構：groups 依由下而上的編號；boxes 的 g 指向所屬群組。
export const ISOMETRIC_MODELS = Object.freeze({
  stt: {
    title: pair('MTJ 堆疊爆炸圖', 'Exploded MTJ Stack'),
    groups: [pair('底電極', 'Bottom electrode'), pair('參考層（磁化固定）', 'Reference layer (fixed magnetization)'), pair('MgO 穿隧阻障', 'MgO tunnel barrier'), pair('自由層（磁化可翻轉）', 'Free layer (switchable magnetization)'), pair('頂電極', 'Top electrode')],
    boxes: [box(0, 0, 0, 0, 10, 10, 1.4, C.electrode), box(1, 1, 1, 0, 8, 8, 1.4, C.reference), box(2, 1, 1, 0, 8, 8, 0.6, C.barrier), box(3, 1, 1, 0, 8, 8, 1.1, C.free), box(4, 1.5, 1.5, 0, 7, 7, 1.4, C.electrodeLight)],
    caveat: pair('依本專題的上自由層／MgO／下參考層垂直 MTJ 示意；未畫出合成反鐵磁層與釘扎層，厚度未依比例。', 'Follows this topic\'s perpendicular MTJ with the free layer above MgO and the reference layer below; synthetic antiferromagnet and pinning layers are omitted, and thicknesses are not to scale.')
  },
  vcm: {
    title: pair('1T1R 陣列片段爆炸圖', 'Exploded 1T1R Array Segment'),
    groups: [pair('基板與選擇電晶體（簡化為閘極條）', 'Substrate and access transistors (gate lines, simplified)'), pair('下電極', 'Bottom electrode'), pair('切換氧化層', 'Switching oxide'), pair('上電極（氧交換界面）', 'Top electrode (oxygen-exchange interface)'), pair('位元線', 'Bit lines')],
    boxes: [box(0, 0, 0, 0, 12, 12, 1, C.silicon), box(0, 0, 2, 1, 12, 1.4, 0.8, C.poly), box(0, 0, 8.6, 1, 12, 1.4, 0.8, C.poly),
      ...[[2, 2], [8, 2], [2, 8], [8, 8]].flatMap(([x, y]) => [box(1, x, y, 0, 2, 2, 0.8, C.metal), box(2, x, y, 0, 2, 2, 1, C.barrier), box(3, x, y, 0, 2, 2, 0.8, C.electrodeLight)]),
      box(4, 2, 0, 0, 2, 12, 0.9, C.electrode), box(4, 8, 0, 0, 2, 12, 0.9, C.electrode)],
    caveat: pair('2 × 2 單元片段：每個交點一個電阻元件，下方各接一個選擇電晶體；電晶體只以閘極條示意，接觸窗與內連線省略。', '2 × 2 segment: one resistive element at each crossing, each above an access transistor shown only as gate lines; contacts and interconnect are omitted.')
  },
  antifuse: {
    title: pair('反熔絲 2T 單元爆炸圖', 'Exploded 2T Antifuse Cell'),
    groups: [pair('p 型基板', 'p-type substrate'), pair('n+ 擴散區', 'n+ diffusions'), pair('閘極氧化層（左：選擇管；右：反熔絲薄氧化層）', 'Gate oxide (left: select device; right: thin antifuse oxide)'), pair('多晶矽閘極（字元線與編程閘極）', 'Polysilicon gates (word line and program gate)')],
    boxes: [box(0, 0, 0, 0, 14, 8, 1.2, C.silicon), box(1, 0.5, 1, 0, 2.5, 6, 0.7, C.doped), box(1, 5.75, 1, 0, 2.5, 6, 0.7, C.doped), box(1, 11, 1, 0, 2.5, 6, 0.7, C.doped),
      box(2, 3.25, 1, 0, 2.3, 6, 0.8, C.oxide), box(2, 8.5, 1, 0, 2.3, 6, 0.35, C.oxide), box(3, 3.25, 1, 0, 2.3, 6, 1.4, C.poly), box(3, 8.5, 1, 0, 2.3, 6, 1.4, C.poly)],
    caveat: pair('左為選擇電晶體、右為薄氧化層反熔絲，兩者共用中間的 n+ 區；編程時右側氧化層崩潰形成導通路徑。厚度與間距未依比例。', 'Select transistor on the left and thin-oxide antifuse on the right, sharing the middle n+ region; programming breaks down the right oxide to form a conductive path. Thicknesses and spacing are not to scale.')
  },
  'hybrid-bonding': {
    title: pair('混合鍵合爆炸圖', 'Exploded Hybrid Bond'),
    groups: [pair('下晶粒矽基板', 'Bottom die silicon'), pair('下晶粒介電層與銅墊', 'Bottom die dielectric and Cu pads'), pair('上晶粒介電層與銅墊（翻面朝下）', 'Top die dielectric and Cu pads (flipped face down)'), pair('上晶粒矽基板', 'Top die silicon')],
    boxes: [box(0, 0, 0, 0, 12, 12, 1.6, C.silicon), box(1, 0, 0, 0, 12, 12, 1, C.barrier), ...[[2, 2], [7.5, 2], [2, 7.5], [7.5, 7.5]].map(([x, y]) => box(1, x, y, 1, 2.5, 2.5, 0.25, C.copper)),
      ...[[2, 2], [7.5, 2], [2, 7.5], [7.5, 7.5]].map(([x, y]) => box(2, x, y, 0, 2.5, 2.5, 0.25, C.copper)), box(2, 0, 0, 0.25, 12, 12, 1, C.barrier, 0.5), box(3, 0, 0, 0, 12, 12, 1.6, C.silicon, 0.4)],
    caveat: pair('兩片晶粒面對面：介電層對介電層先接合，銅墊對銅墊在退火後接合。銅墊尺寸、間距與厚度未依比例。', 'Two dies face to face: dielectric bonds to dielectric first, and the Cu pads bond after anneal. Pad size, pitch and thickness are not to scale.')
  }
});

const SCALE = 14;
const GAP = 1.8;
const COS = Math.cos(Math.PI / 6), SIN = Math.sin(Math.PI / 6);
const project = (x, y, z) => [(x - y) * COS * SCALE, ((x + y) * SIN - z) * SCALE];

// 依群組往上分開：每組底部落在前一組頂部再加間隙。
export function explodedBoxes(model) {
  const result = [];
  let base = 0;
  for (const group of [...new Set(model.boxes.map(item => item.g))].sort((a, b) => a - b)) {
    const own = model.boxes.filter(item => item.g === group).map(item => ({...item, z: item.z + base}));
    result.push(...own);
    base = Math.max(...own.map(item => item.z + item.h)) + GAP;
  }
  return result;
}

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = shift => Math.round(((value >> shift) & 255) * (1 - amount));
  return '#' + [16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('');
}

/**
 * @param {string} id
 * @return {string} SVG（只有編號，沒有文字標籤）。
 */
export function isometricSvg(id) {
  const model = ISOMETRIC_MODELS[id];
  if (!model) return '';
  const boxes = explodedBoxes(model).sort((a, b) => a.z - b.z || (a.x + a.y) - (b.x + b.y));
  const faces = boxes.map(item => {
    const {x, y, z, w, d, h} = item;
    const polygon = (points, fill) => `<polygon points="${points.map(point => project(...point).map(value => value.toFixed(1)).join(',')).join(' ')}" fill="${fill}"${item.o < 1 ? ` fill-opacity="${item.o}"` : ''} stroke="${C.ink}" stroke-width="0.9" stroke-linejoin="round"/>`;
    return polygon([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], shade(item.color, 0.12))
      + polygon([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], shade(item.color, 0.24))
      + polygon([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], item.color);
  }).join('');
  const points = boxes.flatMap(({x, y, z, w, d, h}) => [[x, y, z], [x + w, y + d, z], [x + w, y, z], [x, y + d, z], [x, y, z + h], [x + w, y + d, z + h], [x + w, y, z + h], [x, y + d, z + h]].map(point => project(...point)));
  const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
  // 編號：每組取最右側方塊的右側面中心，水平拉到右側欄位，垂直間距至少 26。
  const lane = maxX + 34;
  let last = -Infinity;
  const callouts = model.groups.map((_, index) => {
    const own = boxes.filter(item => item.g === index);
    const anchor = own.reduce((best, item) => (item.x + item.w - item.y) > (best.x + best.w - best.y) ? item : best);
    const [ax, ay] = project(anchor.x + anchor.w, anchor.y + anchor.d / 2, anchor.z + anchor.h / 2);
    return {index, ax, ay};
  }).sort((a, b) => b.ay - a.ay).map(item => {
    const y = Math.min(item.ay, last === -Infinity ? item.ay : last - 26);
    last = y;
    return {...item, y};
  }).map(({index, ax, ay, y}) => `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${(lane - 24).toFixed(1)} ${y.toFixed(1)}H${(lane - 11).toFixed(1)}" fill="none" stroke="${C.line}" stroke-width="1.2"/><circle cx="${lane.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${C.white}" stroke="${C.ink}" stroke-width="1.4"/><text x="${lane.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="${C.ink}">${index + 1}</text>`).join('');
  const callY = callouts.match(/cy="(-?[\d.]+)"/g)?.map(v => Number(v.slice(4, -1))) ?? [];
  const top = Math.min(minY, ...callY) - 16, bottom = Math.max(maxY, ...callY) + 16;
  const left = minX - 12, width = lane + 24 - left;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left.toFixed(1)} ${top.toFixed(1)} ${width.toFixed(1)} ${(bottom - top).toFixed(1)}" data-isometric="${esc(id)}" data-engineering-palette>${faces}${callouts}</svg>`;
}

/**
 * @param {string} id
 * @param {'zh'|'en'} language
 * @return {string} 含 SVG、中英編號說明與限制的 figure；沒有定義時回傳空字串。
 */
export function isometricFigure(id, language) {
  const model = ISOMETRIC_MODELS[id];
  if (!model) return '';
  const t = (zh, en) => language === 'en' ? en : zh;
  const pick = value => value[language === 'en' ? 'en' : 'zh'];
  const legend = model.groups.map((group, index) => `<li><span class="nvm-iso-number">${index + 1}</span>${esc(pick(group))}</li>`).join('');
  const description = `${pick(model.title)}${t('：由下而上 ', ': bottom to top, ')}${model.groups.map((group, index) => `${index + 1} ${pick(group)}`).join(t('、', ', '))}`;
  // 3D 試點只在 STT：同一組爆炸後的方塊交給 iso-3d-view.js；按鈕預設隱藏，有 JavaScript 時才顯示。
  const solid = THREE_D.has(id) ? `<button type="button" class="nvm-iso-3d-toggle" data-iso-3d aria-pressed="false" hidden>${t('以 3D 檢視（可旋轉）', 'View in 3D (rotatable)')}</button><div class="nvm-iso-3d" hidden><div class="nvm-iso-stage" data-iso-3d-stage tabindex="0" role="img" aria-label="${esc(description + t('。拖曳或方向鍵旋轉，Home 回到預設角度。', '. Drag or use the arrow keys to rotate; Home resets the view.'))}"></div><p class="nvm-iso-hint">${t('拖曳或用方向鍵旋轉，Home 回到預設角度。示意立體圖，厚度與間距未依比例。', 'Drag or use the arrow keys to rotate; Home resets the view. Illustrative solid; thickness and spacing are not to scale.')}</p><button type="button" class="nvm-iso-3d-reset" data-iso-3d-reset>${t('重設角度', 'Reset view')}</button></div>` : '';
  const data = THREE_D.has(id) ? ` data-iso-model="${esc(JSON.stringify({boxes: explodedBoxes(model).map(({g, x, y, z, w, d, h, color, o}) => ({g, x, y, z: Number(z.toFixed(2)), w, d, h, color, o}))}))}"` : '';
  return `<figure class="nvm-iso" data-isometric-figure="${esc(id)}"${data}><figcaption class="nvm-iso-title"><strong>${esc(pick(model.title))}</strong><span>${t('2.5D 等角示意 · 由下而上編號', '2.5D isometric sketch · numbered bottom to top')}</span></figcaption><div class="nvm-iso-drawing" role="img" aria-label="${esc(description)}">${isometricSvg(id)}</div><ol class="nvm-iso-legend">${legend}</ol><p class="nvm-iso-caveat">${esc(pick(model.caveat))}</p>${solid}</figure>`;
}

const THREE_D = new Set(['stt']);

/**
 * 中英並列的版本，給以 data-lang 切換語言、沒有載入 atlas 樣式的手寫頁使用；樣式寫在行內。
 * @param {string} id
 * @return {string}
 */
export function isometricBilingualFigure(id) {
  const model = ISOMETRIC_MODELS[id];
  if (!model) return '';
  const both = value => `<span data-lang="zh">${esc(value.zh)}</span><span data-lang="en">${esc(value.en)}</span>`;
  const number = `display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-right:8px;border:1.4px solid ${C.ink};border-radius:50%;font-size:12px;font-weight:700;color:${C.ink};background:${C.white};flex:none`;
  const legend = model.groups.map((group, index) => `<li style="display:flex;align-items:flex-start;margin:0 0 6px;font-size:14px;line-height:1.6;color:#334155"><span style="${number}">${index + 1}</span><span>${both(group)}</span></li>`).join('');
  const label = language => `${model.title[language]}${language === 'zh' ? '：由下而上 ' : ': bottom to top, '}${model.groups.map((group, index) => `${index + 1} ${group[language]}`).join(language === 'zh' ? '、' : ', ')}`;
  return `<figure class="nvm-iso-bilingual" data-isometric-figure="${esc(id)}" style="margin:0 0 24px;padding:18px 20px;background:#ffffff;border:1px solid #d9e2e7;border-radius:6px"><figcaption style="display:flex;flex-direction:column;gap:2px;margin-bottom:12px"><strong style="font-size:16px;color:#163449">${both(model.title)}</strong><span style="font-size:13px;color:#475569"><span data-lang="zh">2.5D 等角示意 · 由下而上編號</span><span data-lang="en">2.5D isometric sketch · numbered bottom to top</span></span></figcaption><div role="img" aria-label="${esc(label('en'))}" data-aria-en="${esc(label('en'))}" data-aria-zh="${esc(label('zh'))}" style="max-width:520px">${isometricSvg(id)}</div><ol style="list-style:none;padding:0;margin:12px 0 0">${legend}</ol><p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:#475569">${both(model.caveat)}</p></figure>`;
}
