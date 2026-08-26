/**
 * @fileoverview Silicon IP Engineering Interactive Suite.
 * Provides real-time physics and architectural calculators:
 * 1. Arrhenius FIT Rate & Lifetime Extrapolator
 * 2. PQC Memory Footprint & Latency Tradeoff Simulator
 * 3. UCIe 2.0 D2D Flit Security & Pipeline Latency Calculator
 * 
 * Conforms to Google JavaScript Style Guide.
 * @author Sam Huang Portfolio / NVM Knowledge Hub
 */

'use strict';

/**
 * Physical and cryptographic constant definitions.
 */
const BOLTZMANN_EV = 8.617333262e-5; // Boltzmann constant in eV/K
const SECONDS_PER_YEAR = 31536000;
const HOURS_PER_YEAR = 8760;

/**
 * ============================================================================
 * 1. Arrhenius FIT Rate & Lifetime Extrapolator Model
 * ============================================================================
 */
export class ArrheniusCalculator {
  /**
   * Initializes the Arrhenius Calculator model.
   * @param {Object} [config] Optional default configuration.
   */
  constructor(config = {}) {
    this.voltageAccelerationGamma = config.gamma ?? 3.5; // V^-1
  }

  /**
   * Calculates temperature acceleration factor (AFT).
   * Formula: AFT = exp[(Ea / kB) * (1/(Tuse + 273.15) - 1/(Tstress + 273.15))]
   * @param {number} tStress Stress temperature in Celsius.
   * @param {number} tUse Operating/Use temperature in Celsius.
   * @param {number} ea Activation energy in eV (e.g. 0.7 - 1.1 eV).
   * @return {number} Temperature acceleration factor.
   */
  calcTempAcceleration(tStress, tUse, ea) {
    const tStressK = tStress + 273.15;
    const tUseK = tUse + 273.15;
    const exponent = (ea / BOLTZMANN_EV) * ((1 / tUseK) - (1 / tStressK));
    return Math.exp(exponent);
  }

  /**
   * Calculates voltage acceleration factor (AFV).
   * Formula: AFV = exp[gamma * (Vstress - Vuse)]
   * @param {number} vStress Stress voltage in Volts.
   * @param {number} vUse Operating voltage in Volts.
   * @return {number} Voltage acceleration factor.
   */
  calcVoltageAcceleration(vStress, vUse) {
    const deltaV = Math.max(0, vStress - vUse);
    return Math.exp(this.voltageAccelerationGamma * deltaV);
  }

  /**
   * Returns chi-square statistic for confidence level and failure count.
   * Standard lookup for 60% and 90% confidence limits.
   * @param {number} confidenceLevel 0.60 or 0.90.
   * @param {number} failures Number of test failures (typically 0 for zero-defect).
   * @return {number} Chi-square value.
   */
  getChiSquare(confidenceLevel, failures = 0) {
    // Exact chi-squared distribution values for 2*(f+1) degrees of freedom
    const table60 = [1.83258, 4.0449, 6.2109, 8.3512];
    const table90 = [4.60517, 7.7794, 10.6446, 13.3616];

    const idx = Math.min(Math.max(0, Math.floor(failures)), table60.length - 1);
    return confidenceLevel >= 0.85 ? table90[idx] : table60[idx];
  }

