/**
 * demura-lut-calculator.js — AMOLED & MicroLED De-Mura Look-Up Table (LUT) Storage & DMA Architecture Calculator
 *
 * First-principles mathematical modeling of subpixel optical compensation, multi-grayscale interpolation,
 * 2D spatial compression, Flash memory capacity sizing, and Octal SPI boot DMA latency in High-Voltage DDICs.
 *
 * Mathematical Foundations:
 * 1. Pixel Count: N_pixels = Width * Height
 * 2. Spatial Binning Blocks: N_blocks = N_pixels / (Bin_Size^2)
 * 3. Compressed De-Mura LUT Size: Data_comp = N_blocks * Planes * 3_RGB * Bits_Channel
 * 4. Storage Sizing: Size_Mb = Data_comp / 1e6; Size_MB = Data_comp / (8 * 1e6)
 * 5. DMA Load Latency: t_DMA (ms) = Size_MB / Bandwidth_MBps * 1000
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: MIPI DSI-2, High-Voltage Display Driver IC (HV DDIC) De-Mura Standards
 */

'use strict';

export const DEMURA_PRESETS = Object.freeze({
  smartphone_wqhd: {
    id: 'smartphone_wqhd',
    nameEn: 'Flagship Smartphone AMOLED (WQHD+ 3200 × 1440)',
    nameZh: '旗艦智慧型手機 AMOLED (WQHD+ 3200 × 1440)',
    width: 3200,
    height: 1440,
    planes: 4, // 4 grayscale interpolation planes (e.g. 16, 64, 128, 255)
    binSize: 2, // 2x2 spatial subpixel block
    bitsPerChannel: 10, // 10-bit optical correction DAC
    dmaInterface: 'octal_133', // Octal SPI @ 133 MHz
    descriptionEn: 'High-density smartphone AMOLED requiring 4-plane compensation to eliminate subpixel mura.',
    descriptionZh: '高解析度手機 AMOLED，需 4 灰階補償平面以徹底消除子像素亮度與色彩斑塊。',
  },
  smartphone_fhd: {
    id: 'smartphone_fhd',
    nameEn: 'Mainstream Smartphone AMOLED (FHD+ 2400 × 1080)',
    nameZh: '主流智慧型手機 AMOLED (FHD+ 2400 × 1080)',
    width: 2400,
    height: 1080,
    planes: 3,
    binSize: 2,
    bitsPerChannel: 8,
    dmaInterface: 'octal_133',
    descriptionEn: 'Cost-sensitive FHD+ panel balancing compression ratio and optical uniformity.',
    descriptionZh: '主流 FHD+ 面板，在壓縮倍率、儲存成本與光學均勻性間取得最佳平衡。',
  },
  wearable_microled: {
    id: 'wearable_microled',
    nameEn: 'Smartwatch Ultra-Bright MicroLED (480 × 480)',
    nameZh: '智慧手錶超高亮度 MicroLED (480 × 480)',
    width: 480,
    height: 480,
    planes: 4,
    binSize: 1, // 1x1 full pixel-level correction (no spatial binning)
    bitsPerChannel: 10,
    dmaInterface: 'quad_80', // Quad SPI @ 80 MHz
    descriptionEn: 'MicroLED demanding individual pixel-level correction to correct pick-and-place luminance disparity.',
    descriptionZh: 'MicroLED 要求逐點 (1×1) 精確校準，消除巨量轉移後之發光強度離散度。',
  },
  automotive_curved: {
    id: 'automotive_curved',
    nameEn: 'Automotive Curved Cockpit Display (3840 × 1080)',
    nameZh: '車載曲面多屏一體化駕駛艙顯示器 (3840 × 1080)',
    width: 3840,
    height: 1080,
    planes: 4,
    binSize: 4, // 4x4 spatial block for wide displays
    bitsPerChannel: 8,
    dmaInterface: 'octal_dtr_200', // Octal DTR SPI @ 200 MHz
    descriptionEn: 'Automotive panoramic cluster requiring ultra-fast boot DMA (<50 ms) to meet ISO safety timers.',
    descriptionZh: '車載全景曲面儀表，要求 <50 ms 極速開機 DMA 載入以符合車規儀表開機時序標準。',
  },
});

