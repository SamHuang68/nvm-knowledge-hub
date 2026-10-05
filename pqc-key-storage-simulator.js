/**
 * pqc-key-storage-simulator.js — Post-Quantum Cryptography (PQC) Large Key Storage, Wearout & Zeroization Simulator
 *
 * First-Principles Security & Reliability Physics:
 * 1. PQC Key Dimension Expansion & Array Footprint (NIST FIPS 203 / 204):
 *    Classical ECC-256 (32B) vs Lattice-Based ML-KEM / ML-DSA (800B ~ 4KB).
 * 2. eNVM Endurance Wearout & Sector Exhaustion:
 *    D_{wear}(N_{up}) = \frac{N_{up} \cdot \text{KeySize}}{\text{Capacity}_{\text{sector}} \cdot \text{Endurance}_{\text{cycle}}}
 *    For Append-Only AntiFuse Log: Virtual patching / monotonic index without erase cycles.
 * 3. Active Tamper Emergency Zeroization Latency (FIPS 140-3 Physical Security):
 *    t_{zeroize} = N_{blocks} \cdot t_{erase\_cycle} + t_{discharge\_pump}
 *    Charge-based Flash: 2ms - 10ms (charge-pump discharge bottleneck, vulnerable to cryogenic freeze attacks).
 *    AntiFuse Logic Fuse: 12ns - 25ns (hardware blow-gate or logic-key overwrite, irreversible destruction).
 * 4. Static Standby Leakage & High-Temperature Data Retention:
 *    P_{leak} = I_{leak}(T) \cdot V_{DD}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 140-3 Level 3/4 Physical Security
 */

/**
 * PQC Algorithm Profiles and Key Footprints.
 */
export const PQC_ALGORITHM_PROFILES = Object.freeze({
  ml_kem_512: {
    id: "ml_kem_512",
    nameZh: "ML-KEM-512 (Kyber-512 / NIST Level 1 · 800B 公鑰 / 1.6KB 私鑰)",
    nameEn: "ML-KEM-512 (Kyber-512 / NIST Level 1 · 800B Pub / 1.6KB Priv)",
    algorithmStandard: "NIST FIPS 203",
    publicKeyBytes: 800,
    privateKeyBytes: 1632,
    cipherTextBytes: 768,
    totalStorageBytes: 3200,
    securityCategory: "NIST Security Category 1 (AES-128 Equivalent)",
  },
  ml_kem_768: {
    id: "ml_kem_768",
    nameZh: "ML-KEM-768 (Kyber-768 / NIST Level 3 · 1.18KB 公鑰 / 2.4KB 私鑰)",
    nameEn: "ML-KEM-768 (Kyber-768 / NIST Level 3 · 1.18KB Pub / 2.4KB Priv)",
    algorithmStandard: "NIST FIPS 203",
    publicKeyBytes: 1184,
    privateKeyBytes: 2400,
    cipherTextBytes: 1088,
    totalStorageBytes: 4672,
    securityCategory: "NIST Security Category 3 (AES-192 Equivalent)",
  },
  ml_kem_1024: {
    id: "ml_kem_1024",
    nameZh: "ML-KEM-1024 (Kyber-1024 / NIST Level 5 · 1.57KB 公鑰 / 3.17KB 私鑰)",
    nameEn: "ML-KEM-1024 (Kyber-1024 / NIST Level 5 · 1.57KB Pub / 3.17KB Priv)",
    algorithmStandard: "NIST FIPS 203",
    publicKeyBytes: 1568,
    privateKeyBytes: 3168,
    cipherTextBytes: 1568,
    totalStorageBytes: 6304,
    securityCategory: "NIST Security Category 5 (AES-256 Equivalent)",
  },
  ml_dsa_65: {
    id: "ml_dsa_65",
    nameZh: "ML-DSA-65 (Dilithium3 / NIST Level 3 數位簽章 · 1.95KB 公鑰 / 4KB 私鑰)",
    nameEn: "ML-DSA-65 (Dilithium3 / NIST Level 3 · 1.95KB Pub / 4KB Priv)",
    algorithmStandard: "NIST FIPS 204",
    publicKeyBytes: 1952,
    privateKeyBytes: 4032,
    cipherTextBytes: 3309,
    totalStorageBytes: 9293,
    securityCategory: "NIST Security Category 3 Digital Signature",
  },
});

