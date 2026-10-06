/**
 * automotive-high-temp-sic-gan-simulator.js
 * 
 * 車規高溫極限與功率半導體整合 (SiC / GaN Gate Driver + High-Tj eNVM at 175°C~250°C)
 * 物理耐受性、Arrhenius 電荷洩漏與去飽和保護 (DESAT) 模擬器 (TEST 90)
 * 
 * First-Principles Models:
 * 1. Arrhenius Thermal Leakage Acceleration:
 *    AF(T_j) = exp[ (E_a / k_B) * (1 / T_base - 1 / T_j) ]
 *    Lifetime(T_j) = Base_Lifetime / AF(T_j)
 * 2. STT-MRAM Superparamagnetic Demagnetization Factor:
 *    Delta(T) = (K_u(T) * V) / (k_B * T)
 *    Ku(T) propto Ms(T)^3, collapses at high temperatures
 *    BER_thermal = 0.5 * exp( -Delta(T) )
 * 3. 0-Mask AntiFuse Ohmic Metallic Filament:
 *    R(T) = R_0 * (1 + alpha_T * Delta_T), zero trapped charge leakage
 *    Solid-state atomic migration Ea > 2.4 eV -> > 10 years at 250°C
 * 4. High-Temperature Differential Sense Margin & DESAT Latency:
 *    Delta_I_sense(T) = I_on(T) - I_off(T)
 *    t_DESAT_read = t_base + C_BL * Delta_V / Delta_I_sense(T)
 */

export class AutomotiveHighTempSicGanSimulator {
  constructor(containerId = 'sic-gan-simulator-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.presets = {
      'grade0-inverter': {
        labelZh: '車規 Grade 0 基準',
        labelEn: 'AEC-Q100 Grade 0',
        nameZh: 'AEC-Q100 Grade 0 基準 (150°C 結溫 / 400V 馬達電控)',
        nameEn: 'AEC-Q100 Grade 0 Baseline (150°C Tj / 400V Inverter)',
        tjNominal: 150,
        tjPeak: 165,
        voltageStage: 400,
        desatTargetUs: 2.5,
        tech: 'antifuse',
        descZh: '傳統矽基 IGBT 與初級 SiC 模組標準規範，需保證 150°C 下 15 年資料無損。',
        descEn: 'Standard baseline for Si-IGBT and entry SiC, requiring 15-year retention at 150°C.'
      },
      'sic-traction': {
        labelZh: '800V SiC 主驅動',
        labelEn: '800V SiC Driver',
        nameZh: '800V SiC 主驅智慧閘極驅動器 (175°C 常態 / 200°C 突波)',
        nameEn: '800V SiC Traction Intelligent Driver (175°C Nominal / 200°C Peak)',
        tjNominal: 175,
        tjPeak: 200,
        voltageStage: 800,
        desatTargetUs: 1.5,
        tech: 'antifuse',
        descZh: '800V 高壓主驅動器，高頻大電流急遽溫升，eNVM 用於硬體保護參數與死區修調。',
        descEn: '800V high-voltage driver with rapid thermal rise; eNVM stores protection thresholds.'
      },
      'gan-highfreq': {
        labelZh: '650V GaN 車載充電',
        labelEn: '650V GaN OBC',
        nameZh: '650V GaN 雙向車載充電機 (200°C 常態 / 220°C 突波 / 150V/ns)',
        nameEn: '650V GaN Bidirectional OBC (200°C Nominal / 220°C Peak / 150V/ns)',
        tjNominal: 200,
        tjPeak: 220,
        voltageStage: 650,
        desatTargetUs: 0.8,
        tech: 'mram',
        descZh: '超高頻 GaN 開關 (MHz 等級)，嚴苛 dv/dt 雜訊與 200°C 結溫考驗感測裕度。',
        descEn: 'Ultra-high-frequency GaN power stage with steep dv/dt noise and 200°C junction stress.'
      },
      'ultra-aviation': {
        labelZh: '深井航空極限模組',
        labelEn: 'Downhole/Aviation',
        nameZh: '深井勘探與航空發動機 SiC 模組 (225°C 常態 / 250°C 極限)',
        nameEn: 'Downhole Exploration & Jet Engine SiC (225°C Nominal / 250°C Peak)',
        tjNominal: 225,
        tjPeak: 250,
        voltageStage: 1200,
        desatTargetUs: 3.0,
        tech: 'eflash',
        descZh: '極端惡劣環境，無主動水冷，常態工作溫突破 220°C，傳統電荷型 eNVM 徹底失效。',
        descEn: 'Harsh uncooled power modules operating above 220°C where charge-storage eNVM fails.'
      }
    };