export const DMA_INTERFACES = Object.freeze({
  quad_80: { id: 'quad_80', name: 'Quad SPI @ 80 MHz', clockMHz: 80, lines: 4, dtr: false, bandwidthMBps: 40 },
  octal_133: { id: 'octal_133', name: 'Octal SPI @ 133 MHz', clockMHz: 133, lines: 8, dtr: false, bandwidthMBps: 133 },
  octal_dtr_200: { id: 'octal_dtr_200', name: 'Octal DTR SPI @ 200 MHz', clockMHz: 200, lines: 8, dtr: true, bandwidthMBps: 400 },
});

/**
 * Calculates De-Mura Look-Up Table capacity and DMA load time.
 * @param {Object} inputs Parameters.
 * @return {Object} Computed storage metrics and architectural comparison.
 */
export function calculateDemuraLutStorage(inputs = {}) {
  const preset = DEMURA_PRESETS[inputs.presetId] || DEMURA_PRESETS.smartphone_wqhd;
  const width = Math.max(100, parseInt(inputs.width, 10) || preset.width);
  const height = Math.max(100, parseInt(inputs.height, 10) || preset.height);
  const planes = Math.max(1, parseInt(inputs.planes, 10) || preset.planes);
  const binSize = Math.max(1, parseInt(inputs.binSize, 10) || preset.binSize);
  const bitsPerChannel = Math.max(6, parseInt(inputs.bitsPerChannel, 10) || preset.bitsPerChannel);
  const iface = DMA_INTERFACES[inputs.dmaInterface] || DMA_INTERFACES[preset.dmaInterface] || DMA_INTERFACES.octal_133;

  const totalPixels = width * height;
  const blockFactor = binSize * binSize;
  const totalBlocks = Math.ceil(totalPixels / blockFactor);

  // Raw uncompressed data (1x1, no binning):
  const rawBits = totalPixels * planes * 3 * bitsPerChannel;
  const rawMB = rawBits / (8 * 1e6);

  // Compressed De-Mura LUT bits:
  const compBits = totalBlocks * planes * 3 * bitsPerChannel;
  const compMb = compBits / 1e6;
  const compMB = compBits / (8 * 1e6);

  const compressionRatio = rawBits / compBits;

  // Flash package recommendation:
  let recommendedFlashSizeMB = 4;
  if (compMB > 16) recommendedFlashSizeMB = 32;
  else if (compMB > 8) recommendedFlashSizeMB = 16;
  else if (compMB > 4) recommendedFlashSizeMB = 8;

  // DMA boot load latency (ms):
  const dmaTimeMs = (compMB / iface.bandwidthMBps) * 1000;

  // Silicon footprint if embedded monolithically onto HV DDIC (assume 28nm HV eFlash cell + periphery = ~0.08 mm²/Mb):
  const embeddedDieAreaMm2 = compMb * 0.08;

  return {
    width,
    height,
    totalPixels,
    planes,
    binSize,
    bitsPerChannel,
    totalBlocks,
    rawMB: parseFloat(rawMB.toFixed(2)),
    compMb: parseFloat(compMb.toFixed(2)),
    compMB: parseFloat(compMB.toFixed(2)),
    compressionRatio: parseFloat(compressionRatio.toFixed(1)),
    recommendedFlashSizeMB,
    dmaInterface: iface,
    dmaTimeMs: parseFloat(dmaTimeMs.toFixed(1)),
    embeddedDieAreaMm2: parseFloat(embeddedDieAreaMm2.toFixed(2)),
    preset,
  };
}

