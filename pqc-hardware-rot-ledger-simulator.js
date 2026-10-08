/**
 * @file pqc-hardware-rot-ledger-simulator.js
 * @description Architectural Evaluation & Microarchitectural Simulator for Post-Quantum Cryptography (PQC)
 *              Hardware Root-of-Trust (NIST FIPS 203 ML-KEM & FIPS 204 ML-DSA), Non-Volatile Storage Budgets,
 *              Hardware Seed Expansion, and Higher-Order Side-Channel Defense.
 *
 * @version 1.0.0 (2026-10-06)
 * @author High-Assurance Post-Quantum Hardware Security Architecture Team
 * @license Grounded in NIST FIPS 203/204 specifications & ISO/IEC 17825 side-channel evaluation criteria.
 */

/**
 * @typedef {Object} PqcAlgorithmSpec
 * @property {string} id - Algorithm identifier
 * @property {string} nameZh - Traditional Chinese name
 * @property {string} nameEn - English name
 * @property {string} standard - NIST standard (FIPS 203 / 204)
 * @property {number} securityCategory - NIST Security Category (1, 3, or 5)
 * @property {number} rawPrivateKeyBytes - Raw unpacked private key size in Bytes
 * @property {number} rawPublicKeyBytes - Public key size in Bytes
 * @property {number} seedBytes - Master hardware seed storage budget in Bytes
 * @property {number} polyDimensionK - Lattice polynomial vector dimension k
 * @property {number} polyDegreeN - Polynomial degree n (typically 256)
 * @property {string} descriptionZh - Description in Traditional Chinese
 * @property {string} descriptionEn - Description in English
 */

/**
 * Standardized PQC Algorithms (NIST FIPS 203 / 204)
 * @type {Record<string, PqcAlgorithmSpec>}
 */
export const PQC_ALGORITHMS = {
  ml_kem_512: {
    id: 'ml_kem_512',
    nameZh: 'ML-KEM-512 (原 Crystals-Kyber-512)',
    nameEn: 'ML-KEM-512 (FIPS 203 Category 1)',
    standard: 'FIPS 203',
    securityCategory: 1,
    rawPrivateKeyBytes: 1632,
    rawPublicKeyBytes: 800,
    seedBytes: 32, // 256-bit seed (d, z)
    polyDimensionK: 2,
    polyDegreeN: 256,
    descriptionZh: 'NIST 第 1 安全等級（等同 AES-128）。原生私鑰 1,632 Bytes，透過種子衍生僅需 32 Bytes OTP。',
    descriptionEn: 'NIST Category 1 (AES-128 equiv). Raw private key: 1,632 Bytes; seed derivation requires only 32 Bytes OTP.'
  },
  ml_kem_768: {
    id: 'ml_kem_768',
    nameZh: 'ML-KEM-768 (原 Crystals-Kyber-768, 業界主流)',
    nameEn: 'ML-KEM-768 (FIPS 203 Category 3, Mainstream)',
    standard: 'FIPS 203',
    securityCategory: 3,
    rawPrivateKeyBytes: 2400,
    rawPublicKeyBytes: 1184,
    seedBytes: 32,
    polyDimensionK: 3,
    polyDegreeN: 256,
    descriptionZh: 'NIST 第 3 安全等級（商用首選基準）。原生私鑰 2,400 Bytes，種子衍生節省 98.7% 儲存空間。',
    descriptionEn: 'NIST Category 3 (Commercial benchmark). Raw private key: 2,400 Bytes; seed derivation achieves 98.7% area reduction.'
  },
  ml_kem_1024: {
    id: 'ml_kem_1024',
    nameZh: 'ML-KEM-1024 (原 Crystals-Kyber-1024, 極限國防)',
    nameEn: 'ML-KEM-1024 (FIPS 203 Category 5, Military)',
    standard: 'FIPS 203',
    securityCategory: 5,
    rawPrivateKeyBytes: 3168,
    rawPublicKeyBytes: 1568,
    seedBytes: 64, // 512-bit seed
    polyDimensionK: 4,
    polyDegreeN: 256,
    descriptionZh: 'NIST 第 5 安全等級（等同 AES-256 極限防務）。原生私鑰 3,168 Bytes，僅需 64 Bytes 抗量子根種子。',
    descriptionEn: 'NIST Category 5 (AES-256 military equiv). Raw private key: 3,168 Bytes; requires only 64 Bytes quantum-safe root seed.'
  },
  ml_dsa_65: {
    id: 'ml_dsa_65',
    nameZh: 'ML-DSA-65 (原 Crystals-Dilithium-3 數位簽章)',
    nameEn: 'ML-DSA-65 (FIPS 204 Category 3 Signature)',
    standard: 'FIPS 204',
    securityCategory: 3,
    rawPrivateKeyBytes: 4032,
    rawPublicKeyBytes: 1952,
    seedBytes: 32, // 256-bit seed xi
    polyDimensionK: 6,
    polyDegreeN: 256,
    descriptionZh: 'NIST 數位簽章標準第 3 等級。原生私鑰高達 4,032 Bytes，種子架構實現 126 倍面積壓縮。',
    descriptionEn: 'NIST Digital Signature Category 3. Raw private key: 4,032 Bytes; seed architecture delivers 126x area compression.'
  },
  ml_dsa_87: {
    id: 'ml_dsa_87',
    nameZh: 'ML-DSA-87 (原 Crystals-Dilithium-5 最高安全簽章)',
    nameEn: 'ML-DSA-87 (FIPS 204 Category 5 Max Signature)',
    standard: 'FIPS 204',
    securityCategory: 5,
    rawPrivateKeyBytes: 4896,
    rawPublicKeyBytes: 2592,
    seedBytes: 64,
    polyDimensionK: 8,
    polyDegreeN: 256,
    descriptionZh: 'NIST 最高等級後量子簽章。原生私鑰接近 5KB (4,896 Bytes)，若無種子展開將難以整合於邊緣晶片。',
    descriptionEn: 'NIST Highest Assurance Signature. Raw key approaches 5KB (4,896 Bytes); seed expansion is vital for edge silicon.'
  }
};