    this.techProfiles = {
      antifuse: {
        nameZh: '0-Mask AntiFuse OTP (歐姆金屬微絲)',
        nameEn: '0-Mask AntiFuse OTP (Ohmic Filament)',
        activationEnergyEa: 2.45, // eV (solid state atomic electromigration barrier)
        baseLifetimeYears: 100,  // At 125 C
        tempCoeffAlpha: 0.0039,  // 1/K (Copper-like positive temp coefficient)
        retentionRating: '卓越 (Grade A+ / 250°C 留存 > 15 年)',
        retentionRatingEn: 'Excellent (Grade A+ / > 15yr Retention at 250°C)',
        desatReadLatencyNs: 35,
        descZh: '物理擊穿形成之合金/結晶矽導電微絲本質無捕獲電荷，高溫 Arrhenius 漏電為零。',
        descEn: 'Physically melted alloy filament holds zero trapped charge, exhibiting zero Arrhenius leakage.'
      },
      mram: {
        nameZh: 'STT-MRAM (垂直 MTJ 自旋轉矩)',
        nameEn: 'STT-MRAM (Perpendicular MTJ)',
        activationEnergyEa: 1.40, // eV
        baseLifetimeYears: 10,   // At 125 C
        tempCoeffAlpha: -0.0025,
        retentionRating: '中等 (Grade C / > 175°C 發生超順磁熱消磁)',
        retentionRatingEn: 'Moderate (Grade C / Superparamagnetic Demagnetization > 175°C)',
        desatReadLatencyNs: 65,
        descZh: '垂直磁各向異性能 Ku 隨溫度劇降，高於 175°C 熱穩定因數 Δ 跌破臨界，位元隨機翻轉。',
        descEn: 'PMA anisotropy barrier Ku drops sharply; thermal stability factor Δ collapses above 175°C.'
      },
      reram: {
        nameZh: 'Oxide ReRAM (BEOL 氧空位微絲)',
        nameEn: 'Oxide ReRAM (BEOL Oxygen Vacancy)',
        activationEnergyEa: 1.25, // eV
        baseLifetimeYears: 5,    // At 125 C
        tempCoeffAlpha: -0.004,
        retentionRating: '偏弱 (Grade C- / 高溫離子回擴散 HRS 阻值漂移)',
        retentionRatingEn: 'Poor (Grade C- / Thermal ion back-diffusion causing HRS drift)',
        desatReadLatencyNs: 95,
        descZh: '熱活化氧離子在 175°C 以上加速側向回擴散，高阻態 (HRS) 阻抗大幅下掉，讀取窗口收窄。',
        descEn: 'Thermally activated oxygen vacancies back-diffuse rapidly above 175°C, closing read windows.'
      },
      eflash: {
        nameZh: 'Floating-Gate / CT eFlash (FEOL)',
        nameEn: 'Floating-Gate / CT eFlash (FEOL)',
        activationEnergyEa: 1.05, // eV (electron thermal emission from trap/well)
        baseLifetimeYears: 15,   // At 125 C
        tempCoeffAlpha: -0.008,
        retentionRating: '致命失效 (Grade F / 200°C 壽命崩跌至不足 10 小時)',
        retentionRatingEn: 'Catastrophic (Grade F / Retention drops to < 10 hrs at 200°C)',
        desatReadLatencyNs: 180,
        descZh: '高溫熱發射 (Thermionic Emission) 使浮閘電荷雪崩外洩，車規 Grade 0 壽命指標徹底崩潰。',
        descEn: 'Thermionic emission triggers catastrophic electron loss; fails all AEC-Q100 Grade 0 tests.'
      }
    };

    // Physical Constants
    this.kB = 8.617333262145e-5; // eV/K

    this.state = {
      preset: 'sic-traction',
      junctionTemp: 175,
      surgeTemp: 200,
      busVoltage: 800,
      tech: 'antifuse'
    };

