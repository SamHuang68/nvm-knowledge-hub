/**
 * pqc-rot-budget-calculator.js — NIST FIPS 203/204 Post-Quantum Hardware Root-of-Trust (RoT) Key Budget Explorer
 *
 * First-principles cryptographic asset sizing, silicon NVM allocation, and physical feasibility
 * modeling for quantum-resistant Secure Elements, HSMs, and AI accelerator RoT.
 *
 * Mathematical & Cryptographic References:
 * 1. NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)
 * 2. NIST FIPS 204: Module-Lattice-Based Digital Signature Algorithm (ML-DSA)
 * 3. NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0 Cybersecurity Advisory)
 * 4. NIST SP 800-208: Stateful Hash-Based Signatures (LMS/XMSS) for Firmware Integrity
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: NIST FIPS 140-3, ISO/IEC 19790, Common Criteria AVA_VAN.5
 */

'use strict';

export const PQC_ALGORITHMS = Object.freeze({
  ml_kem_768: {
    id: 'ml_kem_768',
    name: 'ML-KEM-768 (FIPS 203)',
    category: 'KEM',
    securityLevel: 'NIST Level 3 (AES-192 equiv.)',
    pubKeyBytes: 1184, // 9,472 bits
    ctBytes: 1088,
  },
  ml_kem_1024: {
    id: 'ml_kem_1024',
    name: 'ML-KEM-1024 (FIPS 203)',
    category: 'KEM',
    securityLevel: 'NIST Level 5 (AES-256 equiv.)',
    pubKeyBytes: 1568, // 12,544 bits
    ctBytes: 1568,
  },
  ml_dsa_65: {
    id: 'ml_dsa_65',
    name: 'ML-DSA-65 (FIPS 204)',
    category: 'DSA',
    securityLevel: 'NIST Level 3 (AES-192 equiv.)',
    pubKeyBytes: 1952, // 15,616 bits
    sigBytes: 3293,
  },
  ml_dsa_87: {
    id: 'ml_dsa_87',
    name: 'ML-DSA-87 (FIPS 204)',
    category: 'DSA',
    securityLevel: 'NIST Level 5 (AES-256 equiv.)',
    pubKeyBytes: 2592, // 20,736 bits
    sigBytes: 4595,
  },
  lms_sha256: {
    id: 'lms_sha256',
    name: 'LMS State-Based Hash (SP 800-208)',
    category: 'Stateful Hash',
    securityLevel: 'CNSA 2.0 Firmware Root',
    pubKeyBytes: 60, // Compact root seed digest
    sigBytes: 1840,
    stateCounterBits: 64,
  },
  ecdsa_p256: {
    id: 'ecdsa_p256',
    name: 'ECDSA P-256 (Classical Baseline)',
    category: 'Classical',
    securityLevel: 'Classical 128-bit',
    pubKeyBytes: 64, // 512 bits
    sigBytes: 64,
  },
});

