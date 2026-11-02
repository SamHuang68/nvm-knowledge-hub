// 圖解與模擬器共用色表。規則 0003：材料與底色用淡色，深色只用於線條與文字。
// atlas 產生器（Node）與模擬器（瀏覽器）都從這裡取色，不再各自寫死而漂移。
// 材料色與深色文字（NEUTRAL.ink）的對比都至少 4.5:1，標籤可以直接壓在材料上。

export const NEUTRAL = Object.freeze({
  ink: '#16334c',
  muted: '#5b6f82',
  line: '#6b8492',
  panel: '#f7f9fc',
  white: '#ffffff'
});

// 電荷型元件（浮閘、電荷捕捉、反熔絲）的剖面材料。
export const MATERIAL = Object.freeze({
  silicon: '#bed1e2',
  doped: '#7d9fbb',
  oxide: '#f3e2af',
  trap: '#d98762',
  floatingGate: '#c2a269',
  metal: '#899ba9',
  breakdown: '#f3bf7d'
});

// 載子與狀態：同一種載子在所有圖面用同一個顏色。
export const CARRIER = Object.freeze({
  electron: '#075f9d',
  hole: '#b52f43',
  field: '#a34b10',
  current: '#087766'
});

// 新興記憶體（MTJ、細絲、鐵電）的材料與狀態。
// writeCurrent 與 CARRIER.current 是不同色相，沿用既有圖例，不在本次改語意。
export const EMERGING = Object.freeze({
  electrode: '#829dad',
  electrodeLight: '#bdd0dc',
  switchingOxide: '#e7eff4',
  freeLayer: '#147e82',
  referenceLayer: '#435b89',
  spin: '#7f5899',
  writeCurrent: '#b96521',
  read: '#196daf',
  oxygen: '#1b80a2',
  vacancy: '#aa5d1d',
  copper: '#b76730',
  silver: '#82639d',
  ferro: '#836197',
  hot: '#d55c25',
  cold: '#c6d8e2'
});

// 模擬器 canvas 的淡色主題。
export const CHART = Object.freeze({
  background: '#ffffff',
  panel: '#f8fafc',
  grid: 'rgba(15, 23, 42, 0.06)',
  frame: '#e2e8f0',
  axis: '#cbd5e1',
  text: '#0f172a',
  muted: '#475569',
  accent: '#0284c7',
  warning: '#d97706',
  danger: '#dc2626',
  ok: '#059669'
});

const SUPERSCRIPT = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

// 以 log10 值輸出兩位有效數字的科學記號，例如 1.763 → 5.8×10¹。
export function formatScientificFromLog(logValue) {
  if (!Number.isFinite(logValue)) return '—';
  let exponent = Math.floor(logValue);
  let mantissa = Number((10 ** (logValue - exponent)).toFixed(1));
  if (mantissa >= 10) {
    mantissa = 1;
    exponent += 1;
  }
  const power = String(exponent).replace(/[-0-9]/g, digit => SUPERSCRIPT[digit]);
  return `${mantissa.toFixed(1)}×10${power}`;
}
