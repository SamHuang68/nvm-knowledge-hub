/**
 * cim-efficiency-calculator.js — AI Compute-in-Memory (CIM / IMC) Macro Efficiency & Mixed-Signal Explorer
 * First-principles electrical and mixed-signal modeling for analog NVM CIM vs digital MAC architectures.
 *
 * Mathematical Foundations:
 * 1. Vector-Matrix Multiply: I_j = \sum_{i=1}^M V_i \cdot G_{ij} (Ohm's Law + KCL)
 * 2. Peak MAC Throughput: Operations = 2 * N * M (Multiply + Accumulate)
 * 3. ADC Energy Scaling: E_ADC \propto 2^{B_ADC} (Exponential Walden FOM penalty)
 * 4. Worst-case Line IR-Drop: \Delta V_IR \approx 0.5 * N^2 * I_cell * R_wire
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEC/ISO 26262, IEEE TCAD / JSSC CIM benchmarks
 */

export const CIM_DEVICE_PROFILES = Object.freeze({
  reram: {
    id: "reram",
    nameEn: "ReRAM / OxRAM (Filamentary)",
    nameZh: "ReRAM / 阻變記憶體 (氧化物微絲)",
    cellConductanceUS: 25.0, // 25 uS (~40 kOhm)
    cellBits: 4,             // MLC capable
    readVoltage: 0.3,        // 0.3 V non-disturb
    wireResistanceOhm: 1.8,  // Metal wire resistance per cell
    retentionGrade: "10 Yrs @ 85°C",
    driftRate: "Moderate (0.05 dec/decade)",
  },
  mram: {
    id: "mram",
    nameEn: "STT-MRAM (Tunnel Junction)",
    nameZh: "STT-MRAM (自旋穿隧接面)",
    cellConductanceUS: 100.0, // 100 uS (~10 kOhm)
    cellBits: 1,              // Binary / Low TMR window
    readVoltage: 0.2,         // 0.2 V low bias
    wireResistanceOhm: 1.5,
    retentionGrade: ">10 Yrs @ 125°C",
    driftRate: "Negligible (<0.001 dec/decade)",
  },
  nor_flash: {
    id: "nor_flash",
    nameEn: "Embedded NOR Flash (Floating Gate)",
    nameZh: "嵌入式 NOR Flash (浮閘電荷)",
    cellConductanceUS: 15.0,  // 15 uS (~66.7 kOhm)
    cellBits: 4,              // High dynamic range MLC
    readVoltage: 0.5,         // 0.5 V
    wireResistanceOhm: 2.2,
    retentionGrade: ">10 Yrs @ 150°C",
    driftRate: "Low (charge trap / leakage)",
  },
  sram_cim: {
    id: "sram_cim",
    nameEn: "6T/8T SRAM CIM (Charge / Digital domain)",
    nameZh: "SRAM 存算一體 (電荷/數位域 6T/8T)",
    cellConductanceUS: 40.0,  // Equivalent switch resistance
    cellBits: 1,              // Native binary cell
    readVoltage: 0.75,        // VDD core
    wireResistanceOhm: 1.2,
    retentionGrade: "Volatile (0s unpowered)",
    driftRate: "None (digital latch)",
  },
});

export const ADC_ENERGY_TABLE = Object.freeze({
  4: 0.06,  // 0.06 pJ per conversion (ultra-low overhead)
  6: 0.28,  // 0.28 pJ per conversion (balanced SAR ADC)
  8: 1.35,  // 1.35 pJ per conversion (high precision Flash/SAR, 2^B penalty)
});

/**
 * Calculates electrical performance, power breakdown, and energy efficiency for a CIM macro.
 * @param {Object} params
 * @param {number} params.arraySize - Square array dimension (e.g. 64, 128, 256, 512)
 * @param {string} params.deviceKey - Key in CIM_DEVICE_PROFILES
 * @param {number} params.adcBits - ADC resolution (4, 6, 8)
 * @param {number} params.freqMHz - Operating clock frequency in MHz (default 100)
 * @returns {Object} Comprehensive calculation results
 */
