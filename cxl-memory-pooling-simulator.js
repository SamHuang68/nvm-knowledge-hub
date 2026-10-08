/**
 * @file cxl-memory-pooling-simulator.js
 * @description CXL 3.1 Fabric-Attached Memory Pooling, Hardware CAM Tag Cache,
 * AntiFuse Hardware Root-of-Trust, and Dynamic Poison Alert Architectural Simulator.
 * Models end-to-end memory access latencies, NUMA link hops, hardware CAM lookup
 * speeds, stranded memory recovery curves, and poison isolation responsiveness.
 * @version 1.0.0
 * @license MIT
 */

/**
 * System presets for CXL 3.1 pooling architectures.
 */
export const CXL_SYSTEM_PRESETS = {
  llm_shared_inference_8host: {
    nameEn: '8-Host Distributed LLM KV-Cache Pool (CXL 3.1 Multi-Headed)',
    nameZh: '8 主機分散式 LLM KV 快取共享池 (CXL 3.1 多主機埠)',
    linkSpeedGbps: 64, // PCIe 6.0 PAM4
    flitLatencyNs: 28.5,
    defaultHops: 1,
    defaultCapacityGb: 2048, // 2 TB
    defaultHitRate: 98.5,
    switchLatencyNs: 35.0,
    mediaBaseLatencyNs: 82.0, // DDR5-6400 ECC
    antiFuseTagLatencyNs: 6.8, // On-die fast CAM/LUT tag filter (with AntiFuse RoT)
    softwareOsMissLatencyNs: 1150.0,
    directUnpooledUtilization: 0.58, // 58% baseline usage
  },
  hpc_matrix_fabric_direct: {
    nameEn: 'HPC Supercomputing Direct Fabric Pool (CXL 3.1 P2P Direct)',
    nameZh: 'HPC 超算直接網絡共享池 (CXL 3.1 P2P 零交換機直連)',
    linkSpeedGbps: 64,
    flitLatencyNs: 24.0,
    defaultHops: 0,
    defaultCapacityGb: 4096, // 4 TB
    defaultHitRate: 99.2,
    switchLatencyNs: 0.0,
    mediaBaseLatencyNs: 78.0,
    antiFuseTagLatencyNs: 5.5,
    softwareOsMissLatencyNs: 980.0,
    directUnpooledUtilization: 0.65,
  },
  dynamic_capacity_dcd_cloud: {
    nameEn: 'Cloud Datacenter Dynamic Capacity Device (CXL 3.1 DCD Switched)',
    nameZh: '雲端資料中心動態容量設備 (CXL 3.1 DCD 雙層交換)',
    linkSpeedGbps: 64,
    flitLatencyNs: 32.0,
    defaultHops: 2,
    defaultCapacityGb: 8192, // 8 TB
    defaultHitRate: 96.0,
    switchLatencyNs: 38.0,
    mediaBaseLatencyNs: 88.0,
    antiFuseTagLatencyNs: 8.2,
    softwareOsMissLatencyNs: 1450.0,
    directUnpooledUtilization: 0.52,
  },
  legacy_cxl2_pcie5_comparison: {
    nameEn: 'Legacy CXL 2.0 / PCIe 5.0 NRZ Baseline (Single-Switch Host Tree)',
    nameZh: '傳統 CXL 2.0 / PCIe 5.0 NRZ 基準 (單交換器主機樹狀對照)',
    linkSpeedGbps: 32, // PCIe 5.0 NRZ
    flitLatencyNs: 58.0,
    defaultHops: 1,
    defaultCapacityGb: 1024,
    defaultHitRate: 91.5,
    switchLatencyNs: 65.0,
    mediaBaseLatencyNs: 95.0,
    antiFuseTagLatencyNs: 14.5,
    softwareOsMissLatencyNs: 1850.0,
    directUnpooledUtilization: 0.50,
  },
};

/**
 * Cache & fault isolation policies.
 */