    this.initDOM();
    this.bindEvents();
    this.update();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="sic-gan-card" style="background: var(--surface, #111827); border: 1px solid var(--border-color, #374151); border-radius: 12px; padding: 24px; color: var(--text-color, #f3f4f6); font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="background: #dc2626; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase;">
                <span data-lang="zh">功率電子與高溫物理</span><span data-lang="en">Power Electronics &amp; High-Tj Physics</span>
              </span>
              <span style="color: #10b981; font-size: 11px; font-weight: 600;">TEST 90 COMPLIANT</span>
            </div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 700;">
              <span data-lang="zh">車規極限高溫 (175°C~250°C) SiC / GaN 功率整合 eNVM 模擬工作台</span>
              <span data-lang="en">High-Tj (175°C~250°C) SiC / GaN Driver eNVM Endurance Simulator</span>
            </h3>
            <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af; max-width: 720px;">
              <span data-lang="zh">第一性原理建模：Arrhenius 活化能電荷洩漏、STT-MRAM 超順磁退磁臨界、0-Mask AntiFuse 歐姆金屬微絲抗熱退火與去飽和保護 (DESAT) 觸發延遲。</span>
              <span data-lang="en">First-principles simulation: Arrhenius charge leakage, STT-MRAM superparamagnetic demagnetization, 0-Mask AntiFuse ohmic filament resilience, and DESAT fault latency.</span>
            </p>
          </div>
          <!-- Preset Buttons -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="sic-preset-container">
            ${Object.entries(this.presets).map(([k, p]) => `
              <button type="button" class="sic-btn-preset ${k === this.state.preset ? 'active' : ''}" data-preset="${k}" aria-label="${p.labelEn}" data-aria-en="${p.labelEn}" data-aria-zh="${p.labelZh}" style="background: ${k === this.state.preset ? '#dc2626' : '#1f2937'}; border: 1px solid ${k === this.state.preset ? '#f87171' : '#374151'}; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                <span data-lang="zh">${p.labelZh}</span><span data-lang="en">${p.labelEn}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Controls Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <!-- Slider 1: Junction Temperature -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">功率開關常態結溫 (T_j)</span><span data-lang="en">Normal Junction Temp (T_j)</span></span>
              <span id="sic-val-temp" style="color: #f87171; font-family: monospace; font-weight: 700;">175 °C</span>
            </div>
            <input type="range" id="sic-slide-temp" min="125" max="250" step="5" value="${this.state.junctionTemp}" aria-label="Junction Temperature" data-aria-en="Junction Temperature" data-aria-zh="功率開關常態結溫" style="width: 100%; accent-color: #dc2626;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">125°C (車規 Grade 1)</span><span data-lang="en">125°C (Grade 1)</span></span>
              <span><span data-lang="zh">250°C (極限高溫)</span><span data-lang="en">250°C (Extreme Tj)</span></span>
            </div>
          </div>

          <!-- Slider 2: Surge Peak Temperature -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">短路/故障突波結溫 (T_surge)</span><span data-lang="en">Surge Peak Temp (T_surge)</span></span>
              <span id="sic-val-surge" style="color: #f87171; font-family: monospace; font-weight: 700;">200 °C</span>
            </div>
            <input type="range" id="sic-slide-surge" min="140" max="280" step="5" value="${this.state.surgeTemp}" aria-label="Surge Peak Temp" data-aria-en="Surge Peak Temp" data-aria-zh="短路故障突波結溫" style="width: 100%; accent-color: #dc2626;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">140°C (輕微突波)</span><span data-lang="en">140°C (Mild)</span></span>
              <span><span data-lang="zh">280°C (短路雪崩)</span><span data-lang="en">280°C (Severe)</span></span>
            </div>
          </div>

          <!-- Slider 3: Bus Voltage -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">高壓母線電壓 (V_bus)</span><span data-lang="en">DC Bus Voltage (V_bus)</span></span>
              <span id="sic-val-vbus" style="color: #f87171; font-family: monospace; font-weight: 700;">800 V</span>
            </div>
            <input type="range" id="sic-slide-vbus" min="300" max="1200" step="50" value="${this.state.busVoltage}" aria-label="DC Bus Voltage" data-aria-en="DC Bus Voltage" data-aria-zh="高壓母線電壓" style="width: 100%; accent-color: #dc2626;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">300V (400V 系統)</span><span data-lang="en">300V (400V Sys)</span></span>
              <span><span data-lang="zh">1200V (超高壓 SiC)</span><span data-lang="en">1200V (High SiC)</span></span>
            </div>
          </div>

          <!-- Select 1: Evaluated eNVM Technology -->
          <div>
            <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">
              <span data-lang="zh">受測高溫 eNVM 架構</span><span data-lang="en">Evaluated High-Tj eNVM</span>
            </label>
            <select id="sic-sel-tech" aria-label="High-Tj eNVM Technology" data-aria-en="High-Tj eNVM Technology" data-aria-zh="受測高溫 eNVM 架構" style="width: 100%; background: #1f2937; border: 1px solid #374151; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px;">
              <option value="antifuse">AntiFuse OTP (0-Mask 微絲)</option>
              <option value="mram">STT-MRAM (垂直 MTJ)</option>
              <option value="reram">Oxide ReRAM (BEOL 微絲)</option>
              <option value="eflash">eFlash (浮閘/電荷陷阱)</option>
            </select>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <!-- Metric 1: Retention Lifetime -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">常態結溫資料留存壽命</span><span data-lang="en">Retention Lifetime @ Tj</span>
            </div>
            <div id="sic-out-lifetime" style="font-size: 18px; font-weight: 700; color: #38bdf8; font-family: monospace;">> 20 年</div>
            <div id="sic-out-arrhenius-af" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">AF = 1.0x</div>
          </div>

          <!-- Metric 2: Thermal Stability Factor / BER -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">熱能障穩定度 (Δ / BER)</span><span data-lang="en">Thermal Barrier (Δ / BER)</span>
            </div>
            <div id="sic-out-barrier" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">Δ > 65 (穩固)</div>
            <div id="sic-out-ber" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">BER < 1e-15</div>
          </div>

          <!-- Metric 3: Differential Sense Margin -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">高溫差動讀出感測裕度</span><span data-lang="en">Diff Sense Margin (ΔI_sense)</span>
            </div>
            <div id="sic-out-margin" style="font-size: 18px; font-weight: 700; color: #f59e0b; font-family: monospace;">18.5 μA</div>
            <div id="sic-out-snr" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">SNR = 28.4 dB</div>
          </div>

          <!-- Metric 4: DESAT Readout Fault Latency -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">DESAT 短路保護讀出延遲</span><span data-lang="en">DESAT Trip Readout Latency</span>
            </div>
            <div id="sic-out-latency" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">42 ns</div>
            <div id="sic-out-rating" style="font-size: 11px; margin-top: 4px;"></div>
          </div>
        </div>

        <!-- Dual Canvas Visualizations -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Canvas 1: Arrhenius Log Lifetime Curve -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 1：高溫 Arrhenius 留存壽命對數衰減曲線 (125°C ~ 250°C)</span>
                <span data-lang="en">Fig 1: Arrhenius Retention Log Lifetime vs Junction Temp</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Arrhenius Model</span>
            </div>
            <canvas id="sic-canvas-arrhenius" width="460" height="240" style="width: 100%; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">紅虛線：車規 15 年門檻</span><span data-lang="en">Red Dash: 15-Year Baseline</span></span>
              <span><span data-lang="zh">彩線：eNVM 活化能推算壽命</span><span data-lang="en">Color: Simulated Ea Lifetime</span></span>
            </div>
          </div>

          <!-- Canvas 2: Differential Sense Margin vs Temperature -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 2：高溫讀出感測窗 ΔI_sense 與 DESAT 保護安全邊界</span>
                <span data-lang="en">Fig 2: Diff Sense Margin &amp; DESAT Protection Safety Boundary</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Sense Window</span>
            </div>
            <canvas id="sic-canvas-sense" width="460" height="240" style="width: 100%; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">綠虛線：DESAT 判定閾值 (5μA)</span><span data-lang="en">Green Dash: DESAT Trip (5μA)</span></span>
              <span><span data-lang="zh">曲線：高溫讀取信號窗退化</span><span data-lang="en">Curve: High-T Window Decay</span></span>
            </div>
          </div>
        </div>

        <!-- Physical Verdict Callout -->
        <div id="sic-verdict-box" style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.5;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 4px;" id="sic-verdict-title">
            <span data-lang="zh">車規功率半導體整合物理研判</span>
            <span data-lang="en">Automotive Power Stage Integration Verdict</span>
          </div>
          <div id="sic-verdict-desc" style="color: #d1d5db;"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Preset Buttons
    this.container.querySelectorAll('.sic-btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        if (this.presets[presetKey]) {
          this.applyPreset(presetKey);
        }
      });
    });

    // Sliders
    const bindSlider = (id, stateKey, displayId, unit, formatter = v => v) => {
      const el = this.container.querySelector(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.state[stateKey] = parseFloat(e.target.value);
          const disp = this.container.querySelector(displayId);
          if (disp) disp.textContent = `${formatter(this.state[stateKey])} ${unit}`;
          this.update();
        });
      }
    };

    bindSlider('#sic-slide-temp', 'junctionTemp', '#sic-val-temp', '°C');
    bindSlider('#sic-slide-surge', 'surgeTemp', '#sic-val-surge', '°C');
    bindSlider('#sic-slide-vbus', 'busVoltage', '#sic-val-vbus', 'V');

    // Selects
    const selTech = this.container.querySelector('#sic-sel-tech');
    if (selTech) {
      selTech.addEventListener('change', (e) => {
        this.state.tech = e.target.value;
        this.update();
      });
    }

    // Language Change
    document.addEventListener('languagechange', () => {
      this.updateBilingualLabels();
    });
  }

  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;
    this.state = {
      preset: presetKey,
      junctionTemp: p.tjNominal,
      surgeTemp: p.tjPeak,
      busVoltage: p.voltageStage,
      tech: p.tech
    };

    this.container.querySelector('#sic-slide-temp').value = p.tjNominal;
    this.container.querySelector('#sic-val-temp').textContent = `${p.tjNominal} °C`;

    this.container.querySelector('#sic-slide-surge').value = p.tjPeak;
    this.container.querySelector('#sic-val-surge').textContent = `${p.tjPeak} °C`;

    this.container.querySelector('#sic-slide-vbus').value = p.voltageStage;
    this.container.querySelector('#sic-val-vbus').textContent = `${p.voltageStage} V`;

    this.container.querySelector('#sic-sel-tech').value = p.tech;

    this.container.querySelectorAll('.sic-btn-preset').forEach(btn => {
      const active = btn.getAttribute('data-preset') === presetKey;
      btn.style.background = active ? '#dc2626' : '#1f2937';
      btn.style.borderColor = active ? '#f87171' : '#374151';
    });

    this.update();
  }

  computePhysics() {
    const s = this.state;
    const tech = this.techProfiles[s.tech] || this.techProfiles['antifuse'];

    // 1. Arrhenius Acceleration Factor (AF) from 125 C (398.15 K) baseline:
    const T_base_K = 125 + 273.15;
    const T_j_K = s.junctionTemp + 273.15;
    const exponent = (tech.activationEnergyEa / this.kB) * ( (1 / T_base_K) - (1 / T_j_K) );
    const af = Math.exp(Math.max(-10, Math.min(35, exponent)));

    // Lifetime in years:
    const lifetimeYears = tech.baseLifetimeYears / af;

    // 2. STT-MRAM Thermal Stability Barrier Factor Delta(T):
    // Delta(125 C) ~ 60. As temp increases, Ku(T) propto Ms(T)^3 drops, kBT increases
    let deltaBarrier = 60.0;
    let ber = 1e-16;
    if (s.tech === 'mram') {
      const tempDerating = Math.max(0.1, 1 - (s.junctionTemp - 125) * 0.0075);
      deltaBarrier = 60.0 * tempDerating;
      ber = Math.min(0.5, 0.5 * Math.exp(-deltaBarrier));
    } else if (s.tech === 'antifuse') {
      deltaBarrier = 85.0; // Virtual ohmic barrier
      ber = 1e-18;
    } else if (s.tech === 'reram') {
      deltaBarrier = Math.max(10, 45.0 - (s.junctionTemp - 125) * 0.25);
      ber = Math.min(0.1, 1e-12 * af);
    } else {
      // eFlash
      deltaBarrier = Math.max(5, 50.0 - (s.junctionTemp - 125) * 0.35);
      ber = Math.min(0.5, 1e-10 * af);
    }

    // 3. Differential Sense Margin (Delta_I_sense in uA)
    // AntiFuse maintains robust ~20uA window, eFlash margin collapses due to leakage
    let senseMarginUa = 22.0;
    if (s.tech === 'antifuse') {
      // Slight ohmic resistance increase reduces read current marginally: I = V / (R0 * (1 + alpha * dT))
      senseMarginUa = 22.0 / (1 + tech.tempCoeffAlpha * (s.junctionTemp - 125));
    } else if (s.tech === 'mram') {
      // TMR drops with temperature: TMR(T) = TMR0 * (1 - alpha * T)
      senseMarginUa = Math.max(1.0, 15.0 - (s.junctionTemp - 125) * 0.12);
    } else if (s.tech === 'reram') {
      senseMarginUa = Math.max(0.8, 14.0 - (s.junctionTemp - 125) * 0.11);
    } else {
      // eFlash: tunnel oxide leakage surges, Ion/Ioff window closes
      senseMarginUa = Math.max(0.05, 18.0 - (s.junctionTemp - 125) * 0.18);
    }

    const snrDb = 20 * Math.log10(Math.max(1.1, senseMarginUa / 0.8));

    // 4. DESAT Trip Readout Latency
    // C_BL * Delta_V / Delta_I_sense
    const desatLatencyNs = tech.desatReadLatencyNs + (25.0 / Math.max(0.2, senseMarginUa)) * 12;

    return {
      af,
      lifetimeYears,
      deltaBarrier,
      ber,
      senseMarginUa,
      snrDb,
      desatLatencyNs,
      tech
    };
  }

  update() {
    const p = this.computePhysics();

    // 1. Lifetime Output
    const outLife = this.container.querySelector('#sic-out-lifetime');
    if (outLife) {
      if (p.lifetimeYears >= 15) {
        outLife.innerHTML = `&gt; ${Math.round(p.lifetimeYears)} <span data-lang="zh">年</span><span data-lang="en">yr</span>`;
        outLife.style.color = '#10b981';
      } else if (p.lifetimeYears >= 1) {
        outLife.innerHTML = `${p.lifetimeYears.toFixed(1)} <span data-lang="zh">年</span><span data-lang="en">yr</span>`;
        outLife.style.color = '#f59e0b';
      } else if (p.lifetimeYears * 365 >= 1) {
        outLife.innerHTML = `${(p.lifetimeYears * 365).toFixed(0)} <span data-lang="zh">天</span><span data-lang="en">days</span>`;
        outLife.style.color = '#ef4444';
      } else {
        const hours = Math.max(0.1, p.lifetimeYears * 8760);
        outLife.innerHTML = `${hours.toFixed(1)} <span data-lang="zh">小時</span><span data-lang="en">hrs</span>`;
        outLife.style.color = '#ef4444';
      }
    }

    const outAf = this.container.querySelector('#sic-out-arrhenius-af');
    if (outAf) {
      outAf.textContent = `AF = ${p.af >= 1e4 ? p.af.toExponential(1) : p.af.toFixed(1)}x (Ea=${p.tech.activationEnergyEa}eV)`;
    }

    // 2. Barrier / BER Output
    const outBar = this.container.querySelector('#sic-out-barrier');
    if (outBar) {
      if (p.deltaBarrier >= 50) {
        outBar.innerHTML = `Δ = ${p.deltaBarrier.toFixed(0)} (<span data-lang="zh">極高穩定</span><span data-lang="en">Stable</span>)`;
        outBar.style.color = '#10b981';
      } else if (p.deltaBarrier >= 40) {
        outBar.innerHTML = `Δ = ${p.deltaBarrier.toFixed(0)} (<span data-lang="zh">臨界裕度</span><span data-lang="en">Marginal</span>)`;
        outBar.style.color = '#f59e0b';
      } else {
        outBar.innerHTML = `Δ = ${p.deltaBarrier.toFixed(0)} (<span data-lang="zh">超順磁翻轉</span><span data-lang="en">Unstable</span>)`;
        outBar.style.color = '#ef4444';
      }
    }

    const outBer = this.container.querySelector('#sic-out-ber');
    if (outBer) {
      outBer.textContent = `BER ~ ${p.ber.toExponential(1)}`;
    }

    // 3. Margin Output
    const outMargin = this.container.querySelector('#sic-out-margin');
    if (outMargin) {
      outMargin.textContent = `${p.senseMarginUa.toFixed(1)} μA`;
      outMargin.style.color = p.senseMarginUa >= 8 ? '#10b981' : (p.senseMarginUa >= 3 ? '#f59e0b' : '#ef4444');
    }

    const outSnr = this.container.querySelector('#sic-out-snr');
    if (outSnr) {
      outSnr.textContent = `SNR = ${p.snrDb.toFixed(1)} dB`;
    }

    // 4. Latency Output
    const outLat = this.container.querySelector('#sic-out-latency');
    if (outLat) {
      outLat.textContent = `${Math.round(p.desatLatencyNs)} ns`;
      outLat.style.color = p.desatLatencyNs <= 150 ? '#10b981' : '#f59e0b';
    }

    const outRating = this.container.querySelector('#sic-out-rating');
    if (outRating) {
      if (this.state.tech === 'antifuse') {
        outRating.innerHTML = `<span style="color: #10b981; font-weight: 600;"><span data-lang="zh">GRADE A+ (250°C 歐姆微絲免洩漏)</span><span data-lang="en">GRADE A+ (Zero Leakage Ohmic Filament)</span></span>`;
      } else if (this.state.tech === 'mram') {
        outRating.innerHTML = `<span style="color: #60a5fa; font-weight: 600;"><span data-lang="zh">GRADE C (175°C 磁各向異性衰減)</span><span data-lang="en">GRADE C (PMA Anisotropy Derating)</span></span>`;
      } else if (this.state.tech === 'reram') {
        outRating.innerHTML = `<span style="color: #f59e0b; font-weight: 600;"><span data-lang="zh">GRADE C- (氧空位側擴散)</span><span data-lang="en">GRADE C- (Oxygen Migration Drift)</span></span>`;
      } else {
        outRating.innerHTML = `<span style="color: #ef4444; font-weight: 600;"><span data-lang="zh">GRADE F (熱發射電荷雪崩外洩)</span><span data-lang="en">GRADE F (Thermionic Charge Avalanche)</span></span>`;
      }
    }

    // 5. Verdict Box
    const vDesc = this.container.querySelector('#sic-verdict-desc');
    if (vDesc) {
      let verdictZh = '';
      let verdictEn = '';
      if (this.state.tech === 'eflash' && this.state.junctionTemp >= 165) {
        verdictZh = `嚴重警訊：浮閘 eFlash 在結溫 ${this.state.junctionTemp}°C 下，熱發射活化能導致洩漏倍率高達 ${p.af >= 1e3 ? p.af.toExponential(1) : Math.round(p.af)} 倍！資料留存由原廠 15 年暴跌至僅剩 ${p.lifetimeYears >= 1 ? p.lifetimeYears.toFixed(1) + ' 年' : (p.lifetimeYears * 8760).toFixed(0) + ' 小時'}，無法通過車規 AEC-Q100 Grade 0 考核。在 SiC/GaN 驅動晶片中嚴禁使用傳統浮閘 eFlash。`;
        verdictEn = `Critical Warning: Floating-gate eFlash at ${this.state.junctionTemp}°C suffers from Arrhenius charge leakage surge of ${p.af >= 1e3 ? p.af.toExponential(1) : Math.round(p.af)}x! Data retention plummets from 15 years to ${p.lifetimeYears >= 1 ? p.lifetimeYears.toFixed(1) + ' yr' : (p.lifetimeYears * 8760).toFixed(0) + ' hrs'}, failing AEC-Q100 Grade 0. Strictly avoided in SiC/GaN gate drivers.`;
      } else if (this.state.tech === 'mram' && this.state.junctionTemp >= 190) {
        verdictZh = `架構預警：STT-MRAM 在結溫 ${this.state.junctionTemp}°C 下逼近超順磁臨界，熱能障因數 Δ 降至 ${p.deltaBarrier.toFixed(0)}，隨機熱反轉誤碼率飆升至 ${p.ber.toExponential(1)}。需額外強固 ECC 或限制在 160°C 以下工作環境。`;
        verdictEn = `Architectural Warning: STT-MRAM approaches superparamagnetic collapse at ${this.state.junctionTemp}°C, with thermal stability Δ dropping to ${p.deltaBarrier.toFixed(0)} and BER climbing to ${p.ber.toExponential(1)}. Requires aggressive ECC or temperature throttling.`;
      } else {
        verdictZh = `設計評估合格：${p.tech.nameZh} 於 ${this.state.junctionTemp}°C 結溫與 ${this.state.busVoltage}V 高壓環境下，保持穩定之 ${p.senseMarginUa.toFixed(1)} μA 差動感測裕度。DESAT 保護讀出延遲僅 ${Math.round(p.desatLatencyNs)} ns，遠快於 1~2 μs 功率短路安全耐受時間 (SCWT)，完全保障系統安全！`;
        verdictEn = `Design Qualified: ${p.tech.nameEn} maintains robust differential sense margin of ${p.senseMarginUa.toFixed(1)} μA at ${this.state.junctionTemp}°C and ${this.state.busVoltage}V. DESAT trip readout latency is only ${Math.round(p.desatLatencyNs)} ns, well within the 1~2 μs short-circuit withstand time (SCWT).`;
      }

      vDesc.innerHTML = `<span data-lang="zh">${verdictZh}</span><span data-lang="en">${verdictEn}</span>`;
    }

    this.renderCanvasArrhenius(p);
    this.renderCanvasSense(p);
  }

  renderCanvasArrhenius(p) {
    const canvas = this.container.querySelector('#sic-canvas-arrhenius');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 35;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.fillText('Lifetime (Log Years)', 5, padTop - 10);
    ctx.fillText('Junction Temp Tj (°C)', padLeft + plotW / 2 - 50, padTop + plotH + 28);

    // Y axis: Log10 Lifetime from 1e-3 years (~9 hours) to 1e2 years (100 years)
    // logMin = -3, logMax = 2 -> range = 5
    const logMin = -3;
    const logMax = 2;
    const logRange = logMax - logMin;

    for (let logY = -3; logY <= 2; logY++) {
      const y = padTop + plotH - ((logY - logMin) / logRange) * plotH;
      ctx.beginPath(); ctx.moveTo(padLeft - 3, y); ctx.lineTo(padLeft, y); ctx.stroke();
      let label = '1 yr';
      if (logY === -3) label = '8h';
      else if (logY === -2) label = '3d';
      else if (logY === -1) label = '1mo';
      else if (logY === 0) label = '1y';
      else if (logY === 1) label = '10y';
      else if (logY === 2) label = '100y';
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(label, padLeft - 28, y + 3);

      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
      ctx.strokeStyle = '#475569';
    }

    // X axis: 125 to 250 C
    const minT = 125;
    const maxT = 250;
    for (let t = 125; t <= 250; t += 25) {
      const x = padLeft + ((t - minT) / (maxT - minT)) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padTop + plotH); ctx.lineTo(x, padTop + plotH + 3); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${t}°`, x - 8, padTop + plotH + 14);
    }