export const PQC_PRESETS = Object.freeze({
  cnsa2_top_secret: {
    id: 'cnsa2_top_secret',
    nameEn: 'CNSA 2.0 Top Secret (ML-KEM-1024 + ML-DSA-87)',
    nameZh: 'CNSA 2.0 最高機密等級 (ML-KEM-1024 + ML-DSA-87)',
    kemId: 'ml_kem_1024',
    dsaId: 'ml_dsa_87',
    pubKeyMode: 'raw',
    certDepth: 2,
    keySlots: 4,
    rollbackBits: 256,
    pufHelperBytes: 1024,
    includeStatefulHash: true,
  },
  fips_commercial_l3: {
    id: 'fips_commercial_l3',
    nameEn: 'NIST Level 3 Commercial (ML-KEM-768 + ML-DSA-65)',
    nameZh: 'NIST 等級 3 商用標準 (ML-KEM-768 + ML-DSA-65)',
    kemId: 'ml_kem_768',
    dsaId: 'ml_dsa_65',
    pubKeyMode: 'raw',
    certDepth: 1,
    keySlots: 2,
    rollbackBits: 128,
    pufHelperBytes: 512,
    includeStatefulHash: false,
  },
  hybrid_transition: {
    id: 'hybrid_transition',
    nameEn: 'Hybrid Classical + PQC (P-256 + ML-DSA-65 Dual-Sign)',
    nameZh: '混合古典 + PQC 過渡架構 (P-256 + ML-DSA-65 雙重驗簽)',
    kemId: 'ml_kem_768',
    dsaId: 'ml_dsa_65',
    pubKeyMode: 'raw',
    certDepth: 1,
    keySlots: 2,
    rollbackBits: 128,
    pufHelperBytes: 512,
    includeClassical: true,
    includeStatefulHash: false,
  },
  classical_baseline: {
    id: 'classical_baseline',
    nameEn: 'Legacy Classical Baseline (ECDSA P-256 Only)',
    nameZh: '傳統古典基準 (僅 ECDSA P-256)',
    kemId: null,
    dsaId: 'ecdsa_p256',
    pubKeyMode: 'raw',
    certDepth: 0,
    keySlots: 1,
    rollbackBits: 64,
    pufHelperBytes: 0,
    includeStatefulHash: false,
  },
});

/**
 * Calculates total Silicon RoT NVM budget based on selected cryptographic parameters.
 * @param {Object} options Configuration parameters.
 * @return {Object} Computed budget, byte breakdown, and silicon feasibility.
 */