/**
 * Initializes the De-Mura LUT Calculator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initDemuraLutCalculator(rootSelector = '#demura-lut-calculator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const presetSelect = root.querySelector('#demura-preset-select');
  const binSelect = root.querySelector('#demura-bin-select');
  const planesSelect = root.querySelector('#demura-planes-select');
  const bitsSelect = root.querySelector('#demura-bits-select');
  const dmaSelect = root.querySelector('#demura-dma-select');

  const sizeMbEl = root.querySelector('#demura-size-mb');
  const sizeMBEl = root.querySelector('#demura-size-mbyte');
  const ratioBadge = root.querySelector('#demura-ratio-badge');
  const dmaTimeEl = root.querySelector('#demura-dma-time');
  const flashSizeEl = root.querySelector('#demura-flash-pkg');
  const dieAreaEl = root.querySelector('#demura-embedded-area');

  const barComp = root.querySelector('#demura-bar-comp');
  const verdictEl = root.querySelector('#demura-verdict');

  function loadPreset(key) {
    const p = DEMURA_PRESETS[key] || DEMURA_PRESETS.smartphone_wqhd;
    if (binSelect) binSelect.value = String(p.binSize);
    if (planesSelect) planesSelect.value = String(p.planes);
    if (bitsSelect) bitsSelect.value = String(p.bitsPerChannel);
    if (dmaSelect) dmaSelect.value = p.dmaInterface;
    update();
  }

  function update() {
    const p = DEMURA_PRESETS[presetSelect?.value || 'smartphone_wqhd'];
    const res = calculateDemuraLutStorage({
      presetId: presetSelect?.value || 'smartphone_wqhd',
      width: p.width,
      height: p.height,
      binSize: parseInt(binSelect?.value || '2', 10),
      planes: parseInt(planesSelect?.value || '4', 10),
      bitsPerChannel: parseInt(bitsSelect?.value || '10', 10),
      dmaInterface: dmaSelect?.value || 'octal_133',
    });

    if (sizeMbEl) sizeMbEl.textContent = `${res.compMb} Mb`;
    if (sizeMBEl) sizeMBEl.textContent = `${res.compMB} MB`;
    if (ratioBadge) ratioBadge.textContent = T(`${res.compressionRatio}× Spatial Compression`, `${res.compressionRatio}× 空間壓縮`);
    if (dmaTimeEl) {
      dmaTimeEl.textContent = `${res.dmaTimeMs} ms`;
      dmaTimeEl.style.color = res.dmaTimeMs <= 50 ? '#059669' : res.dmaTimeMs <= 100 ? '#0284c7' : '#d97706';
    }
    if (flashSizeEl) flashSizeEl.textContent = `${res.recommendedFlashSizeMB} MB Serial NOR`;
    if (dieAreaEl) dieAreaEl.textContent = T(`+${res.embeddedDieAreaMm2} mm² (Die Area Surge)`, `+${res.embeddedDieAreaMm2} mm² (晶圓面積暴增)`);

    // Visual comparison bar
    if (barComp) {
      const pct = Math.min(100, Math.max(5, (res.compMB / 16) * 100));
      barComp.style.width = `${pct}%`;
      barComp.title = `${res.compMB} MB / 16 MB capacity scale`;
    }

    // Architect Verdict
    if (verdictEl) {
      verdictEl.innerHTML = T(
        `<strong>HV DDIC Memory Hierarchy Verdict:</strong> At ${res.width}×${res.height} resolution, the 2D De-Mura optical table requires <strong>${res.compMB} MB (${res.compMb} Mb)</strong> of non-volatile storage. Monolithically embedding this into the 28nm/40nm HV DDIC die would consume <strong>+${res.embeddedDieAreaMm2} mm²</strong>, devastating die yields for ultra-narrow aspect ratio (&gt;20:1) chips. The optimal industrial architecture is <strong>Hybrid Partitioning</strong>: Core electrical calibration (Vcom anti-flicker DAC, Gamma curve) is permanently locked on-chip via <em>0-mask Logic AntiFuse OTP</em> (immune to 35Vp-p Gate switching EMI), while the massive ${res.compMB} MB optical matrix streams from an external/co-packaged <em>Octal SPI Serial NOR Flash</em> in just <strong>${res.dmaTimeMs} ms</strong> at panel boot.`,
        `<strong>高壓顯示驅動階層式記憶體架構結論：</strong> 在 ${res.width}×${res.height} 解析度下，2D De-Mura 光學補償矩陣需 <strong>${res.compMB} MB (${res.compMb} Mb)</strong> 非揮發儲存空間。若強行單晶片內嵌於 28nm/40nm HV DDIC 中，將吞噬高達 <strong>+${res.embeddedDieAreaMm2} mm²</strong> 的高壓矽面積，徹底摧毀長寬比超過 20:1 極細長晶片的封裝與測試良率。業界最佳架構為 <strong>「內嵌 0 光罩 OTP + 合封/外掛 Octal NOR」之雙軌混合架構</strong>：核心電氣參數（Vcom 防閃爍、Gamma 曲線暫存器）透過 <em>0 光罩 Logic AntiFuse OTP</em> 永久硬鎖於晶片內（天然免疫 35Vp-p 閘極擺幅雜訊干擾）；龐大的 ${res.compMB} MB 光學點陣則由高速 <em>Octal SPI Serial NOR Flash</em> 於開機僅 <strong>${res.dmaTimeMs} ms</strong> 極速 DMA 載入內部 SRAM，兼顧極窄邊框與最低 BOM 成本。`
      );
    }
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  [binSelect, planesSelect, bitsSelect, dmaSelect].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDemuraLutCalculator());
  } else {
    initDemuraLutCalculator();
  }
}