/**
 * Calculates PQC storage footprint, silicon area reduction, and DPA MTD security metrics.
 *
 * @param {Object} params
 * @param {string} params.algoKey
 * @param {string} params.storageArch - 'pure_raw_storage' | 'antifuse_seed_expansion'
 * @param {number} params.maskingOrder - Masking order (0: unmasked, 1: first-order, 2: second-order)
 * @param {number} params.processNodeNm - Process technology node in nm (e.g. 5, 12, 28)
 * @returns {Object} Calculated metrics
 */
export function calculatePqcStorageMetrics(params) {
  const algo = PQC_ALGORITHMS[params.algoKey] || PQC_ALGORITHMS.ml_kem_768;
  const isSeedExpansion = params.storageArch !== 'pure_raw_storage';
  const maskingOrder = Math.max(0, Math.min(2, params.maskingOrder || 1));
  const node = Math.max(3, params.processNodeNm || 12);

  // 1. Storage Capacity Requirements (Bytes)
  const actualStorageBytes = isSeedExpansion ? algo.seedBytes : algo.rawPrivateKeyBytes;
  const areaReductionRatio = algo.rawPrivateKeyBytes / algo.seedBytes;
  const storageSavedPct = ((algo.rawPrivateKeyBytes - algo.seedBytes) / algo.rawPrivateKeyBytes) * 100;

  // 2. Silicon Bitcell Area Estimation
  // AntiFuse bitcell area estimation: ~25 F^2 with peripheral circuitry overhead (factor 2.8).
  // Note: In advanced sub-7nm FinFET/GAA nodes, actual cell area is dictated by CPP x MMP design rules;
  // this formula provides a normalized scaling trend for comparative architecture sizing.
  const fSquareUm2 = Math.pow(node * 1e-3, 2); // F^2 in um^2 (nominal scaling indicator)
  const bitcellAreaUm2 = 25 * fSquareUm2;
  const rawSiliconAreaUm2 = (algo.rawPrivateKeyBytes * 8) * bitcellAreaUm2 * 2.8;
  const seedSiliconAreaUm2 = (algo.seedBytes * 8) * bitcellAreaUm2 * 2.8;
  const siliconAreaSavedUm2 = rawSiliconAreaUm2 - seedSiliconAreaUm2;

  // 3. Side-Channel DPA Minimum Traces to Disclose (MTD) Model
  // Base MTD for unmasked single-ended read: ~2,500 traces (nominal test assumption)
  // Twin-Cell differential sensing adds current symmetry (multiplying base traces by ~35x in balanced layout evaluations)
  // Higher-order masking multiplies traces exponentially by 10^(1.8 * order)
  const baseMtd = 2500;
  const twinCellFactor = 35; // Differential sensing current symmetry factor
  let mtdTraces = baseMtd * Math.pow(10, 1.8 * maskingOrder);

  if (isSeedExpansion) {
    // Reading 32B seed with twin-cell balanced differential macro
    mtdTraces *= twinCellFactor;
  } else {
    // Reading 2KB~4KB raw key creates huge power traces and wide exposure surface
    mtdTraces *= 0.25;
  }

  // 4. Rating & Architectural Verdict
  let securityRating = 'FIPS_203_COMPLIANT_EXCELLENT';
  let verdictZh = '';
  let verdictEn = '';

  if (isSeedExpansion) {
    securityRating = maskingOrder >= 1 ? 'TOP_TIER_PQC_SECURITY' : 'STANDARD_SEED_EXPANSION';
    verdictZh = `【混合分層種子架構優化】${algo.nameZh} 採用 0-Mask AntiFuse 存儲 ${algo.seedBytes} Bytes 根種子，相較於直接存放 ${algo.rawPrivateKeyBytes.toLocaleString()} Bytes 原生私鑰，非揮發性記憶體面積縮減 ${areaReductionRatio.toFixed(1)} 倍（節省 ${storageSavedPct.toFixed(1)}% 儲存空間）。結合 ${maskingOrder} 階遮罩與差動讀取，DPA 破解採樣門檻預估達 ${mtdTraces.toExponential(2)} 次（模型估算值），符合 FIPS 203/204 演算法種子規格，並為 FIPS 140-3 密碼模組實體安全評估提供硬體基礎。`;
    verdictEn = `[Tiered Hybrid Seed Architecture] ${algo.nameEn} secures a ${algo.seedBytes}-byte root seed via 0-Mask AntiFuse, shrinking non-volatile memory footprint by ${areaReductionRatio.toFixed(1)}x (${storageSavedPct.toFixed(1)}% savings) vs ${algo.rawPrivateKeyBytes.toLocaleString()} bytes raw storage. Combined with order-${maskingOrder} masking and differential sensing, modeled DPA MTD reaches ${mtdTraces.toExponential(2)} traces (modeled estimate), satisfying FIPS 203/204 seed specifications and providing a hardware foundation for FIPS 140-3 module physical security evaluation.`;
  } else {
    securityRating = 'CRITICAL_AREA_PENALTY';
    verdictZh = `【原生私鑰全儲存瓶頸】${algo.nameZh} 採用全容量 eNVM 存儲 ${algo.rawPrivateKeyBytes.toLocaleString()} Bytes 多項式密鑰，矽面積開銷高達 ${rawSiliconAreaUm2.toFixed(1)} μm²。大容量密鑰連續讀出使側信道功耗軌跡大幅暴露，DPA 洩漏採樣次數降至 ${mtdTraces.toExponential(2)} 次，強烈建議改採 256-bit 主種子衍生架構。`;
    verdictEn = `[Raw Key Storage Penalty] ${algo.nameEn} directly stores ${algo.rawPrivateKeyBytes.toLocaleString()} bytes in on-chip eNVM, incurring massive ${rawSiliconAreaUm2.toFixed(1)} μm² silicon overhead. Prolonged multi-kilobyte readout exposes wide side-channel signatures, dropping DPA MTD to ${mtdTraces.toExponential(2)} traces; tiered seed expansion is strongly recommended.`;
  }

  return {
    algo,
    storageArch: params.storageArch,
    actualStorageBytes,
    areaReductionRatio,
    storageSavedPct,
    rawSiliconAreaUm2,
    seedSiliconAreaUm2,
    siliconAreaSavedUm2,
    maskingOrder,
    mtdTraces,
    securityRating,
    verdictZh,
    verdictEn
  };
}