export function calculatePqcRotBudget(options = {}) {
  const dsaAlgo = PQC_ALGORITHMS[options.dsaId] || PQC_ALGORITHMS.ml_dsa_65;
  const kemAlgo = options.kemId ? PQC_ALGORITHMS[options.kemId] : null;
  const pubKeyMode = options.pubKeyMode || 'raw'; // 'raw' or 'hash'
  const certDepth = Math.max(0, parseInt(options.certDepth, 10) || 0);
  const keySlots = Math.max(1, parseInt(options.keySlots, 10) || 1);
  const rollbackBits = Math.max(0, parseInt(options.rollbackBits, 10) || 0);
  const pufHelperBytes = Math.max(0, parseInt(options.pufHelperBytes, 10) || 0);
  const includeClassical = Boolean(options.includeClassical);
  const includeStatefulHash = Boolean(options.includeStatefulHash);

  // 1. Root Public Key / Digest Bytes
  let rootKeyBytesPerSlot = 0;
  if (pubKeyMode === 'raw') {
    rootKeyBytesPerSlot += dsaAlgo.pubKeyBytes;
    if (kemAlgo) rootKeyBytesPerSlot += kemAlgo.pubKeyBytes;
    if (includeClassical) rootKeyBytesPerSlot += PQC_ALGORITHMS.ecdsa_p256.pubKeyBytes;
    if (includeStatefulHash) rootKeyBytesPerSlot += PQC_ALGORITHMS.lms_sha256.pubKeyBytes;
  } else {
    // Hash digest mode: stores SHA-384 (48 Bytes) or SHA-256 (32 Bytes)
    rootKeyBytesPerSlot += 48; // SHA3-384
    if (includeClassical) rootKeyBytesPerSlot += 32;
  }
  const totalRootKeyBytes = rootKeyBytesPerSlot * keySlots;

  // 2. Certificate Chain Storage (Intermediate CAs & Device Identity Leaf)
  // Each certificate holds a public key + standard X.509/CBOR metadata (~120 Bytes)
  const bytesPerCert = dsaAlgo.pubKeyBytes + 128;
  const totalCertChainBytes = certDepth * bytesPerCert * keySlots;

  // 3. Monotonic Anti-Rollback Counters (One-hot fuse representation)
  // 1 bit per firmware version update, irreversible state.
  const totalRollbackBits = rollbackBits * keySlots;
  const totalRollbackBytes = Math.ceil(totalRollbackBits / 8);

  // 4. SRAM PUF Helper Data / Activation Code
  const totalPufBytes = pufHelperBytes;

  // 5. Total Non-Volatile Storage Requirement
  const totalBytes = totalRootKeyBytes + totalCertChainBytes + totalRollbackBytes + totalPufBytes;
  const totalBits = totalBytes * 8;
  const totalKilobits = totalBits / 1024;

  // 6. Technology Feasibility Evaluation
  // A. eFuse 教學容量假設；不是技術家族的實體上限。
  const efuseLimitBits = 4096; // 假設 4 Kb，實際依具名巨集確認
  const efuseFeasible = totalBits <= efuseLimitBits;
  const efuseOverflowBits = Math.max(0, totalBits - efuseLimitBits);

  // B. Logic AntiFuse OTP 教學容量假設。
  const antifuseLimitBits = 131072; // 128 Kb
  const antifuseFeasible = totalBits <= antifuseLimitBits;
  const antifuseUtilPct = (totalBits / antifuseLimitBits) * 100;

  // C. Embedded MRAM / RRAM 教學容量假設。
  const mramLimitBits = 4194304; // 4 Mb
  const mramFeasible = totalBits <= mramLimitBits;
  const mramUtilPct = (totalBits / mramLimitBits) * 100;

  // 7. Physical Silicon Area Estimation (28nm / 16nm / 5nm)
  // AntiFuse OTP standard bitcell area: 28nm ~0.38 um2, 16nm ~0.16 um2, 5nm ~0.048 um2
  const areaUm2_28nm = Math.round(totalBits * 0.38 * 1.45); // 45% peripheral macro overhead
  const areaUm2_16nm = Math.round(totalBits * 0.16 * 1.40);
  const areaUm2_5nm = Math.round(totalBits * 0.048 * 1.35);

  return {
    inputs: {
      dsaAlgo,
      kemAlgo,
      pubKeyMode,
      certDepth,
      keySlots,
      rollbackBits,
      pufHelperBytes,
      includeClassical,
      includeStatefulHash,
    },
    breakdown: {
      rootKeyBytes: totalRootKeyBytes,
      certChainBytes: totalCertChainBytes,
      rollbackBytes: totalRollbackBytes,
      pufBytes: totalPufBytes,
      totalBytes,
      totalBits,
      totalKilobits: parseFloat(totalKilobits.toFixed(2)),
    },
    feasibility: {
      efuse: {
        feasible: efuseFeasible,
        limitBits: efuseLimitBits,
        overflowBits: efuseOverflowBits,
        statusEn: efuseFeasible ? 'Within Model Capacity' : 'Exceeds Model Capacity',
        statusZh: efuseFeasible ? '模型容量內' : '超出模型容量',
        reasonEn: efuseFeasible
          ? 'The selected budget fits the illustrative 4 Kb allocation. Verify the named macro capacity, programming conditions, and update policy.'
          : `The ${totalKilobits.toFixed(1)} Kb budget exceeds the illustrative 4 Kb allocation, not a universal eFuse limit. Verify the named macro and integration requirements.`,
        reasonZh: efuseFeasible
          ? '目前預算在教學設定的 4 Kb 容量內；仍須確認具名巨集容量、編程條件與更新政策。'
          : `需求 ${totalKilobits.toFixed(1)} Kb 超出教學設定的 4 Kb，並非超出所有 eFuse 的實體上限；須確認具名巨集與整合要求。`,
      },
      antifuse: {
        feasible: antifuseFeasible,
        limitBits: antifuseLimitBits,
        utilizationPct: parseFloat(antifuseUtilPct.toFixed(1)),
        statusEn: antifuseFeasible ? 'Within Model Capacity' : 'Exceeds Model Capacity',
        statusZh: antifuseFeasible ? '模型容量內' : '超出模型容量',
        reasonEn: `Illustrative 128 Kb allocation: ${antifuseUtilPct.toFixed(1)}% utilization. Confirm the named AntiFuse macro, process, programming, and security evidence; capacity alone does not establish suitability.`,
        reasonZh: `教學設定 128 Kb，使用率 ${antifuseUtilPct.toFixed(1)}%。須確認具名 AntiFuse 巨集、製程、編程及安全證據；容量不能單獨決定適用性。`,
      },
      mram: {
        feasible: mramFeasible,
        limitBits: mramLimitBits,
        utilizationPct: parseFloat(mramUtilPct.toFixed(2)),
        statusEn: mramFeasible ? 'Within Model Capacity' : 'Exceeds Model Capacity',
        statusZh: mramFeasible ? '模型容量內' : '超出模型容量',
        reasonEn: `Illustrative 4 Mb allocation: ${mramUtilPct.toFixed(2)}% utilization. Confirm the named MRAM/RRAM macro, process integration, retention, and update requirements.`,
        reasonZh: `教學設定 4 Mb，使用率 ${mramUtilPct.toFixed(2)}%。須確認具名 MRAM／RRAM 巨集、製程整合、保持時間與更新需求。`,
      },
    },
    siliconArea: {
      nm28: areaUm2_28nm,
      nm16: areaUm2_16nm,
      nm5: areaUm2_5nm,
    },
  };
}

