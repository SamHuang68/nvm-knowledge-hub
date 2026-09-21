export const UNITS = { Mb: 1000000n, Gb: 1000000000n, Tb: 1000000000000n, Mib: 1048576n, Gib: 1073741824n, Tib: 1099511627776n };
export const DEFAULT = { capacity: '16', unit: 'Gb', repair: '1/1000', compression: '100', mode: 'ratio', otp: { overhead: '0', reserve: '0', block: '1' }, efuse: { overhead: '0', reserve: '0', block: '1' } };
const MAX = 9007199254740991n;
export class InputError extends Error { constructor(field, message) { super(message); this.field = field; } }
const fail = (field, message) => { throw new InputError(field, message); };
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function rational(n, d) { if (!d) throw new Error('zero denominator'); const g = gcd(n < 0n ? -n : n, d); return { n: n / g, d: d / g }; }
export function decimal(value, field = '') {
  const s = String(value).trim();
  if (s.length > 36 || !/^\+?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) fail(field, '請輸入有效的非負數字。');
  const [mantissa, exp = '0'] = s.replace('+', '').toLowerCase().split('e');
  const exponent = Number(exp);
  if (Math.abs(exponent) > 15) fail(field, '數值超出可計算範圍。');
  const parts = mantissa.split('.');
  const digits = (parts[0] || '0') + (parts[1] || '');
  const scale = (parts[1] || '').length - exponent;
  return rational(BigInt(digits) * (scale < 0 ? 10n ** BigInt(-scale) : 1n), scale > 0 ? 10n ** BigInt(scale) : 1n);
}
export const ceil = (n, d = 1n) => (n + d - 1n) / d;
const bounded = (n, field) => { if (n > MAX) fail(field, '計算結果超出 9,007,199,254,740,991 bits，請縮小參數。'); return n; };
export function repairFraction(value) {
  const text = String(value).replace(/\s/g, '');
  let r;
  if (text.endsWith('%')) { const a = decimal(text.slice(0, -1), 'repair'); r = rational(a.n, a.d * 100n); }
  else if (text.includes('/')) {
    const p = text.split('/');
    if (p.length !== 2) fail('repair', '比例格式為 1/1000、0.001 或 0.1%。');
    const a = decimal(p[0], 'repair'), b = decimal(p[1], 'repair');
    if (!b.n) fail('repair', '比例的分母必須大於 0。');
    r = rational(a.n * b.d, a.d * b.n);
  } else r = decimal(text, 'repair');
  if (!r.n || r.n > r.d) fail('repair', '原始修復資料比例須大於 0，且不超過 1（100%）。');
  return r;
}
export function retainedFraction(value, mode) {
  const c = decimal(value, 'compression');
  if (mode === 'ratio') { if (c.n < c.d) fail('compression', '壓縮倍率須大於或等於 1。'); return rational(c.d, c.n); }
  if (mode === 'retained') { if (!c.n || c.n > 100n * c.d) fail('compression', '保留比例須大於 0%，且不超過 100%。'); return rational(c.n, c.d * 100n); }
  if (mode === 'reduction') { if (c.n >= 100n * c.d) fail('compression', '減少比例須介於 0%（含）與 100%（不含）。'); return rational(c.d * 100n - c.n, c.d * 100n); }
  fail('compression', '請選擇有效的壓縮率定義。');
}
function percentage(value, field) {
  const r = decimal(value, field);
  if (r.n > 1000n * r.d) fail(field, '請輸入 0% 至 1000%。');
  return r;
}
export function allocate(payload, config, prefix = 'otp') {
  const h = percentage(config.overhead, prefix + '-overhead');
  const r = percentage(config.reserve, prefix + '-reserve');
  const b = decimal(config.block, prefix + '-block');
  if (b.n % b.d || b.n / b.d < 1n || b.n / b.d > MAX) fail(prefix + '-block', '配置粒度須為 1 至 9,007,199,254,740,991 的整數 bits。');
  const block = b.n / b.d;
  const overhead = ceil(payload * h.n, 100n * h.d);
  const reserve = ceil((payload + overhead) * r.n, 100n * r.d);
  const required = payload + overhead + reserve;
  const allocated = bounded(ceil(required, block) * block, prefix + '-block');
  return { payload, overhead, reserve, required, allocated, padding: allocated - required, block, blocks: allocated / block };
}
export function estimate(state) {
  const cap = decimal(state.capacity, 'capacity');
  if (!cap.n) fail('capacity', 'SRAM 容量必須大於 0。');
  if (!UNITS[state.unit]) fail('capacity', '請選擇有效的容量單位。');
  const capacity = bounded(ceil(cap.n * UNITS[state.unit], cap.d), 'capacity');
  const repair = repairFraction(state.repair);
  const retained = retainedFraction(state.compression, state.mode);
  const raw = ceil(capacity * repair.n, repair.d);
  const payload = ceil(raw * retained.n, retained.d);
  return { capacity, repair, retained, ratio: Number(retained.d) / Number(retained.n), raw, payload, saved: raw - payload, otp: allocate(payload, state.otp, 'otp'), efuse: allocate(payload, state.efuse, 'efuse') };
}
export const integer = n => BigInt(n).toLocaleString('en-US');
const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });
export function compact(bits, binary = false) {
  const b = Number(bits), base = binary ? 1024 : 1000;
  const labels = binary ? ['bits', 'Kib', 'Mib', 'Gib', 'Tib'] : ['bits', 'kb', 'Mb', 'Gb', 'Tb'];
  const i = b < 1 ? 0 : Math.min(Math.floor(Math.log(b) / Math.log(base)), 4);
  return { value: nf.format(b / base ** i), unit: labels[i] };
}
export function compactText(bits, binary = false) { const c = compact(bits, binary); return `${c.value} ${c.unit}`; }
export function byteText(bits) { const bytes = ceil(BigInt(bits), 8n); return `${integer(bytes)} B · ${nf.format(Number(bytes) / 1024)} KiB`; }