export function calculateCimMetrics({
  arraySize = 256,
  deviceKey = "reram",
  adcBits = 6,
  freqMHz = 100,
}) {
  const profile = CIM_DEVICE_PROFILES[deviceKey] || CIM_DEVICE_PROFILES.reram;
  const N = Math.max(32, Math.min(1024, Number(arraySize) || 256));
  const M = N; // Square crossbar
  const B_adc = [4, 6, 8].includes(Number(adcBits)) ? Number(adcBits) : 6;
  const f_clk = Math.max(10, Math.min(1000, Number(freqMHz) || 100)) * 1e6; // Hz

  // 1. Peak Operations per cycle: 2 * N * M (1 MAC = 2 OPs)
  const opsPerCycle = 2 * N * M;
  const throughputTops = (opsPerCycle * f_clk) / 1e12; // Tera-operations per second

  // 2. Analog Array Electrical Dissipation
  // Average conductance per cell with 50% activation sparsity
  const V_read = profile.readVoltage;
  const G_cell = profile.cellConductanceUS * 1e-6; // Siemens
  const activeFraction = 0.5; // Average input activation density
  const I_cell_avg = V_read * G_cell * activeFraction;
  const I_column_avg = N * I_cell_avg; // Total column current summation
  const E_array_cycle = M * (V_read * I_column_avg * (1 / f_clk)); // Joules per cycle
  const P_array_watts = E_array_cycle * f_clk;

  // 3. Peripheral ADC / Mixed-Signal Power
  // Each column requires an ADC conversion per cycle
  const E_adc_single = (ADC_ENERGY_TABLE[B_adc] || 0.28) * 1e-12; // Joules per conversion
  const E_adc_cycle = M * E_adc_single;
  const P_adc_watts = E_adc_cycle * f_clk;

  // 4. Digital I/O, Shift-Add, and Clock Distribution Overhead (~15% of mixed-signal)
  const P_digital_watts = (P_array_watts + P_adc_watts) * 0.15;
  const P_total_watts = P_array_watts + P_adc_watts + P_digital_watts;

  // 5. Energy Efficiency Metrics (TOPS / Watt)
  const coreArrayTopsPerWatt = (opsPerCycle / (E_array_cycle * 1e12));
  const fullMacroTopsPerWatt = (throughputTops / P_total_watts);
  const adcPowerFraction = (P_adc_watts / P_total_watts) * 100; // %

  // 6. Worst-Case Line IR-Drop Analysis
  // Cumulative line resistance down the column: R_total = N * R_wire
  // In worst-case (all cells active): \Delta V \approx 0.5 * N^2 * I_cell_max * R_wire
  const I_cell_max = V_read * G_cell;
  const R_wire = profile.wireResistanceOhm;
  const worstCaseDropV = 0.5 * Math.pow(N, 2) * I_cell_max * R_wire;
  const irDropPercentage = Math.min(100, (worstCaseDropV / V_read) * 100);

  return {
    arraySize: N,
    deviceKey: profile.id,
    deviceNameEn: profile.nameEn,
    deviceNameZh: profile.nameZh,
    adcBits: B_adc,
    freqMHz: f_clk / 1e6,
    throughputTops,
    coreArrayTopsPerWatt,
    fullMacroTopsPerWatt,
    adcPowerFraction,
    irDropPercentage,
    powerBreakdownWatts: {
      array: P_array_watts,
      adc: P_adc_watts,
      digital: P_digital_watts,
      total: P_total_watts,
    },
    retentionGrade: profile.retentionGrade,
    driftRate: profile.driftRate,
  };
}

/**
 * Initializes interactive DOM listeners and visual rendering for the CIM Explorer widget.
 */