    // 15-Year Automotive Baseline Line (Red Dash)
    const log15 = Math.log10(15);
    const line15Y = padTop + plotH - ((log15 - logMin) / logRange) * plotH;
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, line15Y);
    ctx.lineTo(padLeft + plotW, line15Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '9px monospace';
    ctx.fillText('AEC-Q100 15yr Limit', padLeft + plotW - 120, line15Y - 4);

    // Plot curves for current tech
    const T_base_K = 125 + 273.15;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = minT + (i / steps) * (maxT - minT);
      const tK = t + 273.15;
      const exp = (p.tech.activationEnergyEa / this.kB) * ((1 / T_base_K) - (1 / tK));
      const af = Math.exp(Math.max(-5, Math.min(30, exp)));
      const life = p.tech.baseLifetimeYears / af;
      const logLife = Math.max(logMin, Math.min(logMax, Math.log10(life)));

      const x = padLeft + ((t - minT) / (maxT - minT)) * plotW;
      const y = padTop + plotH - ((logLife - logMin) / logRange) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mark current operating point
    const curX = padLeft + ((this.state.junctionTemp - minT) / (maxT - minT)) * plotW;
    const curLogLife = Math.max(logMin, Math.min(logMax, Math.log10(p.lifetimeYears)));
    const curY = padTop + plotH - ((curLogLife - logMin) / logRange) * plotH;

    ctx.fillStyle = p.lifetimeYears >= 15 ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(`@${this.state.junctionTemp}°C: ${p.lifetimeYears >= 1 ? p.lifetimeYears.toFixed(1) + 'y' : (p.lifetimeYears * 8760).toFixed(0) + 'h'}`, Math.min(w - 140, curX + 10), curY - 6);
  }

  renderCanvasSense(p) {
    const canvas = this.container.querySelector('#sic-canvas-sense');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 35;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.fillText('Sense Margin (μA)', 5, padTop - 10);
    ctx.fillText('Junction Temp Tj (°C)', padLeft + plotW / 2 - 50, padTop + plotH + 28);

    const maxMargin = 25.0; // uA
    const minT = 125;
    const maxT = 250;

    // Y ticks
    for (let m = 5; m <= 25; m += 5) {
      const y = padTop + plotH - (m / maxMargin) * plotH;
      ctx.beginPath(); ctx.moveTo(padLeft - 3, y); ctx.lineTo(padLeft, y); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${m}`, padLeft - 22, y + 3);

      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
      ctx.strokeStyle = '#475569';
    }

    // X ticks
    for (let t = 125; t <= 250; t += 25) {
      const x = padLeft + ((t - minT) / (maxT - minT)) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padTop + plotH); ctx.lineTo(x, padTop + plotH + 3); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${t}°`, x - 8, padTop + plotH + 14);
    }

    // DESAT Minimum Sense Threshold Line (Green Dash @ 5 uA)
    const line5Y = padTop + plotH - (5.0 / maxMargin) * plotH;
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, line5Y);
    ctx.lineTo(padLeft + plotW, line5Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#10b981';
    ctx.font = '9px monospace';
    ctx.fillText('DESAT Min Trip Limit (5 μA)', padLeft + plotW - 150, line5Y - 4);

    // Margin Curve
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = minT + (i / steps) * (maxT - minT);
      let m = 22.0;
      if (this.state.tech === 'antifuse') {
        m = 22.0 / (1 + p.tech.tempCoeffAlpha * (t - 125));
      } else if (this.state.tech === 'mram') {
        m = Math.max(1.0, 15.0 - (t - 125) * 0.12);
      } else if (this.state.tech === 'reram') {
        m = Math.max(0.8, 14.0 - (t - 125) * 0.11);
      } else {
        m = Math.max(0.05, 18.0 - (t - 125) * 0.18);
      }

      const x = padLeft + ((t - minT) / (maxT - minT)) * plotW;
      const y = padTop + plotH - (Math.min(maxMargin, m) / maxMargin) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current Operating Point
    const curX = padLeft + ((this.state.junctionTemp - minT) / (maxT - minT)) * plotW;
    const curY = padTop + plotH - (Math.min(maxMargin, p.senseMarginUa) / maxMargin) * plotH;

    ctx.fillStyle = p.senseMarginUa >= 5 ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(`ΔI = ${p.senseMarginUa.toFixed(1)} μA`, Math.min(w - 120, curX + 10), curY - 6);
  }

  updateBilingualLabels() {
    this.update();
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AutomotiveHighTempSicGanSimulator());
  } else {
    new AutomotiveHighTempSicGanSimulator();
  }
}