/**
 * Secure Memory Media Profiles for PQC Key Storage.
 */
export const STORAGE_MEDIA_PROFILES = Object.freeze({
  antifuse_append_log: {
    id: "antifuse_append_log",
    nameZh: "AntiFuse 虛擬增量日誌 (零抹除磨損 / 12ns 硬體熔斷零化 / 零漏電)",
    nameEn: "AntiFuse Virtual Append Log (Zero Erase / 12ns Zeroize / 0 Leakage)",
    storageType: "Append-Only Monotonic Log OTP",
    isRewritable: false,
    enduranceCycles: 1000000, // Virtual patching via pointers
    eraseTimeMs: 0.0,         // Erase-free
    zeroizationTimeNs: 12.0,  // Hardware blow-gate over-write
    standbyLeakageNa: 0.01,
    freezeAttackImmunity: true,
    securityRating: "FIPS 140-3 Level 4 (Sub-50ns Hardware Zeroization)",
  },
  embedded_flash_sector: {
    id: "embedded_flash_sector",
    nameZh: "傳統 eFlash 密鑰扇區 (需區塊抹除 / 8.5ms 零化延遲 / 易受凍結攻擊)",
    nameEn: "Conventional eFlash Sector (Block Erase / 8.5ms Zeroize / RILC Risk)",
    storageType: "Floating-Gate / Charge-Trap Flash",
    isRewritable: true,
    enduranceCycles: 50000,
    eraseTimeMs: 4.5,
    zeroizationTimeNs: 8500000.0, // 8.5 ms discharge and erase sequence
    standbyLeakageNa: 15.0,
    freezeAttackImmunity: false,
    securityRating: "FIPS 140-3 Level 2 (Slow Zeroization, Vulnerable to Remanence)",
  },
  spintronic_mram: {
    id: "spintronic_mram",
    nameZh: "自旋 STT-MRAM 陣列 (10⁹ 高覆寫 / 350ns 全陣列覆寫 / 待機微安漏電)",
    nameEn: "Spintronic STT-MRAM Array (10⁹ Endurance / 350ns Zeroize / Standby Draw)",
    storageType: "Perpendicular MTJ Spintronic",
    isRewritable: true,
    enduranceCycles: 1e9,
    eraseTimeMs: 0.00035,
    zeroizationTimeNs: 350.0,
    standbyLeakageNa: 85.0,
    freezeAttackImmunity: true,
    securityRating: "FIPS 140-3 Level 3 (Fast Overwrite, Magnetic Shielding Needed)",
  },
  battery_backed_sram: {
    id: "battery_backed_sram",
    nameZh: "電池供電 BBRAM (揮發性 / 25ns 斷電零化 / 需外部鈕扣電池維持)",
    nameEn: "Battery-Backed BBRAM (Volatile / 25ns Zeroize / Requires External Cell)",
    storageType: "Volatile 6T SRAM + Coin Battery",
    isRewritable: true,
    enduranceCycles: 1e15,
    eraseTimeMs: 0.000025,
    zeroizationTimeNs: 25.0,
    standbyLeakageNa: 250.0,
    freezeAttackImmunity: false, // Cold boot memory remanence attack
    securityRating: "FIPS 140-3 Level 3 (Volatile, Battery Depletion Single Point of Failure)",
  },
});

/**
 * Calculates PQC key storage, wearout, and zeroization metrics.
 *
 * @param {Object} params
 * @param {string} params.algoKey
 * @param {string} params.mediaKey
 * @param {number} [params.customUpdateCycles]
 * @param {number} [params.customArrayCapacityKb]
 * @returns {Object} Calculated metrics
 */
