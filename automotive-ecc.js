import { ECC_POSITIONS, inspectErrorMask } from './automotive-model.js';

const element = id => document.getElementById(id);
const text = (zh, en) => window.HubLanguage?.get() === 'zh' ? zh : en;
const deck = element('eccBitsDeck');
const flipped = new Set();
const buttons = ECC_POSITIONS.map((position, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ecc-bit-node' + (index >= 64 ? ' parity' : '');
  button.dataset.bit = String(index);
  button.textContent = index < 64 ? `D${index}` : `P${index - 64}`;
  button.addEventListener('click', () => {
    flipped.has(index) ? flipped.delete(index) : flipped.add(index);
    render();
  });
  deck.append(button);
  return button;
});

function render() {
  const result = inspectErrorMask(flipped);
  buttons.forEach((button, index) => {
    button.classList.toggle('flipped', flipped.has(index));
    button.setAttribute('aria-pressed', String(flipped.has(index)));
    button.setAttribute('aria-label', `${button.textContent} · ${text('碼字位置', 'codeword position')} ${ECC_POSITIONS[index]}`);
  });
  let response = text('未偵測到錯誤', 'No error detected');
  if (result.decoder === 'correctable') response = result.syndrome === 0
    ? text('整體同位位元 P7 可校正', 'Overall parity P7 is correctable')
    : text(`碼字位置 ${result.syndrome} 可校正`, `Codeword position ${result.syndrome} is correctable`);
  if (result.decoder === 'uncorrectable') response = text('偵測到不可校正錯誤', 'Uncorrectable error detected');
  const pill = element('eccStatusPill');
  pill.className = 'ecc-status-pill ' + (!result.withinGuarantee || result.decoder === 'uncorrectable' ? 'ded' : result.decoder === 'correctable' ? 'sec' : 'clean');
  pill.textContent = text(`已注入 ${result.injected} 個錯誤`, `${result.injected} injected errors`) + (!result.withinGuarantee ? text(' · 超出 SECDED 保證範圍', ' · Outside SECDED guarantee') : '');
  element('eccSyndromeVal').textContent = `S = 0x${result.syndrome.toString(16).toUpperCase().padStart(2, '0')} · P = ${result.parity}`;
  element('eccActionVal').textContent = (!result.withinGuarantee ? text('解碼器輸出（不保證）：', 'Decoder output (not guaranteed): ') : '') + response;
  element('eccSafetyVal').textContent = result.withinGuarantee
    ? text('編碼示範；未寫回校正，不代表 ASIL 或 FTTI 驗證。', 'Coding demonstration; no correction write-back, ASIL or FTTI validation.')
    : text('已知超過兩位元，可能誤校正或漏檢；不能據此判定安全。', 'Known injection exceeds two bits; miscorrection or missed detection is possible. No safety conclusion.');
  Object.assign(deck.dataset, { syndrome: result.syndrome, parity: result.parity, errors: result.injected, decoder: result.decoder, state: result.withinGuarantee ? result.decoder : 'outside-guarantee' });
}

function inject(indices) { flipped.clear(); indices.forEach(i => flipped.add(i)); render(); }
element('btnInjectSingle').addEventListener('click', () => inject([14]));
element('btnInjectDouble').addEventListener('click', () => inject([14, 15]));
element('btnResetEcc').addEventListener('click', () => inject([]));
element('eccStatusPill').setAttribute('aria-live', 'polite');
window.addEventListener('hub:language-change', render);
render();