/**
 * Draws high-precision PQC memory comparison and DPA MTD curves.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {string} mode - 'storage_footprint' | 'dpa_mtd_curve'
 */
export function drawPqcCanvas(canvas, metrics, mode = 'storage_footprint') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : canvas.width;
  const height = rect.height > 0 ? rect.height : canvas.height;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#08131e';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    ctx.restore();
    return;
  }

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const numXGrids = 5;
  const numYGrids = 4;
  for (let i = 0; i <= numXGrids; i++) {
    const gx = padLeft + (i / numXGrids) * plotWidth;
    ctx.beginPath();
    ctx.moveTo(gx, padTop);
    ctx.lineTo(gx, padTop + plotHeight);
    ctx.stroke();
  }
  for (let j = 0; j <= numYGrids; j++) {
    const gy = padTop + (j / numYGrids) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(padLeft, gy);
    ctx.lineTo(padLeft + plotWidth, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';

  if (mode === 'storage_footprint') {
    // Mode 1: Bar Chart of Raw Key vs Seed Size for 5 PQC algorithms
    const algos = Object.values(PQC_ALGORITHMS);
    const maxBytes = 5000;

    for (let j = 0; j <= numYGrids; j++) {
      const bVal = maxBytes * (1 - j / numYGrids);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText(bVal.toFixed(0) + ' B', 12, gy + 3);
    }

    const barGroupWidth = plotWidth / algos.length;
    const barWidth = barGroupWidth * 0.35;

    algos.forEach((a, idx) => {
      const groupX = padLeft + idx * barGroupWidth;
      const xCenter = groupX + barGroupWidth / 2;

      // Raw Key Bar (Red/Amber)
      const hRaw = (a.rawPrivateKeyBytes / maxBytes) * plotHeight;
      const yRaw = padTop + plotHeight - hRaw;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(xCenter - barWidth - 2, yRaw, barWidth, hRaw);

      // Seed Bar (Emerald/Cyan)
      const hSeed = (a.seedBytes / maxBytes) * plotHeight;
      const ySeed = padTop + plotHeight - Math.max(2, hSeed);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(xCenter + 2, ySeed, barWidth, Math.max(2, hSeed));

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(a.id.replace('_', '-').toUpperCase(), groupX + 6, padTop + plotHeight + 16);
    });

    // Legend
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 10, 10, 4);
    ctx.fillText('Raw Key Size (1,632-4,896 B)', padLeft + plotWidth - 205, padTop + 14);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 24, 10, 4);
    ctx.fillText('AntiFuse Seed (32-64 B)', padLeft + plotWidth - 205, padTop + 28);

  } else {
    // Mode 2: DPA MTD curves vs Masking Order (Order 0, 1, 2)
    const orders = [0, 1, 2];
    const logMtdMax = 9.0; // 10^9 traces
    const logMtdMin = 3.0; // 10^3 traces

    for (let j = 0; j <= numYGrids; j++) {
      const pVal = logMtdMax - (j / numYGrids) * (logMtdMax - logMtdMin);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText('10^' + pVal.toFixed(0), 16, gy + 3);
    }

    orders.forEach((ord, idx) => {
      const gx = padLeft + (idx / 2) * plotWidth;
      ctx.fillText('Order ' + ord + ' Mask', gx - 20, padTop + plotHeight + 18);
    });

    // Plot Curves for Seed vs Raw Storage
    const ptsSeed = [];
    const ptsRaw = [];
    orders.forEach((ord, idx) => {
      const resSeed = calculatePqcStorageMetrics({
        algoKey: metrics.algo.id,
        storageArch: 'antifuse_seed_expansion',
        maskingOrder: ord,
        processNodeNm: 12
      });
      const resRaw = calculatePqcStorageMetrics({
        algoKey: metrics.algo.id,
        storageArch: 'pure_raw_storage',
        maskingOrder: ord,
        processNodeNm: 12
      });

      const gx = padLeft + (idx / 2) * plotWidth;
      const logValSeed = Math.log10(resSeed.mtdTraces);
      const logValRaw = Math.log10(resRaw.mtdTraces);

      const gySeed = padTop + ((logMtdMax - logValSeed) / (logMtdMax - logMtdMin)) * plotHeight;
      const gyRaw = padTop + ((logMtdMax - logValRaw) / (logMtdMax - logMtdMin)) * plotHeight;

      ptsSeed.push({ x: gx, y: gySeed });
      ptsRaw.push({ x: gx, y: gyRaw });
    });

    // Draw Raw Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ptsRaw.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // Draw Seed Line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ptsSeed.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 10, 10, 4);
    ctx.fillText('AntiFuse Seed + Twin-Cell', padLeft + plotWidth - 205, padTop + 14);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 24, 10, 4);
    ctx.fillText('Pure Raw Storage Read', padLeft + plotWidth - 205, padTop + 28);
  }

  ctx.restore();
}