export function calculatePqcKeyStorage({
  algoKey = "ml_kem_768",
  mediaKey = "antifuse_append_log",
  customUpdateCycles,
  customArrayCapacityKb,
}) {
  const algo = PQC_ALGORITHM_PROFILES[algoKey] || PQC_ALGORITHM_PROFILES.ml_kem_768;
  const media = STORAGE_MEDIA_PROFILES[mediaKey] || STORAGE_MEDIA_PROFILES.antifuse_append_log;

  const updateCycles = customUpdateCycles !== undefined ? customUpdateCycles : 1000;
  const capacityKb = customArrayCapacityKb !== undefined ? customArrayCapacityKb : 64.0; // 64 KB default
  const capacityBytes = capacityKb * 1024;

  const keySizeBytes = algo.totalStorageBytes;

  // 1. Array Allocation & Slots Capacity
  const totalSlots = Math.floor(capacityBytes / keySizeBytes);

  // 2. Wearout Calculation
  let wearoutPct = 0;
  let remainingLifetimeYears = 0;
  const updatesPerYear = 365.25 * 4; // 4 key rotations per day typical in high-security IoT

  if (media.id === "antifuse_append_log") {
    // Append-only monotonic log: each update consumes one slot of private key patch (e.g. 128B hash pointer)
    const patchBytesPerUpdate = 128;
    const totalPatchesPossible = Math.floor(capacityBytes / patchBytesPerUpdate);
    wearoutPct = (updateCycles / Math.max(totalPatchesPossible, 1)) * 100.0;
    const totalMaxUpdates = totalPatchesPossible;
    remainingLifetimeYears = Math.max(0, (totalMaxUpdates - updateCycles) / updatesPerYear);
  } else if (media.id === "embedded_flash_sector") {
    // eFlash: Each update requires erasing and rewriting the entire sector
    wearoutPct = (updateCycles / media.enduranceCycles) * 100.0;
    remainingLifetimeYears = Math.max(0, (media.enduranceCycles - updateCycles) / updatesPerYear);
  } else if (media.id === "spintronic_mram") {
    wearoutPct = (updateCycles / media.enduranceCycles) * 100.0;
    remainingLifetimeYears = Math.max(0, (media.enduranceCycles - updateCycles) / updatesPerYear);
  } else {
    // BBRAM
    wearoutPct = 0.0001;
    // Battery limited: 3V CR2032 with 220mAh @ 250nA leakage -> ~10 years
    const batteryHours = (220e-3 / (media.standbyLeakageNa * 1e-9));
    remainingLifetimeYears = Math.min(10.0, batteryHours / 8760);
  }

  wearoutPct = Math.min(100.0, Math.max(0.01, wearoutPct));

  // 3. Zeroization Latency & Security Level
  const zeroizeNs = media.zeroizationTimeNs;
  let isFipsLevel4Compliant = false;
  let complianceGradeZh = "";
  let complianceGradeEn = "";

  if (zeroizeNs <= 50.0 && media.freezeAttackImmunity) {
    isFipsLevel4Compliant = true;
    complianceGradeZh = "FIPS 140-3 Level 4 (極速 <50ns · 具抗低溫殘留防護)";
    complianceGradeEn = "FIPS 140-3 Level 4 (Ultra-Fast <50ns · Anti-Freeze Protected)";
  } else if (zeroizeNs <= 1000.0) {
    isFipsLevel4Compliant = false;
    complianceGradeZh = "FIPS 140-3 Level 3 (次微秒級 · 符合高安全晶片規範)";
    complianceGradeEn = "FIPS 140-3 Level 3 (Sub-Microsecond · High Security Compliant)";
  } else {
    isFipsLevel4Compliant = false;
    complianceGradeZh = "FIPS 140-3 Level 1/2 (毫秒級延遲 · 易受冷啟動提取威脅)";
    complianceGradeEn = "FIPS 140-3 Level 1/2 (Millisecond Latency · Cold-Boot Vulnerable)";
  }

  // Energy Per Key Rotation
  let energyPerRotationUj = 0;
  if (media.id === "antifuse_append_log") {
    energyPerRotationUj = (keySizeBytes * 8 * 0.0008); // ~0.8 nJ/bit
  } else if (media.id === "embedded_flash_sector") {
    energyPerRotationUj = (capacityKb * 1.5 * 10); // Flash sector erase takes ~15 uJ
  } else if (media.id === "spintronic_mram") {
    energyPerRotationUj = (keySizeBytes * 8 * 0.0035); // 3.5 pJ/bit
  } else {
    energyPerRotationUj = 0.05;
  }

  return {
    algoKey,
    mediaKey,
    updateCycles,
    capacityKb,
    keySizeBytes,
    totalSlots,
    wearoutPct: Number(wearoutPct.toFixed(2)),
    remainingLifetimeYears: Number(remainingLifetimeYears.toFixed(1)),
    zeroizeNs: zeroizeNs < 1000 ? `${zeroizeNs} ns` : `${(zeroizeNs / 1e6).toFixed(2)} ms`,
    zeroizeValueNs: zeroizeNs,
    standbyLeakageNa: media.standbyLeakageNa,
    energyPerRotationUj: Number(energyPerRotationUj.toFixed(2)),
    isFipsLevel4Compliant,
    complianceGradeZh,
    complianceGradeEn,
    algoNameZh: algo.nameZh,
    algoNameEn: algo.nameEn,
    mediaNameZh: media.nameZh,
    mediaNameEn: media.nameEn,
    securityCategory: algo.securityCategory,
  };
}