  /**
   * Calculates full Arrhenius reliability metrics.
   * @param {Object} params Input parameters.
   * @param {number} params.tStress Stress temperature (°C).
   * @param {number} params.tUse Operating temperature (°C).
   * @param {number} params.vStress Stress voltage (V).
   * @param {number} params.vUse Operating voltage (V).
   * @param {number} params.ea Activation energy (eV).
   * @param {number} params.stressHours Duration of stress test in hours.
   * @param {number} params.sampleSize Total test sample size (e.g. 231 units).
   * @param {number} [params.failures=0] Number of observed failures.
   * @param {number} [params.confidence=0.60] Confidence level (0.60 or 0.90).
   * @return {Object} Evaluated results.
   */
  evaluate(params) {
    const {
      tStress,
      tUse,
      vStress,
      vUse,
      ea,
      stressHours,
      sampleSize,
      failures = 0,
      confidence = 0.60
    } = params;

    const afTemp = this.calcTempAcceleration(tStress, tUse, ea);
    const afVolt = this.calcVoltageAcceleration(vStress, vUse);
    const afTotal = afTemp * afVolt;

    // Total equivalent device hours accumulated at Tuse & Vuse
    const equivHours = sampleSize * stressHours * afTotal;

    // Chi-Square statistic
    const chi2 = this.getChiSquare(confidence, failures);

    // Failure rate lambda (failures per hour)
    const lambda = chi2 / (2 * equivHours);

    // FIT Rate (Failures in Time per 10^9 device-hours)
    const fitRate = lambda * 1e9;

    // Mean Time to Failure / Projected Retention Lifetime in years
    const projectedYears = (stressHours * afTotal) / HOURS_PER_YEAR;

    // Reliability tier qualification rating
    let grade = 'COMMERCIAL';
    let gradeDescriptionZh = '消費級可靠度 (FIT > 50)';
    let gradeDescriptionEn = 'Commercial Grade (FIT > 50)';
    let statusClass = 'status-warn';

    if (fitRate < 1.0) {
      grade = 'AEC-Q100 GRADE 0 / ASIL-D';
      gradeDescriptionZh = '車規最高等級 Grade 0 (< 1 FIT / 15+ 年)';
      gradeDescriptionEn = 'Automotive Grade 0 (< 1 FIT / 15+ Yrs)';
      statusClass = 'status-pass';
    } else if (fitRate < 10.0) {
      grade = 'AEC-Q100 GRADE 1';
      gradeDescriptionZh = '車規等級 Grade 1 (< 10 FIT)';
      gradeDescriptionEn = 'Automotive Grade 1 (< 10 FIT)';
      statusClass = 'status-pass';
    } else if (fitRate < 50.0) {
      grade = 'INDUSTRIAL GRADE';
      gradeDescriptionZh = '工業級可靠度 (< 50 FIT)';
      gradeDescriptionEn = 'Industrial Grade (< 50 FIT)';
      statusClass = 'status-info';
    }

    return {
      afTemp,
      afVolt,
      afTotal,
      equivHours,
      equivMillionHours: equivHours / 1e6,
      lambda,
      fitRate,
      projectedYears,
      grade,
      gradeDescriptionZh,
      gradeDescriptionEn,
      statusClass,
      chi2
    };
  }
}

/**
 * ============================================================================
 * 2. PQC Memory Footprint & Latency Tradeoff Simulator Model
 * ============================================================================
 */
export class PqcTradeoffSimulator {
  static NODE_DENSITY = {
    'N16': 0.220,
    'N7': 0.130,
    'N5': 0.080,
    'N3': 0.052,
    'N2': 0.035
  };

  static ALGORITHMS = {
    'AES-256': {
      name: 'Classical AES-256',
      nistLevel: 'Classical 256-bit (Quantum ~128b)',
      publicKeyBytes: 0,
      privateKeyBytes: 32,
      ciphertextBytes: 16,
      hybridSeedBytes: 32,
      cyclesKeyGen: 14,
      cyclesEncaps: 14,
      cyclesDecaps: 14,
      baseEnergyPj: 1.2
    },
    'ML-KEM-512': {
      name: 'ML-KEM-512 (Kyber-512)',
      nistLevel: 'NIST Level 1 (AES-128 Equivalent)',
      publicKeyBytes: 800,
      privateKeyBytes: 1632,
      ciphertextBytes: 768,
      hybridSeedBytes: 32,
      cyclesKeyGen: 3400,
      cyclesEncaps: 4100,
      cyclesDecaps: 5200,
      baseEnergyPj: 145.0
    },
    'ML-KEM-768': {
      name: 'ML-KEM-768 (Kyber-768)',
      nistLevel: 'NIST Level 3 (AES-192 Equivalent - Primary)',
      publicKeyBytes: 1184,
      privateKeyBytes: 2400,
      ciphertextBytes: 1088,
      hybridSeedBytes: 32,
      cyclesKeyGen: 6100,
      cyclesEncaps: 7300,
      cyclesDecaps: 8900,
      baseEnergyPj: 260.0
    },
    'ML-KEM-1024': {
      name: 'ML-KEM-1024 (Kyber-1024)',
      nistLevel: 'NIST Level 5 (AES-256 Equivalent - High Sec)',
      publicKeyBytes: 1568,
      privateKeyBytes: 3168,
      ciphertextBytes: 1568,
      hybridSeedBytes: 32,
      cyclesKeyGen: 9300,
      cyclesEncaps: 11200,
      cyclesDecaps: 13250,
      baseEnergyPj: 410.0
    }
  };