export const CXL_POLICIES = {
  antifuse_hardware_tag: {
    nameEn: 'On-Die HW CAM Tag Cache with AntiFuse RoT (Sub-10ns Filter)',
    nameZh: '晶片內硬體 CAM 標籤快取與 AntiFuse 信任根 (次 10ns 快速過濾)',
    tagLatencyFactor: 1.0,
    poisonInterceptTimeNs: 8.5,
    securityGrade: 'Hardware Trust Boundary',
    eccOverhead: 0.015,
  },
  pure_software_kernel: {
    nameEn: 'Pure Software OS Kernel Interrupt Table (Legacy Trap)',
    nameZh: '純軟體 OS 核心中斷查表 (傳統陷阱中斷)',
    tagLatencyFactor: 12.0,
    poisonInterceptTimeNs: 850.0,
    securityGrade: 'OS Kernel Ring-0 (Vulnerable)',
    eccOverhead: 0.045,
  },
  broadcast_snooping_nop: {
    nameEn: 'Broadcast Cache Invalidation (No Tag Cache, Full Bus Walk)',
    nameZh: '廣播失效嗅探 (無標籤快取，全匯流排遍歷)',
    tagLatencyFactor: 5.5,
    poisonInterceptTimeNs: 240.0,
    securityGrade: 'Fabric Broadcast (High Snoop Traffic)',
    eccOverhead: 0.020,
  },
};

/**
 * Architectural simulation of CXL 3.1 pooling metrics.
 * @param {string} presetKey - Selected preset key.
 * @param {string} policyKey - Selected policy key.
 * @param {number} hops - Network switch hop count (0 to 3).
 * @param {number} capacityGb - Pool memory capacity in gigabytes.
 * @param {number} hitRatePct - Tag cache hit rate (70.0% to 99.9%).
 * @returns {Object} Calculated metrics and ratings.
 */