export function initCimEfficiencyCalculator() {
  const container = document.getElementById("cim-calculator-widget");
  if (!container) return;

  const arraySizeSelect = document.getElementById("cim-array-size");
  const deviceSelect = document.getElementById("cim-device-select");
  const adcSelect = document.getElementById("cim-adc-bits");
  const freqSlider = document.getElementById("cim-freq-slider");
  const freqValElem = document.getElementById("cim-freq-val");

  // Output telemetry elements
  const macroTopsPerWattElem = document.getElementById("cim-macro-eff-val");
  const coreTopsPerWattElem = document.getElementById("cim-core-eff-val");
  const adcOverheadElem = document.getElementById("cim-adc-overhead-val");
  const irDropElem = document.getElementById("cim-ir-drop-val");
  const throughputElem = document.getElementById("cim-throughput-val");
  const insightElem = document.getElementById("cim-verdict-insight");

  // Visual breakdown bars
  const barArray = document.getElementById("cim-bar-array");
  const barAdc = document.getElementById("cim-bar-adc");
  const barDigital = document.getElementById("cim-bar-digital");

  const T = (en, zh) => (window.HubLanguage?.get() || document.documentElement.lang).startsWith("zh") ? zh : en;

  function update() {
    if (!arraySizeSelect || !deviceSelect || !adcSelect) return;

    const arraySize = parseInt(arraySizeSelect.value, 10) || 256;
    const deviceKey = deviceSelect.value || "reram";
    const adcBits = parseInt(adcSelect.value, 10) || 6;
    const freqMHz = freqSlider ? parseInt(freqSlider.value, 10) : 100;

    if (freqValElem && freqSlider) {
      freqValElem.textContent = `${freqSlider.value} MHz`;
    }

    const res = calculateCimMetrics({ arraySize, deviceKey, adcBits, freqMHz });

    if (macroTopsPerWattElem) {
      macroTopsPerWattElem.textContent = `${res.fullMacroTopsPerWatt.toFixed(1)} TOPS/W`;
    }
    if (coreTopsPerWattElem) {
      coreTopsPerWattElem.textContent = `${res.coreArrayTopsPerWatt.toFixed(1)} TOPS/W`;
    }
    if (adcOverheadElem) {
      adcOverheadElem.textContent = `${res.adcPowerFraction.toFixed(1)}%`;
      adcOverheadElem.style.color = res.adcPowerFraction > 65 ? "#dc2626" : (res.adcPowerFraction > 40 ? "#d97706" : "#16a34a");
    }
    if (irDropElem) {
      irDropElem.textContent = `${res.irDropPercentage.toFixed(1)}%`;
      irDropElem.style.color = res.irDropPercentage > 15 ? "#dc2626" : (res.irDropPercentage > 8 ? "#d97706" : "#16a34a");
    }
    if (throughputElem) {
      throughputElem.textContent = `${res.throughputTops.toFixed(2)} TOPS`;
    }

    // Update power breakdown visual bars
    const totalP = res.powerBreakdownWatts.total;
    if (totalP > 0 && barArray && barAdc && barDigital) {
      const pArray = (res.powerBreakdownWatts.array / totalP) * 100;
      const pAdc = (res.powerBreakdownWatts.adc / totalP) * 100;
      const pDigital = (res.powerBreakdownWatts.digital / totalP) * 100;

      barArray.style.width = `${pArray.toFixed(1)}%`;
      barAdc.style.width = `${pAdc.toFixed(1)}%`;
      barDigital.style.width = `${pDigital.toFixed(1)}%`;

      barArray.title = `${T("Core Array", "核心陣列")}: ${pArray.toFixed(1)}%`;
      barAdc.title = `${T("ADC Converters", "ADC 轉換器")}: ${pAdc.toFixed(1)}%`;
      barDigital.title = `${T("Digital Overhead", "數位開銷")}: ${pDigital.toFixed(1)}%`;
    }

    // Dynamic Architectural Insight
    if (insightElem) {
      let insightZh = "";
      let insightEn = "";

      if (res.adcBits === 8 && res.adcPowerFraction > 60) {
        insightZh = `【ADC 瓶頸吞噬效應】在 8-bit 高解析度下，ADC 功耗高達 ${res.adcPowerFraction.toFixed(1)}%，將純陣列高達 ${res.coreArrayTopsPerWatt.toFixed(1)} TOPS/W 的優勢大幅拉低至巨集 ${res.fullMacroTopsPerWatt.toFixed(1)} TOPS/W。建議評估量化感知訓練（QAT）將 ADC 降為 4~6 bit。`;
        insightEn = `[ADC Bottleneck Dominance] At 8-bit resolution, ADC power consumes ${res.adcPowerFraction.toFixed(1)}% of the total budget, dragging the raw core efficiency of ${res.coreArrayTopsPerWatt.toFixed(1)} TOPS/W down to a macro-level ${res.fullMacroTopsPerWatt.toFixed(1)} TOPS/W. Consider Quantization-Aware Training (QAT) to relax ADC precision to 4-6 bits.`;
      } else if (res.irDropPercentage > 12) {
        insightZh = `【IR-Drop 嚴重失真警訊】陣列尺寸達 ${res.arraySize}×${res.arraySize}，金屬互連線累加電阻導致最遠端單元壓降達 ${res.irDropPercentage.toFixed(1)}%，引發嚴重的乘加運算類比非線性失真。實務上應將陣列拆分為較小之 ${Math.min(128, res.arraySize / 2)}×${Math.min(128, res.arraySize / 2)} 子矩陣（Sub-arrays）。`;
        insightEn = `[Severe IR-Drop Distortion Warning] At ${res.arraySize}×${res.arraySize}, cumulative interconnect wire resistance creates a ${res.irDropPercentage.toFixed(1)}% worst-case voltage drop at distant cells, causing severe analog nonlinearity in MAC results. Decompose the array into smaller ${Math.min(128, res.arraySize / 2)}×${Math.min(128, res.arraySize / 2)} sub-matrices.`;
      } else {
        insightZh = `【能效平衡工作點】當前配置達成 ${res.fullMacroTopsPerWatt.toFixed(1)} TOPS/W 的實用能效，ADC 佔比與線路壓降維持在健康設計裕度內。適合邊緣微型 Transformer 或 CNN 卷積特徵提取。`;
        insightEn = `[Balanced Operational Point] Current configuration delivers a practical ${res.fullMacroTopsPerWatt.toFixed(1)} TOPS/W macro efficiency, maintaining ADC overhead and line drops within safe design margins. Ideal for edge tiny-Transformers or CNN feature extraction.`;
      }

      insightElem.textContent = T(insightEn, insightZh);
    }
  }

  // Attach event listeners
  [arraySizeSelect, deviceSelect, adcSelect, freqSlider].forEach((ctrl) => {
    if (ctrl) {
      ctrl.addEventListener("input", update);
      ctrl.addEventListener("change", update);
    }
  });

  // Re-run upon language change
  window.addEventListener("languagechange", update);

  // Initial calculation
  update();
}

// Auto-boot if running in browser
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCimEfficiencyCalculator);
  } else {
    initCimEfficiencyCalculator();
  }
}