  evaluate(params) {
    const {
      algorithm = 'ML-KEM-768',
      node = 'N5',
      strategy = 'hybrid',
      clockMhz = 500,
      operation = 'decaps'
    } = params;

    const algo = PqcTradeoffSimulator.ALGORITHMS[algorithm] || PqcTradeoffSimulator.ALGORITHMS['ML-KEM-768'];
    const bitcellAreaPerBit = PqcTradeoffSimulator.NODE_DENSITY[node] || 0.080;

    const rawStoredBytes = algo.privateKeyBytes;
    const hybridStoredBytes = algo.hybridSeedBytes;
    const effectiveBytes = strategy === 'hybrid' ? hybridStoredBytes : rawStoredBytes;
    const effectiveBits = effectiveBytes * 8;

    const physicalAreaUm2 = effectiveBits * bitcellAreaPerBit;
    const rawAreaUm2 = (rawStoredBytes * 8) * bitcellAreaPerBit;
    const hybridAreaUm2 = (hybridStoredBytes * 8) * bitcellAreaPerBit;
    const areaSavingsPercent = rawStoredBytes > 0
      ? ((1 - (hybridStoredBytes / rawStoredBytes)) * 100)
      : 0;

    let cycles = algo.cyclesDecaps;
    if (operation === 'encaps') cycles = algo.cyclesEncaps;
    if (operation === 'keygen') cycles = algo.cyclesKeyGen;

    const latencyUs = (cycles / (clockMhz * 1e6)) * 1e6;
    const throughputOpsSec = 1e6 / latencyUs;
    const dynamicEnergyPj = algo.baseEnergyPj * (500 / Math.max(100, clockMhz));

    return {
      algorithm: algo.name,
      nistLevel: algo.nistLevel,
      node,
      strategy,
      clockMhz,
      operation,
      effectiveBytes,
      effectiveBits,
      physicalAreaUm2,
      rawAreaUm2,
      hybridAreaUm2,
      areaSavingsPercent,
      cycles,
      latencyUs,
      throughputOpsSec,
      dynamicEnergyPj
    };
  }

  compareAll(node = 'N5', strategy = 'hybrid', clockMhz = 500) {
    return Object.keys(PqcTradeoffSimulator.ALGORITHMS).map(algKey => {
      return this.evaluate({
        algorithm: algKey,
        node,
        strategy,
        clockMhz,
        operation: 'decaps'
      });
    });
  }
}

/**
 * ============================================================================
 * 3. UCIe 2.0 D2D Flit Security & Pipeline Latency Calculator Model
 * ============================================================================
 */
export class UcieFlitCalculator {
  static SECURITY_MODES = {
    'gcm256': {
      name: 'AES-GCM-256 Full MAC (128-bit)',
      macBytes: 16,
      headerBytes: 8,
      crcBytes: 8,
      descriptionZh: '全強度 AES-GCM-256 認證加密 (16B Auth Tag)',
      descriptionEn: 'Full AES-GCM-256 Authenticated Encryption (16B Tag)'
    },
    'ctr_trunc': {
      name: 'AES-CTR + Truncated MAC (64-bit)',
      macBytes: 8,
      headerBytes: 8,
      crcBytes: 8,
      descriptionZh: '低延遲 AES-CTR + 64-bit 截斷 MAC (8B Tag)',
      descriptionEn: 'Low-latency AES-CTR + 64-bit Truncated MAC (8B Tag)'
    },
    'passthrough': {
      name: 'Plaintext Passthrough (No MAC)',
      macBytes: 0,
      headerBytes: 8,
      crcBytes: 8,
      descriptionZh: '無加密直通模式 (純 16B 協定開銷)',
      descriptionEn: 'Plaintext Mode (16B Protocol Overhead Only)'
    },
    'pqc_hybrid': {
      name: 'Post-Quantum Hybrid Stream IDE',
      macBytes: 32,
      headerBytes: 8,
      crcBytes: 8,
      descriptionZh: '後量子混合串流驗證 (32B Hybrid Tag)',
      descriptionEn: 'Post-Quantum Hybrid Stream Auth (32B Tag)'
    }
  };