export function calculateCxlPoolingMetrics(
  presetKey,
  policyKey,
  hops,
  capacityGb,
  hitRatePct
) {
  const preset = CXL_SYSTEM_PRESETS[presetKey] || CXL_SYSTEM_PRESETS.llm_shared_inference_8host;
  const policy = CXL_POLICIES[policyKey] || CXL_POLICIES.antifuse_hardware_tag;

  const hitRate = Math.max(0.5, Math.min(0.9999, hitRatePct / 100.0));
  const effectiveTagLatency = preset.antiFuseTagLatencyNs * policy.tagLatencyFactor;

  // 1. End-to-end Latency Breakdown
  // tau_link = tau_flit * 2 (request + response) + hops * (switch_latency * 2)
  const linkTransportLatency = (preset.flitLatencyNs * 2) + (hops * preset.switchLatencyNs * 2);

  // Effective tag lookup delay taking hits and misses into account
  const tagLookupDelay = (hitRate * effectiveTagLatency) + ((1.0 - hitRate) * preset.softwareOsMissLatencyNs);

  // Media access latency (DRAM read cycle)
  const mediaDelay = preset.mediaBaseLatencyNs;

  // Total access latency
  const totalLatencyNs = linkTransportLatency + tagLookupDelay + mediaDelay;

  // Baseline local DDR5 access for comparison (~80ns)
  const localDramLatencyNs = 80.0;
  const latencyPenaltyFactor = totalLatencyNs / localDramLatencyNs;

  // 2. Stranded Memory Recovery & Utilization
  // Exponential recovery model as pool size scales:
  // Utilization increases asymptotically from unpooled base toward ~94%
  const scaleRatio = Math.min(4.0, Math.max(0.5, capacityGb / 2048.0));
  const maxPossibleUtilization = 0.94;
  const poolUtilization = maxPossibleUtilization - (
    (maxPossibleUtilization - preset.directUnpooledUtilization) * Math.exp(-0.45 * scaleRatio)
  );

  const utilizationGainPct = (poolUtilization - preset.directUnpooledUtilization) * 100.0;
  const strandedMemoryRecoveredGb = capacityGb * (poolUtilization - preset.directUnpooledUtilization);

  // Capital savings estimate based on server DRAM at ~$4.5 per GB
  const capexSavedDollars = strandedMemoryRecoveredGb * 4.5;

  // 3. Poison Isolation Response Time
  const poisonInterceptNs = policy.poisonInterceptTimeNs;
  const isZeroPanicGuaranteed = poisonInterceptNs < 20.0;

  // 4. Comprehensive Rating
  let rating = 'OPTIMAL';
  let verdictEn = '';
  let verdictZh = '';

  if (totalLatencyNs <= 185.0 && isZeroPanicGuaranteed) {
    rating = 'OPTIMAL';
    verdictEn = `OPTIMAL CXL 3.1 POOLING: End-to-end latency bounded at ${totalLatencyNs.toFixed(1)} ns (${latencyPenaltyFactor.toFixed(2)}x of local DRAM). Hardware CAM tag cache achieves ${hitRatePct.toFixed(1)}% hit rate, isolating poison faults in ${poisonInterceptNs.toFixed(1)} ns before host register commit (sub-20ns target met). Rescues ${strandedMemoryRecoveredGb.toFixed(0)} GB of stranded capacity, reducing estimated datacenter TCO by $${capexSavedDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`;
    verdictZh = `最佳 CXL 3.1 記憶體池化架構：端到端存取延遲控制於 ${totalLatencyNs.toFixed(1)} ns（約為本機 DRAM 的 ${latencyPenaltyFactor.toFixed(2)} 倍）。硬體 CAM 標籤快取達成 ${hitRatePct.toFixed(1)}% 命中率，控制器在主機暫存器提交前於 ${poisonInterceptNs.toFixed(1)} ns 內完成毒化標記轉發與隔離（符合次 20ns 阻斷目標）。推估回收 ${strandedMemoryRecoveredGb.toFixed(0)} GB 閒置記憶體，降低資料中心 TCO 約 $${capexSavedDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })} 美元。`;
  } else if (totalLatencyNs <= 300.0) {
    rating = 'VIABLE';
    verdictEn = `VIABLE FABRIC CONFIGURATION: Latency increases to ${totalLatencyNs.toFixed(1)} ns due to ${hops} switch hops and cache miss overhead. Memory utilization reaches ${(poolUtilization * 100).toFixed(1)}%, but software fallback introduces latency jitter. Recommended for background batch inference workloads.`;
    verdictZh = `可行網絡配置：由於 ${hops} 層交換機跳數與快取未命中懲罰，存取延遲上升至 ${totalLatencyNs.toFixed(1)} ns。記憶體利用率達到 ${(poolUtilization * 100).toFixed(1)}%，但軟體查表引入延遲抖動。建議部署於背景批次推論運算工作。`;
  } else {
    rating = 'SUB-OPTIMAL';
    verdictEn = `SUB-OPTIMAL LATENCY TRAP: End-to-end latency spikes to ${totalLatencyNs.toFixed(1)} ns (${latencyPenaltyFactor.toFixed(2)}x slower than DRAM). Lack of dedicated hardware CAM tag cache causes excessive OS kernel interrupts, risking PCIe Completion Timeout (CTO) and system stalls. Dedicated hardware tag acceleration required.`;
    verdictZh = `次佳延遲陷阱：端到端延遲上升至 ${totalLatencyNs.toFixed(1)} ns（比本地 DRAM 慢 ${latencyPenaltyFactor.toFixed(2)} 倍）。缺少專屬硬體 CAM 標籤快取導致龐大 OS 核心中斷，面臨 PCIe 完成逾時 (Completion Timeout, CTO) 與系統卡頓風險。強烈建議導入硬體標籤加速。`;
  }

  return {
    linkTransportLatency,
    tagLookupDelay,
    mediaDelay,
    totalLatencyNs,
    latencyPenaltyFactor,
    poolUtilization,
    unpooledUtilization: preset.directUnpooledUtilization,
    utilizationGainPct,
    strandedMemoryRecoveredGb,
    capexSavedDollars,
    poisonInterceptNs,
    isZeroPanicGuaranteed,
    rating,
    verdictEn,
    verdictZh,
  };
}

/**
 * Draws the high-DPI CXL 3.1 Simulation Canvas in dual modes.
 * @param {HTMLCanvasElement} canvas - HTML Canvas element.
 * @param {Object} metrics - Output from calculateCxlPoolingMetrics.
 * @param {string} mode - 'latency_breakdown' or 'stranded_memory_economics'.
 * @param {string} language - 'zh' or 'en'.
 */