/**
 * Initializes the PQC Storage Simulator UI in the DOM.
 */
export function initPqcStorageSimulator() {
  if (typeof document === 'undefined') return;

  const root = document.getElementById('pqc-key-storage-simulator-root');
  if (!root) return;

  const algoSelect = document.getElementById('pqc-algo-select');
  const archSelect = document.getElementById('pqc-arch-select');
  const maskSelect = document.getElementById('pqc-mask-select');

  // Outputs
  const outRawsize = document.getElementById('pqc-out-rawsize');
  const outSeedsize = document.getElementById('pqc-out-seedsize');
  const outSavings = document.getElementById('pqc-out-savings');
  const outMtd = document.getElementById('pqc-out-mtd');
  const outRating = document.getElementById('pqc-out-rating');
  const outVerdict = document.getElementById('pqc-out-verdict');

  // Canvas & Buttons
  const canvas = document.getElementById('pqc-storage-canvas');
  const btnModeFootprint = document.getElementById('pqc-mode-footprint');
  const btnModeMtd = document.getElementById('pqc-mode-mtd');

  let activeMode = 'storage_footprint';

  function update() {
    const config = {
      algoKey: algoSelect ? algoSelect.value : 'ml_kem_768',
      storageArch: archSelect ? archSelect.value : 'antifuse_seed_expansion',
      maskingOrder: maskSelect ? parseInt(maskSelect.value, 10) : 1,
      processNodeNm: 12
    };

    const metrics = calculatePqcStorageMetrics(config);

    if (outRawsize) outRawsize.textContent = metrics.algo.rawPrivateKeyBytes.toLocaleString() + ' Bytes';
    if (outSeedsize) outSeedsize.textContent = metrics.algo.seedBytes + ' Bytes';
    if (outSavings) outSavings.textContent = metrics.areaReductionRatio.toFixed(1) + 'x (' + metrics.storageSavedPct.toFixed(1) + '%)';
    if (outMtd) outMtd.textContent = metrics.mtdTraces.toExponential(2);
    if (outRating) {
      outRating.textContent = metrics.securityRating;
      outRating.style.color = metrics.securityRating.includes('TOP') || metrics.securityRating.includes('COMPLIANT') ? '#059669' : '#dc2626';
    }

    if (outVerdict) {
      outVerdict.innerHTML = `
        <span data-lang="zh">${metrics.verdictZh}</span>
        <span data-lang="en">${metrics.verdictEn}</span>
      `;
    }

    if (canvas) {
      drawPqcCanvas(canvas, metrics, activeMode);
    }
  }

  if (algoSelect) algoSelect.addEventListener('change', update);
  if (archSelect) archSelect.addEventListener('change', update);
  if (maskSelect) maskSelect.addEventListener('change', update);

  if (btnModeFootprint) {
    btnModeFootprint.addEventListener('click', () => {
      activeMode = 'storage_footprint';
      btnModeFootprint.classList.add('active');
      btnModeFootprint.setAttribute('aria-pressed', 'true');
      btnModeFootprint.style.background = '#0284c7';
      btnModeFootprint.style.color = '#ffffff';

      if (btnModeMtd) {
        btnModeMtd.classList.remove('active');
        btnModeMtd.setAttribute('aria-pressed', 'false');
        btnModeMtd.style.background = '#1e293b';
        btnModeMtd.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (btnModeMtd) {
    btnModeMtd.addEventListener('click', () => {
      activeMode = 'dpa_mtd_curve';
      btnModeMtd.classList.add('active');
      btnModeMtd.setAttribute('aria-pressed', 'true');
      btnModeMtd.style.background = '#0284c7';
      btnModeMtd.style.color = '#ffffff';

      if (btnModeFootprint) {
        btnModeFootprint.classList.remove('active');
        btnModeFootprint.setAttribute('aria-pressed', 'false');
        btnModeFootprint.style.background = '#1e293b';
        btnModeFootprint.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      if (canvas) update();
    });
    window.addEventListener('hub:language-change', () => {
      if (canvas) update();
    });
  }

  update();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPqcStorageSimulator);
  } else {
    initPqcStorageSimulator();
  }
}