  evaluate(params) {
    const {
      lanes = 16,
      dataRateGbps = 32,
      flitSizeBytes = 256,
      secMode = 'gcm256',
      coreClockGhz = 1.5,
      pipelineStages = 3
    } = params;

    const mode = UcieFlitCalculator.SECURITY_MODES[secMode] || UcieFlitCalculator.SECURITY_MODES['gcm256'];

    const rawBandwidthGbps = lanes * dataRateGbps;
    const rawBandwidthGBs = rawBandwidthGbps / 8;
    const rawBandwidthTbps = rawBandwidthGbps / 1000;

    const flitBits = flitSizeBytes * 8;
    const flitDurationNs = flitBits / rawBandwidthGbps;

    const totalOverheadBytes = mode.headerBytes + mode.crcBytes + mode.macBytes;
    const netPayloadBytes = Math.max(1, flitSizeBytes - totalOverheadBytes);
    const securityEfficiencyPercent = (netPayloadBytes / flitSizeBytes) * 100;
    const overheadRatioPercent = 100 - securityEfficiencyPercent;

    const effectiveGoodputGBs = rawBandwidthGBs * (netPayloadBytes / flitSizeBytes);
    const effectiveGoodputTbps = (effectiveGoodputGBs * 8) / 1000;

    const wireDelayNs = 0.20;
    const macPipelineLatencyNs = (pipelineStages / coreClockGhz) + wireDelayNs;

    const d2dPhyLatencyNs = 1.60;
    const totalLatencyNs = macPipelineLatencyNs + flitDurationNs + d2dPhyLatencyNs;

    const phyEnergyPjBit = lanes >= 32 ? 0.30 : 0.45;
    const cryptoEnergyPjBit = secMode === 'passthrough' ? 0.02 : 0.15;
    const totalEnergyPjBit = phyEnergyPjBit + cryptoEnergyPjBit;
    const totalPowerMilliwatts = totalEnergyPjBit * rawBandwidthGbps;

    return {
      lanes,
      dataRateGbps,
      flitSizeBytes,
      secMode,
      modeName: mode.name,
      modeDescZh: mode.descriptionZh,
      modeDescEn: mode.descriptionEn,
      rawBandwidthGbps,
      rawBandwidthGBs,
      rawBandwidthTbps,
      flitDurationNs,
      netPayloadBytes,
      totalOverheadBytes,
      securityEfficiencyPercent,
      overheadRatioPercent,
      effectiveGoodputGBs,
      effectiveGoodputTbps,
      macPipelineLatencyNs,
      d2dPhyLatencyNs,
      totalLatencyNs,
      totalEnergyPjBit,
      totalPowerMilliwatts
    };
  }
}

/**
 * ============================================================================
 * UI Binder & Interactive Orchestrator
 * ============================================================================
 */
export class SiliconEngineeringSuiteUI {
  static init() {
    this.arrhenius = new ArrheniusCalculator();
    this.pqc = new PqcTradeoffSimulator();
    this.ucie = new UcieFlitCalculator();

    this.bindArrheniusUI();
    this.bindPqcUI();
    this.bindUcieUI();
  }