export function drawCxlPoolingCanvas(canvas, metrics, mode = 'latency_breakdown', language = 'zh') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || 420;
  const height = rect.height || canvas.height || 200;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 30; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (mode === 'latency_breakdown') {
    // Mode 1: Stacked Latency Breakdown Bar Chart
    const padding = { top: 32, bottom: 35, left: 55, right: 25 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Component segments
    const transport = metrics.linkTransportLatency;
    const tag = metrics.tagLookupDelay;
    const media = metrics.mediaDelay;
    const total = metrics.totalLatencyNs;

    // Max scale (at least 250ns)
    const maxVal = Math.max(250, total * 1.2);

    // Title
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = '#38bdf8';
    const titleText = language === 'zh'
      ? `CXL 3.1 端到端存取延遲分解 (總計: ${total.toFixed(1)} ns)`
      : `CXL 3.1 End-to-End Latency Breakdown (Total: ${total.toFixed(1)} ns)`;
    ctx.fillText(titleText, padding.left, 20);

    // Baseline local DRAM comparison bar (Top bar)
    const localDramY = padding.top + 15;
    const localDramW = (80.0 / maxVal) * chartW;
    ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
    ctx.fillRect(padding.left, localDramY, localDramW, 24);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(padding.left, localDramY, localDramW, 24);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = "500 10px 'IBM Plex Mono', monospace";
    ctx.fillText(
      language === 'zh' ? '本機 DDR5 基準: 80.0 ns' : 'Local DDR5 Base: 80.0 ns',
      padding.left + localDramW + 8,
      localDramY + 16
    );

    // CXL Stacked Bar (Bottom bar)
    const cxlY = localDramY + 45;
    const barH = 32;

    const transportW = (transport / maxVal) * chartW;
    const tagW = (tag / maxVal) * chartW;
    const mediaW = (media / maxVal) * chartW;

    // Segment 1: Link Transport (Cyan)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(padding.left, cxlY, transportW, barH);

    // Segment 2: AntiFuse Tag Cache (Emerald / Amber depending on hit)
    ctx.fillStyle = tag > 50 ? '#f59e0b' : '#10b981';
    ctx.fillRect(padding.left + transportW, cxlY, tagW, barH);

    // Segment 3: Media DRAM Access (Indigo)
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(padding.left + transportW + tagW, cxlY, mediaW, barH);

    // Stacked bar outline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding.left, cxlY, transportW + tagW + mediaW, barH);

    // Value annotation
    ctx.fillStyle = '#f8fafc';
    ctx.font = "700 11px 'IBM Plex Mono', monospace";
    ctx.fillText(`${total.toFixed(1)} ns`, padding.left + transportW + tagW + mediaW + 8, cxlY + 20);

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = Math.min(width - padding.left - 20, 390);
    const legBoxH = 22;
    const legBoxX = padding.left;
    const legBoxY = height - 26;
    ctx.fillStyle = 'rgba(8, 19, 30, 0.90)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legBoxX, legBoxY, legBoxW, legBoxH, 4);
    else ctx.rect(legBoxX, legBoxY, legBoxW, legBoxH);
    ctx.fill();
    ctx.stroke();

    const items = [
      { color: '#0284c7', label: language === 'zh' ? `鏈路 (${transport.toFixed(1)}ns)` : `Link (${transport.toFixed(1)}ns)` },
      { color: tag > 50 ? '#fbbf24' : '#10b981', label: language === 'zh' ? `標籤 (${tag.toFixed(1)}ns)` : `Tag (${tag.toFixed(1)}ns)` },
      { color: '#818cf8', label: language === 'zh' ? `介質 (${media.toFixed(1)}ns)` : `Media (${media.toFixed(1)}ns)` },
    ];

    let legX = legBoxX + 8;
    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.fillRect(legX, legBoxY + 7, 10, 8);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = "500 9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(item.label, legX + 14, legBoxY + 15);
      legX += (ctx.measureText(item.label).width + 18);
    }

  } else {
    // Mode 2: Stranded Memory Recovery & Economics
    const padding = { top: 30, bottom: 35, left: 55, right: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Title
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = '#34d399';
    const titleText = language === 'zh'
      ? `記憶體池化回收曲線 (回收: ${metrics.strandedMemoryRecoveredGb.toFixed(0)} GB · 節省 $${metrics.capexSavedDollars.toFixed(0)})`
      : `Stranded Memory Recovery (Rescued: ${metrics.strandedMemoryRecoveredGb.toFixed(0)} GB · Saved $${metrics.capexSavedDollars.toFixed(0)})`;
    ctx.fillText(titleText, padding.left, 20);

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Draw Stranded Memory reduction curve
    // X axis: Pool capacity (256GB to 8192GB)
    // Y axis: Utilization (40% to 100%)
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;

    const points = 25;
    const baseUtil = metrics.unpooledUtilization || 0.55;
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const cap = 256 + t * (8192 - 256);
      const ratio = cap / 2048.0;
      const util = 0.94 - ((0.94 - baseUtil) * Math.exp(-0.45 * ratio));

      const px = padding.left + t * chartW;
      const py = padding.top + chartH - ((util - 0.4) / 0.6) * chartH;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Baseline unpooled line (dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    const unpooledY = padding.top + chartH - ((baseUtil - 0.4) / 0.6) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, unpooledY);
    ctx.lineTo(padding.left + chartW, unpooledY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current point marker
    const currentUtil = metrics.poolUtilization;
    const currentRatio = (currentUtil - 0.4) / 0.6;
    const currentY = padding.top + chartH - currentRatio * chartH;
    const currentX = padding.left + 0.5 * chartW; // center representation

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Point annotation
    ctx.fillStyle = '#f8fafc';
    ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
    ctx.fillText(`${(currentUtil * 100).toFixed(1)}%`, currentX + 10, currentY - 6);

    // Y Axis Labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = "500 9px 'IBM Plex Mono', monospace";
    ctx.fillText('100%', padding.left - 30, padding.top + 8);
    ctx.fillText('70%', padding.left - 25, padding.top + chartH * 0.5);
    ctx.fillText('40%', padding.left - 25, padding.top + chartH);

    // X Axis Labels
    ctx.fillText('256GB', padding.left, height - 14);
    ctx.fillText('4TB', padding.left + chartW * 0.5, height - 14);
    ctx.fillText('8TB', padding.left + chartW - 20, height - 14);
  }
}

/**
 * Initializes the CXL 3.1 pooling simulator inside its DOM container.
 * Binds preset select, policy select, hop/capacity/hit-rate sliders, and canvas mode buttons.
 * @param {string} rootId - Container element ID.
 */
export function initCxlPoolingSimulator(rootId = 'cxl-memory-pooling-simulator-root') {
  const container = document.getElementById(rootId);
  if (!container) return;

  const presetSelect = container.querySelector('#cxl-preset-select');
  const policySelect = container.querySelector('#cxl-policy-select');
  const hopsSlider = container.querySelector('#cxl-hops-slider');
  const capacitySlider = container.querySelector('#cxl-capacity-slider');
  const hitrateSlider = container.querySelector('#cxl-hitrate-slider');

  const hopsVal = container.querySelector('#cxl-hops-val');
  const capacityVal = container.querySelector('#cxl-capacity-val');
  const hitrateVal = container.querySelector('#cxl-hitrate-val');

  const outLatency = container.querySelector('#cxl-out-latency');
  const outUtilization = container.querySelector('#cxl-out-utilization');
  const outPoisonTime = container.querySelector('#cxl-out-poison-time');
  const outSaved = container.querySelector('#cxl-out-saved');
  const outRating = container.querySelector('#cxl-out-rating');
  const outVerdict = container.querySelector('#cxl-out-verdict');

  const canvas = container.querySelector('#cxl-pooling-canvas');
  const modeLatencyBtn = container.querySelector('#cxl-mode-latency');
  const modePoolingBtn = container.querySelector('#cxl-mode-pooling');

  let currentMode = 'latency_breakdown';

  function getLanguage() {
    return document.documentElement.getAttribute('data-language') === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const presetKey = presetSelect ? presetSelect.value : 'llm_shared_inference_8host';
    const policyKey = policySelect ? policySelect.value : 'antifuse_hardware_tag';
    const hops = hopsSlider ? parseInt(hopsSlider.value, 10) : 1;
    const capacityGb = capacitySlider ? parseInt(capacitySlider.value, 10) : 2048;
    const hitRatePct = hitrateSlider ? parseFloat(hitrateSlider.value) : 98.5;

    // Update slider label texts
    if (hopsVal) hopsVal.textContent = `${hops} ${hops === 1 ? 'hop' : 'hops'}`;
    if (capacityVal) {
      capacityVal.textContent = capacityGb >= 1024
        ? `${(capacityGb / 1024).toFixed(1)} TB (${capacityGb} GB)`
        : `${capacityGb} GB`;
    }
    if (hitrateVal) hitrateVal.textContent = `${hitRatePct.toFixed(1)}%`;

    const metrics = calculateCxlPoolingMetrics(presetKey, policyKey, hops, capacityGb, hitRatePct);

    // Update KPI outputs
    if (outLatency) {
      outLatency.textContent = `${metrics.totalLatencyNs.toFixed(1)} ns`;
      outLatency.style.color = metrics.totalLatencyNs <= 185 ? '#22d3ee' : (metrics.totalLatencyNs <= 300 ? '#fbbf24' : '#f87171');
    }
    if (outUtilization) {
      outUtilization.textContent = `${(metrics.poolUtilization * 100).toFixed(1)}% (+${metrics.utilizationGainPct.toFixed(1)}%)`;
    }
    if (outPoisonTime) {
      outPoisonTime.textContent = `${metrics.poisonInterceptNs.toFixed(1)} ns`;
      outPoisonTime.style.color = metrics.isZeroPanicGuaranteed ? '#34d399' : '#f87171';
    }
    if (outSaved) {
      outSaved.textContent = `$${metrics.capexSavedDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (outRating) {
      outRating.textContent = metrics.rating;
      outRating.style.color = metrics.rating === 'OPTIMAL' ? '#38bdf8' : (metrics.rating === 'VIABLE' ? '#fbbf24' : '#f87171');
    }
    if (outVerdict) {
      const lang = getLanguage();
      outVerdict.textContent = lang === 'zh' ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawCxlPoolingCanvas(canvas, metrics, currentMode, getLanguage());
    }
  }

  // Preset switch applies preset defaults
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = CXL_SYSTEM_PRESETS[presetSelect.value];
      if (preset) {
        if (hopsSlider) hopsSlider.value = preset.defaultHops;
        if (capacitySlider) capacitySlider.value = preset.defaultCapacityGb;
        if (hitrateSlider) hitrateSlider.value = preset.defaultHitRate;
      }
      update();
    });
  }

  if (policySelect) policySelect.addEventListener('change', update);
  if (hopsSlider) hopsSlider.addEventListener('input', update);
  if (capacitySlider) capacitySlider.addEventListener('input', update);
  if (hitrateSlider) hitrateSlider.addEventListener('input', update);

  if (modeLatencyBtn && modePoolingBtn) {
    modeLatencyBtn.addEventListener('click', () => {
      currentMode = 'latency_breakdown';
      modeLatencyBtn.classList.add('active');
      modeLatencyBtn.setAttribute('aria-pressed', 'true');
      modeLatencyBtn.style.background = '#0284c7';
      modeLatencyBtn.style.color = '#ffffff';
      modeLatencyBtn.style.borderColor = '#38bdf8';

      modePoolingBtn.classList.remove('active');
      modePoolingBtn.setAttribute('aria-pressed', 'false');
      modePoolingBtn.style.background = '#1e293b';
      modePoolingBtn.style.color = '#94a3b8';
      modePoolingBtn.style.borderColor = '#475569';
      update();
    });

    modePoolingBtn.addEventListener('click', () => {
      currentMode = 'stranded_memory_economics';
      modePoolingBtn.classList.add('active');
      modePoolingBtn.setAttribute('aria-pressed', 'true');
      modePoolingBtn.style.background = '#059669';
      modePoolingBtn.style.color = '#ffffff';
      modePoolingBtn.style.borderColor = '#34d399';

      modeLatencyBtn.classList.remove('active');
      modeLatencyBtn.setAttribute('aria-pressed', 'false');
      modeLatencyBtn.style.background = '#1e293b';
      modeLatencyBtn.style.color = '#94a3b8';
      modeLatencyBtn.style.borderColor = '#475569';
      update();
    });
  }

  // Language switch observation
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-language'] });
  window.addEventListener('resize', update);

  // Initial calculation
  update();
}

// Auto-boot if container is present
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCxlPoolingSimulator());
  } else {
    initCxlPoolingSimulator();
  }
}