/**
 * Draws the PQC Key Storage and Zeroization Canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {"endurance_wearout"|"zeroization_timing"} mode
 */
export function drawPqcKeyStorageCanvas(canvas, metrics, mode = "endurance_wearout") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 320);
  const height = Math.max(rect.height, 180);

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;

  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
  ctx.lineWidth = 1;
  const gridX = 40;
  const gridY = 30;
  for (let x = gridX; x < w; x += gridX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridY; y < h; y += gridY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const plotX0 = 55;
  const plotX1 = w - 25;
  const plotY0 = 24;
  const plotY1 = h - 30;
  const plotW = plotX1 - plotX0;
  const plotH = plotY1 - plotY0;

  if (mode === "endurance_wearout") {
    // Mode A: Key Update Cycles (0 to 100,000) vs Array Wearout (%)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Wearout (%)", 6, plotY0 + 6);
    ctx.fillText("0", plotX0, plotY1 + 16);
    ctx.fillText("50k Cycles", plotX0 + plotW * 0.5 - 25, plotY1 + 16);
    ctx.fillText("100k Cycles", plotX1 - 65, plotY1 + 16);

    ctx.fillText("100%", plotX0 - 32, plotY0 + 4);
    ctx.fillText("50%", plotX0 - 26, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0%", plotX0 - 20, plotY1 + 4);

    const maxCycles = 100000;

    const drawWearCurve = (mediaKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const cyc = (i / steps) * maxCycles;
        const sim = calculatePqcKeyStorage({
          algoKey: metrics.algoKey,
          mediaKey,
          customUpdateCycles: cyc,
          customArrayCapacityKb: metrics.capacityKb,
        });
        const clampedWear = Math.min(100.0, sim.wearoutPct);
        const px = plotX0 + (cyc / maxCycles) * plotW;
        const py = plotY1 - (clampedWear / 100.0) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawWearCurve("embedded_flash_sector", "#ef4444", "eFlash Sector", metrics.mediaKey === "embedded_flash_sector");
    drawWearCurve("spintronic_mram", "#a855f7", "STT-MRAM", metrics.mediaKey === "spintronic_mram");
    drawWearCurve("antifuse_append_log", "#06b6d4", "AntiFuse Append Log", metrics.mediaKey === "antifuse_append_log");

    // Current Operating Point Marker
    const currCyc = Math.min(maxCycles, metrics.updateCycles);
    const currWear = Math.min(100.0, metrics.wearoutPct);
    const markerX = plotX0 + (currCyc / maxCycles) * plotW;
    const markerY = plotY1 - (currWear / 100.0) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Updates: ${currCyc} | Wear: ${currWear}%`, Math.min(markerX + 8, plotX1 - 150), Math.max(markerY - 8, plotY0 + 12));

  } else {
    // Mode B: Active Tamper Zeroization Latency & Waveform
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Key State", 6, plotY0 + 6);
    ctx.fillText("0 ns", plotX0, plotY1 + 16);
    ctx.fillText("50 ns (FIPS Target)", plotX0 + plotW * 0.45 - 35, plotY1 + 16);
    ctx.fillText("100 ns", plotX1 - 35, plotY1 + 16);

    // Draw Tamper Event Trigger line
    const tamperX = plotX0 + 15;
    ctx.strokeStyle = "#ef4444";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tamperX, plotY0);
    ctx.lineTo(tamperX, plotY1);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 9.5px 'IBM Plex Mono', monospace";
    ctx.fillText("Tamper Alarm", tamperX + 4, plotY0 + 12);

    // Draw Destruction Curve
    // If AntiFuse: drops to zero at 12ns
    // If eFlash: stays high across entire nanosecond window
    ctx.strokeStyle = metrics.mediaKey === "antifuse_append_log" ? "#10b981" : (metrics.mediaKey === "spintronic_mram" ? "#a855f7" : "#ef4444");
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const highY = plotY0 + 20;
    const zeroY = plotY1 - 8;

    ctx.moveTo(plotX0, highY);
    ctx.lineTo(tamperX, highY);

    if (metrics.mediaKey === "antifuse_append_log") {
      const zeroizeX = tamperX + (12.0 / 100.0) * plotW;
      ctx.lineTo(zeroizeX, zeroY);
      ctx.lineTo(plotX1, zeroY);
    } else if (metrics.mediaKey === "battery_backed_sram") {
      const zeroizeX = tamperX + (25.0 / 100.0) * plotW;
      ctx.lineTo(zeroizeX, zeroY);
      ctx.lineTo(plotX1, zeroY);
    } else {
      // eFlash or STT-MRAM (stays valid beyond 100ns window)
      ctx.lineTo(plotX1, highY);
    }
    ctx.stroke();

    ctx.fillStyle = metrics.mediaKey === "antifuse_append_log" ? "#10b981" : "#ef4444";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Zeroization Delay: ${metrics.zeroizeNs}`, plotX0 + 25, plotY1 - 25);
    ctx.fillText(`Grade: ${metrics.complianceGradeEn}`, plotX0 + 25, plotY1 - 10);
  }

  ctx.restore();
}

/**
 * Initializes the PQC Key Storage Simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initPqcKeyStorageSimulator(container) {
  const root = container || document.getElementById("pqc-key-simulator-root");
  if (!root) return;

  const algoSelect = root.querySelector("#pqc-algo-select");
  const mediaSelect = root.querySelector("#pqc-media-select");
  const cycSlider = root.querySelector("#pqc-cycles-slider");
  const cycVal = root.querySelector("#pqc-cycles-val");
  const capSlider = root.querySelector("#pqc-capacity-slider");
  const capVal = root.querySelector("#pqc-capacity-val");

  const outKeySize = root.querySelector("#pqc-out-keysize");
  const outSlots = root.querySelector("#pqc-out-slots");
  const outWear = root.querySelector("#pqc-out-wear");
  const outLife = root.querySelector("#pqc-out-life");
  const outZeroize = root.querySelector("#pqc-out-zeroize");
  const outRating = root.querySelector("#pqc-out-rating");
  const outVerdict = root.querySelector("#pqc-out-verdict");

  const canvas = root.querySelector("#pqc-key-canvas");
  const btnWear = root.querySelector("#pqc-mode-wear");
  const btnTiming = root.querySelector("#pqc-mode-timing");

  let currentMode = "endurance_wearout";

  // Populate Selects if empty
  if (algoSelect && algoSelect.options.length === 0) {
    Object.values(PQC_ALGORITHM_PROFILES).forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = `${a.nameEn}`;
      algoSelect.appendChild(opt);
    });
    algoSelect.value = "ml_kem_768";
  }

  if (mediaSelect && mediaSelect.options.length === 0) {
    Object.values(STORAGE_MEDIA_PROFILES).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nameEn}`;
      mediaSelect.appendChild(opt);
    });
    mediaSelect.value = "antifuse_append_log";
  }

  function update() {
    const algoKey = algoSelect ? algoSelect.value : "ml_kem_768";
    const mediaKey = mediaSelect ? mediaSelect.value : "antifuse_append_log";
    const cycles = cycSlider ? Number(cycSlider.value) : 1000;
    const capacityKb = capSlider ? Number(capSlider.value) : 64;

    if (cycVal) cycVal.textContent = `${cycles.toLocaleString()} updates`;
    if (capVal) capVal.textContent = `${capacityKb} KB`;

    const m = calculatePqcKeyStorage({
      algoKey,
      mediaKey,
      customUpdateCycles: cycles,
      customArrayCapacityKb: capacityKb,
    });

    if (outKeySize) outKeySize.textContent = `${(m.keySizeBytes / 1024).toFixed(2)} KB (${m.keySizeBytes} B)`;
    if (outSlots) outSlots.textContent = `${m.totalSlots} Slots`;
    if (outWear) {
      outWear.textContent = `${m.wearoutPct}%`;
      outWear.style.color = m.wearoutPct < 50 ? "#059669" : (m.wearoutPct < 85 ? "#f59e0b" : "#dc2626");
    }
    if (outLife) outLife.textContent = `${m.remainingLifetimeYears} Years`;
    if (outZeroize) {
      outZeroize.textContent = m.zeroizeNs;
      outZeroize.style.color = m.zeroizeValueNs <= 50 ? "#059669" : "#dc2626";
    }
    if (outRating) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outRating.textContent = isZh ? m.complianceGradeZh : m.complianceGradeEn;
      outRating.style.color = m.isFipsLevel4Compliant ? "#059669" : "#dc2626";
    }

    if (canvas) {
      drawPqcKeyStorageCanvas(canvas, m, currentMode);
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>後量子密碼儲存判定：</strong> 針對 <code>${m.algoNameZh}</code> (金鑰尺寸 ${(m.keySizeBytes / 1024).toFixed(2)} KB)，在 <code>${m.capacityKb} KB</code> 陣列經 <code>${m.updateCycles.toLocaleString()} 次</code> 密鑰更新下，<code>${m.mediaNameZh}</code> 的累積磨損率為 <strong>${m.wearoutPct}%</strong>，預期壽命為 <strong>${m.remainingLifetimeYears} 年</strong>。防竄改緊急零化延遲為 <strong>${m.zeroizeNs}</strong>，資安合規評級：<strong style="color:${m.isFipsLevel4Compliant ? '#059669' : '#dc2626'};">${m.complianceGradeZh}</strong>。AntiFuse 虛擬增量日誌技術藉由輕量指針更新避免 eFlash 區塊抹除瓶頸，提供不可逆物理抗凍結防護。`
        : `<strong>PQC Key Storage Verdict:</strong> Storing <code>${m.algoNameEn}</code> (${(m.keySizeBytes / 1024).toFixed(2)} KB footprint) within a <code>${m.capacityKb} KB</code> array over <code>${m.updateCycles.toLocaleString()} updates</code>, the <code>${m.mediaNameEn}</code> medium incurs <strong>${m.wearoutPct}%</strong> wearout with an estimated <strong>${m.remainingLifetimeYears} years</strong> lifetime. Emergency zeroization latency is <strong>${m.zeroizeNs}</strong>. Security compliance grade: <strong style="color:${m.isFipsLevel4Compliant ? '#059669' : '#dc2626'};">${m.complianceGradeEn}</strong>. AntiFuse append-only pointer logging eliminates conventional flash sector erase bottlenecks while enforcing irreversible hardware blow-gate protection.`;
    }
  }

  if (algoSelect) algoSelect.addEventListener("change", update);
  if (mediaSelect) mediaSelect.addEventListener("change", update);
  if (cycSlider) cycSlider.addEventListener("input", update);
  if (capSlider) capSlider.addEventListener("input", update);

  if (btnWear) {
    btnWear.addEventListener("click", () => {
      currentMode = "endurance_wearout";
      btnWear.classList.add("active");
      btnWear.setAttribute("aria-pressed", "true");
      btnWear.style.background = "#0284c7";
      btnWear.style.color = "#ffffff";
      btnWear.style.borderColor = "#38bdf8";
      if (btnTiming) {
        btnTiming.classList.remove("active");
        btnTiming.setAttribute("aria-pressed", "false");
        btnTiming.style.background = "#1e293b";
        btnTiming.style.color = "#94a3b8";
        btnTiming.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnTiming) {
    btnTiming.addEventListener("click", () => {
      currentMode = "zeroization_timing";
      btnTiming.classList.add("active");
      btnTiming.setAttribute("aria-pressed", "true");
      btnTiming.style.background = "#0284c7";
      btnTiming.style.color = "#ffffff";
      btnTiming.style.borderColor = "#38bdf8";
      if (btnWear) {
        btnWear.classList.remove("active");
        btnWear.setAttribute("aria-pressed", "false");
        btnWear.style.background = "#1e293b";
        btnWear.style.color = "#94a3b8";
        btnWear.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initPqcKeyStorageSimulator());
  } else {
    initPqcKeyStorageSimulator();
  }
}