  static bindArrheniusUI() {
    const tStressSlider = document.getElementById('arrheniusStressTemp');
    const vStressSlider = document.getElementById('arrheniusStressVolt');
    const tUseSlider = document.getElementById('arrheniusUseTemp');
    const vUseSlider = document.getElementById('arrheniusUseVolt');
    const eaSelect = document.getElementById('arrheniusEa');
    const hoursInput = document.getElementById('arrheniusHours');
    const samplesInput = document.getElementById('arrheniusSamples');

    if (!tStressSlider || !vStressSlider) return;

    const update = () => {
      const tStress = Number(tStressSlider.value);
      const vStress = Number(vStressSlider.value) / 100;
      const tUse = Number(tUseSlider ? tUseSlider.value : 55);
      const vUse = Number(vUseSlider ? vUseSlider.value : 75) / 100;
      const ea = Number(eaSelect ? eaSelect.value : 1.1);
      const stressHours = Number(hoursInput ? hoursInput.value : 1000);
      const sampleSize = Number(samplesInput ? samplesInput.value : 231);

      const result = this.arrhenius.evaluate({
        tStress,
        tUse,
        vStress,
        vUse,
        ea,
        stressHours,
        sampleSize
      });

      this.setText('arrheniusStressTempDisp', `${tStress} °C`);
      this.setText('arrheniusStressVoltDisp', `${vStress.toFixed(2)} V`);
      this.setText('arrheniusUseTempDisp', `${tUse} °C`);
      this.setText('arrheniusUseVoltDisp', `${vUse.toFixed(2)} V`);

      this.setText('arrheniusAfTotalDisp', `${result.afTotal > 1e6 ? result.afTotal.toExponential(2) : result.afTotal.toFixed(0)}×`);
      this.setText('arrheniusFitDisp', result.fitRate < 0.01 ? '< 0.01 FIT' : `${result.fitRate.toFixed(2)} FIT`);
      this.setText('arrheniusLifetimeDisp', `${result.projectedYears > 100 ? '> 100' : result.projectedYears.toFixed(1)} Yrs`);
      this.setText('arrheniusEquivHoursDisp', `${result.equivMillionHours.toFixed(1)}M Dev-Hrs`);

      const gradeBadge = document.getElementById('arrheniusGradeBadge');
      if (gradeBadge) {
        gradeBadge.textContent = result.grade;
        gradeBadge.className = `chip-badge ${result.statusClass}`;
      }

      const fitBar = document.getElementById('arrheniusFitMeterBar');
      if (fitBar) {
        const healthPercent = Math.max(5, Math.min(100, 100 - Math.log10(Math.max(0.01, result.fitRate)) * 30));
        fitBar.style.width = `${healthPercent}%`;
      }
    };

    [tStressSlider, vStressSlider, tUseSlider, vUseSlider, eaSelect, hoursInput, samplesInput].forEach(elem => {
      if (elem) {
        elem.addEventListener('input', update);
        elem.addEventListener('change', update);
      }
    });

    update();
  }