/**
 * Initializes the PQC RoT Budget Calculator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initPqcRotCalculator(rootSelector = '#pqc-budget-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  // Form Controls
  const presetSelect = root.querySelector('#pqc-preset-select');
  const dsaSelect = root.querySelector('#pqc-dsa-select');
  const kemSelect = root.querySelector('#pqc-kem-select');
  const pubKeyModeSelect = root.querySelector('#pqc-pubkey-mode');
  const certDepthSlider = root.querySelector('#pqc-cert-depth-slider');
  const certDepthVal = root.querySelector('#pqc-cert-depth-val');
  const keySlotsSlider = root.querySelector('#pqc-keyslots-slider');
  const keySlotsVal = root.querySelector('#pqc-keyslots-val');
  const rollbackSlider = root.querySelector('#pqc-rollback-slider');
  const rollbackVal = root.querySelector('#pqc-rollback-val');
  const pufHelperSelect = root.querySelector('#pqc-puf-helper');
  const chkClassical = root.querySelector('#pqc-include-classical');
  const chkStateful = root.querySelector('#pqc-include-stateful');

  // Displays
  const totalKbDisplay = root.querySelector('#pqc-total-kb');
  const totalBytesDisplay = root.querySelector('#pqc-total-bytes');
  const totalBitsDisplay = root.querySelector('#pqc-total-bits');
  const barRootKey = root.querySelector('#pqc-bar-rootkey');
  const barCertChain = root.querySelector('#pqc-bar-certchain');
  const barRollback = root.querySelector('#pqc-bar-rollback');
  const barPuf = root.querySelector('#pqc-bar-puf');

  const efusePill = root.querySelector('#pqc-efuse-pill');
  const efuseDesc = root.querySelector('#pqc-efuse-desc');
  const antifusePill = root.querySelector('#pqc-antifuse-pill');
  const antifuseDesc = root.querySelector('#pqc-antifuse-desc');
  const mramPill = root.querySelector('#pqc-mram-pill');
  const mramDesc = root.querySelector('#pqc-mram-desc');

  const area28Display = root.querySelector('#pqc-area-28nm');
  const area16Display = root.querySelector('#pqc-area-16nm');
  const area5Display = root.querySelector('#pqc-area-5nm');
  const verdictBanner = root.querySelector('#pqc-architect-verdict');

  function update() {
    const options = {
      dsaId: dsaSelect?.value || 'ml_dsa_65',
      kemId: kemSelect?.value === 'none' ? null : kemSelect?.value || 'ml_kem_768',
      pubKeyMode: pubKeyModeSelect?.value || 'raw',
      certDepth: parseInt(certDepthSlider?.value || 1, 10),
      keySlots: parseInt(keySlotsSlider?.value || 2, 10),
      rollbackBits: parseInt(rollbackSlider?.value || 128, 10),
      pufHelperBytes: parseInt(pufHelperSelect?.value || 512, 10),
      includeClassical: chkClassical?.checked || false,
      includeStatefulHash: chkStateful?.checked || false,
    };

    if (certDepthVal) certDepthVal.textContent = options.certDepth;
    if (keySlotsVal) keySlotsVal.textContent = `${options.keySlots}×`;
    if (rollbackVal) rollbackVal.textContent = `${options.rollbackBits} b`;

    const res = calculatePqcRotBudget(options);

    // Update Numerical Totals
    if (totalKbDisplay) totalKbDisplay.textContent = `${res.breakdown.totalKilobits} Kb`;
    if (totalBytesDisplay) totalBytesDisplay.textContent = `${res.breakdown.totalBytes.toLocaleString()} B`;
    if (totalBitsDisplay) totalBitsDisplay.textContent = `${res.breakdown.totalBits.toLocaleString()} bits`;

    // Update Proportional Stacked Bar
    const total = Math.max(1, res.breakdown.totalBytes);
    const pctRoot = ((res.breakdown.rootKeyBytes / total) * 100).toFixed(1);
    const pctCert = ((res.breakdown.certChainBytes / total) * 100).toFixed(1);
    const pctRoll = ((res.breakdown.rollbackBytes / total) * 100).toFixed(1);
    const pctPuf = ((res.breakdown.pufBytes / total) * 100).toFixed(1);

    if (barRootKey) {
      barRootKey.style.width = `${pctRoot}%`;
      barRootKey.title = T(`Root Keys: ${res.breakdown.rootKeyBytes} B (${pctRoot}%)`, `根金鑰: ${res.breakdown.rootKeyBytes} B (${pctRoot}%)`);
    }
    if (barCertChain) {
      barCertChain.style.width = `${pctCert}%`;
      barCertChain.title = T(`Cert Chain: ${res.breakdown.certChainBytes} B (${pctCert}%)`, `憑證鏈: ${res.breakdown.certChainBytes} B (${pctCert}%)`);
    }
    if (barRollback) {
      barRollback.style.width = `${pctRoll}%`;
      barRollback.title = T(`Rollback Fuses: ${res.breakdown.rollbackBytes} B (${pctRoll}%)`, `防降版熔絲: ${res.breakdown.rollbackBytes} B (${pctRoll}%)`);
    }
    if (barPuf) {
      barPuf.style.width = `${pctPuf}%`;
      barPuf.title = T(`PUF Helper Data: ${res.breakdown.pufBytes} B (${pctPuf}%)`, `PUF 輔助資料: ${res.breakdown.pufBytes} B (${pctPuf}%)`);
    }

    // Update Technology Feasibility Status
    if (efusePill && efuseDesc) {
      efusePill.className = res.feasibility.efuse.feasible ? 'tech-status ok' : 'tech-status overflow';
      efusePill.textContent = T(res.feasibility.efuse.statusEn, res.feasibility.efuse.statusZh);
      efuseDesc.textContent = T(res.feasibility.efuse.reasonEn, res.feasibility.efuse.reasonZh);
    }
    if (antifusePill && antifuseDesc) {
      antifusePill.className = res.feasibility.antifuse.feasible ? 'tech-status ok' : 'tech-status overflow';
      antifusePill.textContent = T(res.feasibility.antifuse.statusEn, res.feasibility.antifuse.statusZh);
      antifuseDesc.textContent = T(res.feasibility.antifuse.reasonEn, res.feasibility.antifuse.reasonZh);
    }
    if (mramPill && mramDesc) {
      mramPill.className = res.feasibility.mram.feasible ? 'tech-status ok' : 'tech-status overflow';
      mramPill.textContent = T(res.feasibility.mram.statusEn, res.feasibility.mram.statusZh);
      mramDesc.textContent = T(res.feasibility.mram.reasonEn, res.feasibility.mram.reasonZh);
    }

    // Silicon Area
    if (area28Display) area28Display.textContent = `${res.siliconArea.nm28.toLocaleString()} µm²`;
    if (area16Display) area16Display.textContent = `${res.siliconArea.nm16.toLocaleString()} µm²`;
    if (area5Display) area5Display.textContent = `${res.siliconArea.nm5.toLocaleString()} µm²`;

    // Architect Verdict
    if (verdictBanner) {
      if (!res.feasibility.efuse.feasible) {
        verdictBanner.innerHTML = T(
          `<strong>Illustrative Capacity Estimate:</strong> The selected ${res.breakdown.totalKilobits} Kb budget is <strong>${(res.breakdown.totalBits / 512).toFixed(0)}× the 512-bit reference</strong> and exceeds this model's 4 Kb eFuse allocation. This is not a universal eFuse limit or a technology ranking. Compare named macro capacities, programming conditions, update policies, and implementation evidence.`,
          `<strong>教學模型容量估算：</strong> 目前預算 ${res.breakdown.totalKilobits} Kb 為 <strong>512-bit 參考值的 ${(res.breakdown.totalBits / 512).toFixed(0)} 倍</strong>，超出本模型的 4 Kb eFuse 配置。這不是所有 eFuse 的容量上限或技術排名；應比較具名巨集容量、編程條件、更新政策與實作證據。`
        );
      } else {
        verdictBanner.innerHTML = T(
          `<strong>Illustrative Capacity Estimate:</strong> The selected ${res.breakdown.totalKilobits} Kb budget fits this model's 4 Kb eFuse allocation. Capacity alone does not establish cryptographic agility, attack resistance, or product availability; verify the named macro and system update architecture.`,
          `<strong>教學模型容量估算：</strong> 目前預算 ${res.breakdown.totalKilobits} Kb 在本模型的 4 Kb eFuse 配置內。容量不能單獨判定密碼演算法更新能力、攻擊抵抗力或產品供應狀態；仍須確認具名巨集與系統更新架構。`
        );
      }
    }
  }

  // Handle Preset Switching
  presetSelect?.addEventListener('change', (e) => {
    const preset = PQC_PRESETS[e.target.value];
    if (!preset) return;
    if (dsaSelect) dsaSelect.value = preset.dsaId;
    if (kemSelect) kemSelect.value = preset.kemId || 'none';
    if (pubKeyModeSelect) pubKeyModeSelect.value = preset.pubKeyMode;
    if (certDepthSlider) certDepthSlider.value = preset.certDepth;
    if (keySlotsSlider) keySlotsSlider.value = preset.keySlots;
    if (rollbackSlider) rollbackSlider.value = preset.rollbackBits;
    if (pufHelperSelect) pufHelperSelect.value = preset.pufHelperBytes;
    if (chkClassical) chkClassical.checked = Boolean(preset.includeClassical);
    if (chkStateful) chkStateful.checked = Boolean(preset.includeStatefulHash);
    update();
  });

  // Attach Input Listeners
  [
    dsaSelect,
    kemSelect,
    pubKeyModeSelect,
    certDepthSlider,
    keySlotsSlider,
    rollbackSlider,
    pufHelperSelect,
    chkClassical,
    chkStateful,
  ].forEach((el) => el?.addEventListener('input', update));

  // Language Change Listener
  window.addEventListener('hub:language-change', update);

  // Initial Calculation
  update();
}

// Auto-boot if container is already in DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPqcRotCalculator());
  } else {
    initPqcRotCalculator();
  }
}