  static bindPqcUI() {
    const algoSelect = document.getElementById('pqcAlgorithmSelect');
    const nodeSelect = document.getElementById('pqcNodeSelect');
    const stratButtons = document.querySelectorAll('[data-pqc-strategy]');
    const clockSlider = document.getElementById('pqcClockSlider');

    if (!algoSelect && stratButtons.length === 0) return;

    let activeStrategy = 'hybrid';

    const update = () => {
      const algorithm = algoSelect ? algoSelect.value : 'ML-KEM-768';
      const node = nodeSelect ? nodeSelect.value : 'N5';
      const clockMhz = clockSlider ? Number(clockSlider.value) : 500;

      const result = this.pqc.evaluate({
        algorithm,
        node,
        strategy: activeStrategy,
        clockMhz,
        operation: 'decaps'
      });

      this.setText('pqcClockDisp', `${clockMhz} MHz`);
      this.setText('pqcFootprintBytesDisp', `${result.effectiveBytes} Bytes (${(result.effectiveBits / 1024).toFixed(1)} Kb)`);
      this.setText('pqcAreaDisp', `${result.physicalAreaUm2.toFixed(1)} µm²`);
      this.setText('pqcLatencyDisp', `${result.latencyUs.toFixed(2)} µs (${result.cycles} cycles)`);
      this.setText('pqcSavingsDisp', `${result.areaSavingsPercent.toFixed(1)}%`);
      this.setText('pqcThroughputDisp', `${result.throughputOpsSec > 1e4 ? (result.throughputOpsSec/1e3).toFixed(1) + 'k' : result.throughputOpsSec.toFixed(0)} ops/s`);

      const compList = this.pqc.compareAll(node, activeStrategy, clockMhz);
      compList.forEach(item => {
        const rowKey = item.algorithm.replace(/[^a-zA-Z0-9]/g, '_');
        this.setText(`pqc_row_${rowKey}_area`, `${item.physicalAreaUm2.toFixed(1)} µm²`);
        this.setText(`pqc_row_${rowKey}_lat`, `${item.latencyUs.toFixed(2)} µs`);
      });
    };

    stratButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        stratButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeStrategy = btn.dataset.pqcStrategy;
        update();
      });
    });

    [algoSelect, nodeSelect, clockSlider].forEach(elem => {
      if (elem) {
        elem.addEventListener('input', update);
        elem.addEventListener('change', update);
      }
    });

    update();
  }

  static bindUcieUI() {
    const laneButtons = document.querySelectorAll('[data-ucie-lanes]');
    const rateButtons = document.querySelectorAll('[data-ucie-rate]');
    const secSelect = document.getElementById('ucieSecModeSelect');
    const flitSelect = document.getElementById('ucieFlitSelect');
    const clockSlider = document.getElementById('ucieClockSlider');
    const pipeSlider = document.getElementById('uciePipeSlider');

    if (laneButtons.length === 0 && !secSelect) return;

    let activeLanes = 16;
    let activeRate = 32;

    const update = () => {
      const flitSizeBytes = flitSelect ? Number(flitSelect.value) : 256;
      const secMode = secSelect ? secSelect.value : 'gcm256';
      const coreClockGhz = clockSlider ? Number(clockSlider.value) / 1000 : 1.5;
      const pipelineStages = pipeSlider ? Number(pipeSlider.value) : 3;

      const result = this.ucie.evaluate({
        lanes: activeLanes,
        dataRateGbps: activeRate,
        flitSizeBytes,
        secMode,
        coreClockGhz,
        pipelineStages
      });

      this.setText('ucieClockDisp', `${(coreClockGhz * 1000).toFixed(0)} MHz`);
      this.setText('uciePipeDisp', `${pipelineStages} Stages`);
      this.setText('ucieRawBwDisp', `${result.rawBandwidthGBs.toFixed(1)} GB/s (${result.rawBandwidthTbps.toFixed(2)} Tbps)`);
      this.setText('ucieGoodputDisp', `${result.effectiveGoodputGBs.toFixed(1)} GB/s (${result.effectiveGoodputTbps.toFixed(2)} Tbps)`);
      this.setText('ucieEfficiencyDisp', `${result.securityEfficiencyPercent.toFixed(1)}%`);
      this.setText('uciePipeLatencyDisp', `${result.macPipelineLatencyNs.toFixed(2)} ns`);
      this.setText('ucieTotalLatencyDisp', `${result.totalLatencyNs.toFixed(2)} ns`);
      this.setText('uciePowerDisp', `${(result.totalPowerMilliwatts / 1000).toFixed(2)} W (${result.totalEnergyPjBit.toFixed(2)} pJ/b)`);

      const latencyBadge = document.getElementById('ucieLatencyStatusBadge');
      if (latencyBadge) {
        if (result.macPipelineLatencyNs <= 2.50) {
          latencyBadge.textContent = '< 2.5ns LINE-RATE MET';
          latencyBadge.className = 'chip-badge status-pass';
        } else {
          latencyBadge.textContent = 'SUB-OPTIMAL PIPELINE';
          latencyBadge.className = 'chip-badge status-warn';
        }
      }
    };

    laneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        laneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLanes = Number(btn.dataset.ucieLanes);
        update();
      });
    });

    rateButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        rateButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeRate = Number(btn.dataset.ucieRate);
        update();
      });
    });

    [secSelect, flitSelect, clockSlider, pipeSlider].forEach(elem => {
      if (elem) {
        elem.addEventListener('input', update);
        elem.addEventListener('change', update);
      }
    });

    update();
  }

  static setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Global browser attachments
if (typeof window !== 'undefined') {
  window.ArrheniusCalculator = ArrheniusCalculator;
  window.PqcTradeoffSimulator = PqcTradeoffSimulator;
  window.UcieFlitCalculator = UcieFlitCalculator;
  window.SiliconEngineeringSuiteUI = SiliconEngineeringSuiteUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SiliconEngineeringSuiteUI.init());
  } else {
    SiliconEngineeringSuiteUI.init();
  }
}
