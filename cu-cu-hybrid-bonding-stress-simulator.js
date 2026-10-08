/**
 * cu-cu-hybrid-bonding-stress-simulator.js
 * 
 * 3D 晶圓堆疊 Cu-Cu 混合鍵合 (Direct Cu-Cu Hybrid Bonding / WoW / CoW)
 * 熱膨脹係數 (CTE) 應變與位錯漏電物理模擬器 (TEST 89)
 * 
 * Physical Models:
 * 1. CMP Dishing & Interface Voiding:
 *    delta_gap = 2 * d_dish
 *    Delta_h_Cu = h_pad * (alpha_Cu - alpha_diel) * (T_anneal - T_0)
 *    Closure Margin = Delta_h_Cu - delta_gap
 * 2. Residual Thermal Stress & Piezoresistive Drift:
 *    sigma_thermal = [E_Cu / (1 - nu_Cu)] * (alpha_Si - alpha_Cu) * (T_anneal - T_op)
 *    sigma(r) = sigma_peak * (r_pad / (r + r_pad))^2.2
 *    Delta_mu / mu = pi_piezo * sigma_channel
 *    Delta_Vth = gamma_piezo * sigma_channel
 * 3. Stress-Induced Dielectric Leakage & Endurance/Retention Derating:
 *    J_leak(sigma) = J_0 * exp(beta_stress * |sigma| / (k_B * T_op))
 * 4. Keep-Out Zone (KOZ) Calculation:
 *    d_KOZ = r_pad * (1 + kappa * sqrt(|sigma_peak| / sigma_limit))
 */

export class CuCuHybridBondingSimulator {
  constructor(containerId = 'cu-bonding-simulator-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.presets = {
      'tsmc-soic': {
        labelZh: '台積電 SoIC-X',
        labelEn: 'TSMC SoIC-X',
        nameZh: '台積電 SoIC-X 亞微米極限堆疊 (0.9μm Pitch / 300°C)',
        nameEn: 'TSMC SoIC-X Sub-Micron Stack (0.9μm Pitch / 300°C)',
        pitch: 0.9,
        padDiameter: 0.5,
        padHeight: 1.2,
        cmpDishing: 3.0,
        annealTemp: 300,
        opTemp: 85,
        dielectric: 'sicn',
        tech: 'antifuse',
        descZh: '業界領先之次微米 Cu-Cu 間距，高熱應力集中於焊盤邊緣，極限微縮互連。',
        descEn: 'Industry-leading sub-micron pitch with high localized thermal stress at pad boundaries.'
      },
      'intel-foveros': {
        labelZh: '英特爾 Foveros',
        labelEn: 'Intel Foveros',
        nameZh: '英特爾 Foveros Direct 邏輯堆疊 (3.0μm Pitch / 250°C)',
        nameEn: 'Intel Foveros Direct Logic Stack (3.0μm Pitch / 250°C)',
        pitch: 3.0,
        padDiameter: 1.8,
        padHeight: 2.0,
        cmpDishing: 4.5,
        annealTemp: 250,
        opTemp: 105,
        dielectric: 'sio2',
        tech: 'mram',
        descZh: '成熟 3D 異質整合鍵合，焊盤面積較大，退火應變與封裝熱循環耐受良好。',
        descEn: 'Mature 3D heterogeneous bonding with larger pads and robust thermal cycle tolerance.'
      },
      'sony-cis': {
        labelZh: '索尼 3層晶圓',
        labelEn: 'Sony 3-Layer',
        nameZh: '索尼 / 台積電 3 層晶圓 CIS 堆疊 (1.5μm Pitch / 200°C)',
        nameEn: 'Sony / TSMC 3-Layer CIS Wafer Stack (1.5μm Pitch / 200°C)',
        pitch: 1.5,
        padDiameter: 0.8,
        padHeight: 1.0,
        cmpDishing: 2.2,
        annealTemp: 200,
        opTemp: 60,
        dielectric: 'sio2-lowt',
        tech: 'reram',
        descZh: '低溫等離子活化鍵合技術，有效壓制熱膨脹位錯，保護底層類比感測陣列。',
        descEn: 'Low-temperature plasma-activated bonding suppressing thermal dislocations.'
      },
      'extreme-stress': {
        labelZh: '極端應變測試',
        labelEn: 'Extreme Stress',
        nameZh: '極端 CTE 失配與超微間距實驗 (0.6μm Pitch / 350°C)',
        nameEn: 'Extreme CTE Mismatch & Ultra-Dense Testbed (0.6μm Pitch / 350°C)',
        pitch: 0.6,
        padDiameter: 0.35,
        padHeight: 0.8,
        cmpDishing: 5.5,
        annealTemp: 350,
        opTemp: 125,
        dielectric: 'sio2',
        tech: 'eflash',
        descZh: '極端測試情境：大凹陷與高退火溫差，空洞臨界與劇烈壓電電阻漂移。',
        descEn: 'Boundary condition: large dishing and steep thermal delta causing voiding risks.'
      }
    };

    this.techProfiles = {
      antifuse: {
        nameZh: 'AntiFuse OTP (0-Mask 微絲)',
        nameEn: 'AntiFuse OTP (0-Mask Filament)',
        sigmaLimit: 450, // MPa allowable
        piezoSensitivity: 0.25, // mV/MPa (intrinsic crystalline silicon channel piezoresistive property)
        leakageSensitivity: 0.002,
        minKozFactor: 1.2,
        retentionResilience: '優異 (FEOL 高溫相容 / 歐姆微絲無浮閘電荷洩漏)',
        retentionResilienceEn: 'Preferred (FEOL High-T / Filament immune to floating gate leakage)',
        descZh: '已崩潰之金屬/矽導電微絲本質上無捕獲電荷，剪切應力僅引發微幅歐姆阻值漂移。',
        descEn: 'Ruptured filament stores zero trapped charge, exhibiting minimal ohmic drift under shear stress.'
      },
      mram: {
        nameZh: 'STT-MRAM (BEOL 垂直 MTJ)',
        nameEn: 'STT-MRAM (BEOL Perpendicular MTJ)',
        sigmaLimit: 320, // MPa
        piezoSensitivity: 0.25,
        leakageSensitivity: 0.005,
        minKozFactor: 1.8,
        retentionResilience: '良好 (需控制退火熱預算 / 磁致伸縮致 PMA 輕微退化)',
        retentionResilienceEn: 'Good (Manage anneal budget / Minor magnetostrictive PMA derating)',
        descZh: 'Cu Pad 剪切應變透過金屬介電層傳至 MTJ 柱，磁光彈效應造成垂直磁各向異性輕微衰減。',
        descEn: 'Pad shear strain propagates to MTJ, derating PMA thermal stability delta slightly.'
      },
      reram: {
        nameZh: 'Oxide ReRAM (BEOL 氧空位微絲)',
        nameEn: 'Oxide ReRAM (BEOL Oxygen Vacancy)',
        sigmaLimit: 260, // MPa
        piezoSensitivity: 0.25,
        leakageSensitivity: 0.008,
        minKozFactor: 2.2,
        retentionResilience: '中等 (需低溫鍵合或 Forming 補償 / 氧空位非均勻側向擴散)',
        retentionResilienceEn: 'Moderate (Low-T bonding / Strain gradients accelerate lateral oxygen migration)',
        descZh: '局部高張應力降低氧離子活化擴散能障，長效高溫高阻態 (HRS) 阻值漂移散佈加劇。',
        descEn: 'Tensile stress lowers oxygen diffusion barriers, widening HRS resistance drift.'
      },
      eflash: {
        nameZh: 'Floating-Gate / CT eFlash (FEOL)',
        nameEn: 'Floating-Gate / CT eFlash (FEOL)',
        sigmaLimit: 180, // MPa
        piezoSensitivity: 0.25,
        leakageSensitivity: 0.018,
        minKozFactor: 3.5,
        retentionResilience: '受限 (需注意 SILC 漏電與退火熱預算 / 氧化層陷阱)',
        retentionResilienceEn: 'Constrained (SILC stress & thermal budget constraints / Oxide traps)',
        descZh: '熱應力直通穿隧氧化層界面，引發界面陷阱與 SILC 漏電，高溫留存壽命需依退火條件降額。',
        descEn: 'Thermal stress damages tunnel oxide interface, increasing SILC leakage requiring retention derating.'
      }
    };

    this.dielectrics = {
      'sicn': { name: 'SiCN (High-Density Cap)', cte: 1.8e-6, modulus: 120 },
      'sio2': { name: 'SiO2 (PECVD)', cte: 0.5e-6, modulus: 70 },
      'sio2-lowt': { name: 'SiO2 (Low-T Activated)', cte: 0.6e-6, modulus: 65 }
    };

    // Constants
    this.alphaCu = 16.5e-6; // 1/K
    this.alphaSi = 2.6e-6;  // 1/K
    this.ECu = 120e9;       // Pa (120 GPa)
    this.nuCu = 0.343;      // Poisson's ratio
    this.kB = 8.617333262145e-5; // eV/K

    this.state = {
      preset: 'tsmc-soic',
      pitch: 0.9,
      padDiameter: 0.5,
      padHeight: 1.2,
      cmpDishing: 3.0,
      annealTemp: 300,
      opTemp: 85,
      dielectric: 'sicn',
      tech: 'antifuse'
    };

    this.initDOM();
    this.bindEvents();
    this.update();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="cu-bonding-card" style="background: var(--surface, #111827); border: 1px solid var(--border-color, #374151); border-radius: 12px; padding: 24px; min-width: 0; overflow-wrap: anywhere; color: var(--text-color, #f3f4f6); font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="background: #2563eb; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase;">
                <span data-lang="zh">3D 先進封裝物理引擎</span><span data-lang="en">3D Packaging Physics Engine</span>
              </span>
              <span style="color: #10b981; font-size: 11px; font-weight: 600;"><span data-lang="zh">工程示意模型</span><span data-lang="en">Engineering Teaching Model</span></span>
            </div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 700;">
              <span data-lang="zh">Cu-Cu 混合鍵合熱應變與位錯漏電模擬工作台</span>
              <span data-lang="en">Cu-Cu Hybrid Bonding Stress &amp; Dislocation Leakage Simulator</span>
            </h3>
            <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af; max-width: 720px;">
              <span data-lang="zh">第一性原理建模：CMP 銅凹陷熱膨脹閉合、退火降溫殘留熱應力、矽通道壓電漂移與 eNVM 禁制保留區 (KOZ) 邊界耐受度。</span>
              <span data-lang="en">First-principles simulation: CMP dishing closure, residual thermal stress, piezoresistive channel drift, and eNVM Keep-Out Zone (KOZ) tolerances.</span>
            </p>
          </div>
          <!-- Preset Buttons -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="cu-preset-container">
            ${Object.entries(this.presets).map(([k, p]) => `
              <button type="button" class="cu-btn-preset ${k === this.state.preset ? 'active' : ''}" data-preset="${k}" aria-label="${p.labelEn}" data-aria-en="${p.labelEn}" data-aria-zh="${p.labelZh}" style="background: ${k === this.state.preset ? '#2563eb' : '#1f2937'}; border: 1px solid ${k === this.state.preset ? '#60a5fa' : '#374151'}; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                <span data-lang="zh">${p.labelZh}</span><span data-lang="en">${p.labelEn}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Controls Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <!-- Slider 1: Annealing Temp -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">鍵合退火溫度 (T_anneal)</span><span data-lang="en">Anneal Temp (T_anneal)</span></span>
              <span id="cu-val-anneal" style="color: #60a5fa; font-family: monospace; font-weight: 700;">300 °C</span>
            </div>
            <input type="range" id="cu-slide-anneal" min="150" max="380" step="5" value="${this.state.annealTemp}" aria-label="Annealing Temperature" data-aria-en="Annealing Temperature" data-aria-zh="鍵合退火溫度" style="width: 100%; accent-color: #2563eb;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">150°C (低溫活化)</span><span data-lang="en">150°C (Low-T)</span></span>
              <span><span data-lang="zh">380°C (極限高溫)</span><span data-lang="en">380°C (High-T)</span></span>
            </div>
          </div>

          <!-- Slider 2: CMP Dishing -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">CMP 銅微凹陷深度 (d_dish)</span><span data-lang="en">CMP Cu Dishing (d_dish)</span></span>
              <span id="cu-val-dishing" style="color: #60a5fa; font-family: monospace; font-weight: 700;">3.0 nm</span>
            </div>
            <input type="range" id="cu-slide-dishing" min="0.5" max="8.0" step="0.1" value="${this.state.cmpDishing}" aria-label="CMP Dishing" data-aria-en="CMP Dishing" data-aria-zh="CMP 銅微凹陷深度" style="width: 100%; accent-color: #2563eb;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">0.5 nm (完美研磨)</span><span data-lang="en">0.5 nm (Flat)</span></span>
              <span><span data-lang="zh">8.0 nm (重度凹陷)</span><span data-lang="en">8.0 nm (Deep)</span></span>
            </div>
          </div>

          <!-- Slider 3: Pad Height / Thickness -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">鍵合銅柱厚度 (h_pad)</span><span data-lang="en">Cu Pad Height (h_pad)</span></span>
              <span id="cu-val-height" style="color: #60a5fa; font-family: monospace; font-weight: 700;">1.2 μm</span>
            </div>
            <input type="range" id="cu-slide-height" min="0.4" max="3.0" step="0.1" value="${this.state.padHeight}" aria-label="Pad Height" data-aria-en="Pad Height" data-aria-zh="鍵合銅柱厚度" style="width: 100%; accent-color: #2563eb;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">0.4 μm (超薄)</span><span data-lang="en">0.4 μm (Thin)</span></span>
              <span><span data-lang="zh">3.0 μm (厚銅)</span><span data-lang="en">3.0 μm (Thick)</span></span>
            </div>
          </div>

          <!-- Slider 4: Operating Temp -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">運作環境結溫 (T_op)</span><span data-lang="en">Operating Temp (T_op)</span></span>
              <span id="cu-val-optemp" style="color: #60a5fa; font-family: monospace; font-weight: 700;">85 °C</span>
            </div>
            <input type="range" id="cu-slide-optemp" min="25" max="150" step="5" value="${this.state.opTemp}" aria-label="Operating Junction Temp" data-aria-en="Operating Junction Temp" data-aria-zh="運作環境結溫" style="width: 100%; accent-color: #2563eb;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">25°C (室溫)</span><span data-lang="en">25°C (Room)</span></span>
              <span><span data-lang="zh">150°C (高溫車規)</span><span data-lang="en">150°C (Auto Grade)</span></span>
            </div>
          </div>

          <!-- Select 1: Memory Tech -->
          <div>
            <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">
              <span data-lang="zh">受測堆疊 eNVM 技術</span><span data-lang="en">Evaluated eNVM Technology</span>
            </label>
            <select id="cu-sel-tech" aria-label="eNVM Technology" data-aria-en="eNVM Technology" data-aria-zh="受測堆疊 eNVM 技術" style="width: 100%; background: #1f2937; border: 1px solid #374151; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px;">
              <option value="antifuse">AntiFuse OTP</option>
              <option value="mram">STT-MRAM</option>
              <option value="reram">Oxide ReRAM</option>
              <option value="eflash">eFlash</option>
            </select>
          </div>

          <!-- Select 2: Dielectric Liner -->
          <div>
            <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">
              <span data-lang="zh">周圍微觀介電質襯層</span><span data-lang="en">Surrounding Dielectric Liner</span>
            </label>
            <select id="cu-sel-diel" aria-label="Dielectric Liner" data-aria-en="Dielectric Liner" data-aria-zh="周圍微觀介電質襯層" style="width: 100%; background: #1f2937; border: 1px solid #374151; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px;">
              <option value="sicn">SiCN (High-Density Cap)</option>
              <option value="sio2">SiO2 (PECVD)</option>
              <option value="sio2-lowt">SiO2 (Low-T Plasma)</option>
            </select>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 12px; margin-bottom: 20px;">
          <!-- Metric 1: Closure Margin -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">退火熱膨脹突出 / 間隙裕度</span><span data-lang="en">Thermal Expansion / Gap Margin</span>
            </div>
            <div id="cu-out-margin" style="font-size: 18px; font-weight: 700; color: #38bdf8; font-family: monospace;">+1.42 nm</div>
            <div id="cu-out-void-status" style="font-size: 11px; margin-top: 4px; font-weight: 600;"></div>
          </div>

          <!-- Metric 2: Peak Thermal Stress -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">室溫殘留界面峰值應力 (σ_peak)</span><span data-lang="en">Residual Peak Stress (σ_peak)</span>
            </div>
            <div id="cu-out-stress" style="font-size: 18px; font-weight: 700; color: #f59e0b; font-family: monospace;">342 MPa</div>
            <div id="cu-out-stress-class" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">
              <span data-lang="zh">雙軸張應力 (Tensile)</span><span data-lang="en">Biaxial Tensile</span>
            </div>
          </div>

          <!-- Metric 3: Piezoresistive Vth Shift -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">壓電效應通道電壓偏移 (ΔV_th)</span><span data-lang="en">Piezoresistive ΔV_th Shift</span>
            </div>
            <div id="cu-out-vth" style="font-size: 18px; font-weight: 700; color: #ec4899; font-family: monospace;">41.0 mV</div>
            <div id="cu-out-mobility" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Δμ / μ = -6.8%</div>
          </div>

          <!-- Metric 4: KOZ Safe Radius -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">陣列禁制保留區半徑 (KOZ)</span><span data-lang="en">Safe Keep-Out Zone (KOZ)</span>
            </div>
            <div id="cu-out-koz" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">1.15 μm</div>
            <div id="cu-out-rating" style="font-size: 11px; margin-top: 4px;"></div>
          </div>
        </div>

        <!-- Dual Canvas Visualizations -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Canvas 1: Cross-Section Voiding & Closure Heatmap -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 1：Cu 焊盤退火微觀界面形變與微空洞閉合剖面</span>
                <span data-lang="en">Fig 1: Cu Pad Interface Deformation &amp; Void Closure Profile</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Cross-Sectional FEA</span>
            </div>
            <div style="overflow-x: auto;" tabindex="0" role="region" aria-label="${window.HubLanguage?.get() === 'zh' ? '銅焊盤剖面圖，可橫向捲動' : 'Copper pad cross-section, horizontally scrollable'}" data-aria-zh="銅焊盤剖面圖，可橫向捲動" data-aria-en="Copper pad cross-section, horizontally scrollable">
              <canvas id="cu-canvas-cross" width="460" height="240" style="width: 100%; min-width: 460px; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            </div>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">藍色：未閉合奈米間隙</span><span data-lang="en">Blue: Unclosed Nanogap</span></span>
              <span><span data-lang="zh">金黃/綠：金屬原子擴散接合面</span><span data-lang="en">Gold/Green: Atomic Diffusion Joint</span></span>
            </div>
          </div>

          <!-- Canvas 2: Radial Stress Decay vs KOZ Distance -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 2：徑向應力衰減曲線 σ(r) 與 eNVM 耐受邊界</span>
                <span data-lang="en">Fig 2: Radial Stress Decay σ(r) vs eNVM Tolerance Threshold</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Decay ~ (r0/r)^2.2</span>
            </div>
            <div style="overflow-x: auto;" tabindex="0" role="region" aria-label="${window.HubLanguage?.get() === 'zh' ? '徑向應力圖，可橫向捲動' : 'Radial stress chart, horizontally scrollable'}" data-aria-zh="徑向應力圖，可橫向捲動" data-aria-en="Radial stress chart, horizontally scrollable">
              <canvas id="cu-canvas-stress" width="460" height="240" style="width: 100%; min-width: 460px; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            </div>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">紅線：機械應力衰減</span><span data-lang="en">Red: Mechanical Stress Decay</span></span>
              <span><span data-lang="zh">綠虛線：eNVM 安全閾值與 KOZ</span><span data-lang="en">Green Dash: Safe Threshold &amp; KOZ</span></span>
            </div>
          </div>
        </div>

        <!-- Physical Verdict Callout -->
        <div id="cu-verdict-box" style="background: rgba(37, 99, 235, 0.1); border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.5;">
          <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;" id="cu-verdict-title">
            <span data-lang="zh">物理整合研判與微縮架構指導</span>
            <span data-lang="en">Physical Integration Verdict &amp; Scaling Guidance</span>
          </div>
          <div id="cu-verdict-desc" style="color: #d1d5db;"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Preset Buttons
    this.container.querySelectorAll('.cu-btn-preset').forEach(btn => {
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

    bindSlider('#cu-slide-anneal', 'annealTemp', '#cu-val-anneal', '°C');
    bindSlider('#cu-slide-dishing', 'cmpDishing', '#cu-val-dishing', 'nm', v => v.toFixed(1));
    bindSlider('#cu-slide-height', 'padHeight', '#cu-val-height', 'μm', v => v.toFixed(1));
    bindSlider('#cu-slide-optemp', 'opTemp', '#cu-val-optemp', '°C');

    // Selects
    const selTech = this.container.querySelector('#cu-sel-tech');
    if (selTech) {
      selTech.addEventListener('change', (e) => {
        this.state.tech = e.target.value;
        this.update();
      });
    }

    const selDiel = this.container.querySelector('#cu-sel-diel');
    if (selDiel) {
      selDiel.addEventListener('change', (e) => {
        this.state.dielectric = e.target.value;
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
      pitch: p.pitch,
      padDiameter: p.padDiameter,
      padHeight: p.padHeight,
      cmpDishing: p.cmpDishing,
      annealTemp: p.annealTemp,
      opTemp: p.opTemp,
      dielectric: p.dielectric,
      tech: p.tech
    };

    // Update Slider inputs
    this.container.querySelector('#cu-slide-anneal').value = p.annealTemp;
    this.container.querySelector('#cu-val-anneal').textContent = `${p.annealTemp} °C`;

    this.container.querySelector('#cu-slide-dishing').value = p.cmpDishing;
    this.container.querySelector('#cu-val-dishing').textContent = `${p.cmpDishing.toFixed(1)} nm`;

    this.container.querySelector('#cu-slide-height').value = p.padHeight;
    this.container.querySelector('#cu-val-height').textContent = `${p.padHeight.toFixed(1)} μm`;

    this.container.querySelector('#cu-slide-optemp').value = p.opTemp;
    this.container.querySelector('#cu-val-optemp').textContent = `${p.opTemp} °C`;

    this.container.querySelector('#cu-sel-tech').value = p.tech;
    this.container.querySelector('#cu-sel-diel').value = p.dielectric;

    // Highlight Preset Button
    this.container.querySelectorAll('.cu-btn-preset').forEach(btn => {
      const active = btn.getAttribute('data-preset') === presetKey;
      btn.style.background = active ? '#2563eb' : '#1f2937';
      btn.style.borderColor = active ? '#60a5fa' : '#374151';
    });

    this.update();
  }

  computePhysics() {
    const s = this.state;
    const diel = this.dielectrics[s.dielectric] || this.dielectrics['sicn'];
    const tech = this.techProfiles[s.tech] || this.techProfiles['antifuse'];

    // 1. Dishing Gap and Thermal Expansion Closure
    const T0 = 25;
    const deltaT_anneal = Math.max(0, s.annealTemp - T0);
    const initialGap = 2 * s.cmpDishing; // nm

    const singleProtrusionNm = (s.padHeight * 1e-6) * (this.alphaCu - diel.cte) * deltaT_anneal * 1e9;
    const totalExpansionNm = 2 * singleProtrusionNm;
    const closureMarginNm = totalExpansionNm - initialGap;

    let voidRisk = 'none';
    if (closureMarginNm >= 1.5) {
      voidRisk = 'none';
    } else if (closureMarginNm >= 0) {
      voidRisk = 'marginal';
    } else if (closureMarginNm >= -1.5) {
      voidRisk = 'high';
    } else {
      voidRisk = 'fatal';
    }

    // 2. Residual Thermal Stress on Cooldown from T_anneal to T_op
    const deltaT_cool = Math.max(0, s.annealTemp - s.opTemp);
    const biaxialModulus = this.ECu / (1 - this.nuCu); // Pa
    const thermalStrain = (this.alphaCu - this.alphaSi) * deltaT_cool;
    const sigmaPeakPa = biaxialModulus * thermalStrain;
    const sigmaPeakMPa = sigmaPeakPa / 1e6;

    // 3. Piezoresistive Effect on Underlying Transistor Channel
    const rPadUm = s.padDiameter / 2;
    const mobilityShiftPct = -(tech.piezoSensitivity * (sigmaPeakMPa / 20));
    const vthShiftMv = tech.piezoSensitivity * sigmaPeakMPa * 0.45;

    // 4. Stress Induced Leakage & Keep-Out Zone (KOZ)
    let kozDistanceUm = 0;
    if (sigmaPeakMPa > tech.sigmaLimit) {
      const ratio = sigmaPeakMPa / tech.sigmaLimit;
      kozDistanceUm = rPadUm * (Math.pow(ratio, 1 / 2.2) - 1);
    } else {
      kozDistanceUm = rPadUm * 0.2;
    }
    const finalKozUm = Math.max(0.2, (kozDistanceUm + rPadUm) * tech.minKozFactor);
    const topKelvin = s.opTemp + 273.15;
    const thermalEnergyEv = this.kB * topKelvin;
    const betaStress = tech.leakageSensitivity * 0.026;
    const leakageSurgeFactor = Math.exp((betaStress * sigmaPeakMPa) / thermalEnergyEv);

    return {
      initialGap,
      totalExpansionNm,
      closureMarginNm,
      voidRisk,
      sigmaPeakMPa,
      mobilityShiftPct,
      vthShiftMv,
      finalKozUm,
      leakageSurgeFactor,
      rPadUm,
      diel,
      tech
    };
  }

  update() {
    const physics = this.computePhysics();

    // Update Output Cards
    const outMargin = this.container.querySelector('#cu-out-margin');
    if (outMargin) {
      const sign = physics.closureMarginNm >= 0 ? '+' : '';
      outMargin.textContent = `${sign}${physics.closureMarginNm.toFixed(2)} nm`;
      outMargin.style.color = physics.closureMarginNm >= 0 ? '#38bdf8' : '#ef4444';
    }

    const outVoid = this.container.querySelector('#cu-out-void-status');
    if (outVoid) {
      if (physics.voidRisk === 'none') {
        outVoid.innerHTML = `<span style="color: #10b981;"><span data-lang="zh">● 完美閉合 (無奈米微空洞)</span><span data-lang="en">● Full Closure (Zero Nanovoids)</span></span>`;
      } else if (physics.voidRisk === 'marginal') {
        outVoid.innerHTML = `<span style="color: #f59e0b;"><span data-lang="zh">▲ 臨界閉合 (微弱接合壓力)</span><span data-lang="en">▲ Marginal Closure (Low Pressure)</span></span>`;
      } else if (physics.voidRisk === 'high') {
        outVoid.innerHTML = `<span style="color: #f97316;"><span data-lang="zh">■ 高空洞風險 (殘留間隙)</span><span data-lang="en">■ High Void Risk (Residual Gap)</span></span>`;
      } else {
        outVoid.innerHTML = `<span style="color: #ef4444;"><span data-lang="zh">✕ 鍵合失效 (開路奈米裂縫)</span><span data-lang="en">✕ Bond Failure (Open Nanocrack)</span></span>`;
      }
    }

    const outStress = this.container.querySelector('#cu-out-stress');
    if (outStress) {
      outStress.textContent = `${Math.round(physics.sigmaPeakMPa)} MPa`;
      outStress.style.color = physics.sigmaPeakMPa > physics.tech.sigmaLimit ? '#ef4444' : '#f59e0b';
    }

    const outVth = this.container.querySelector('#cu-out-vth');
    if (outVth) {
      outVth.textContent = `${physics.vthShiftMv.toFixed(1)} mV`;
    }

    const outMobility = this.container.querySelector('#cu-out-mobility');
    if (outMobility) {
      outMobility.textContent = `Δμ / μ = ${physics.mobilityShiftPct.toFixed(1)}%`;
    }

    const outKoz = this.container.querySelector('#cu-out-koz');
    if (outKoz) {
      outKoz.textContent = `${physics.finalKozUm.toFixed(2)} μm`;
    }

    const outRating = this.container.querySelector('#cu-out-rating');
    if (outRating) {
      if (this.state.tech === 'antifuse') {
        outRating.innerHTML = `<span style="color: #10b981; font-weight: 600;"><span data-lang="zh">優異 (FEOL 高溫相容 / 緊鄰焊盤)</span><span data-lang="en">PREFERRED (FEOL High-T / Minimal KOZ)</span></span>`;
      } else if (this.state.tech === 'mram') {
        outRating.innerHTML = `<span style="color: #60a5fa; font-weight: 600;"><span data-lang="zh">良好 (需控制退火熱預算)</span><span data-lang="en">COMPATIBLE (Controlled BEOL Budget)</span></span>`;
      } else if (this.state.tech === 'reram') {
        outRating.innerHTML = `<span style="color: #f59e0b; font-weight: 600;"><span data-lang="zh">中等 (需低溫鍵合或 Forming 補償)</span><span data-lang="en">MODERATE (Low-T Bonding / Forming Margin)</span></span>`;
      } else {
        outRating.innerHTML = `<span style="color: #ef4444; font-weight: 600;"><span data-lang="zh">受限 (需注意 SILC 漏電與退火熱預算)</span><span data-lang="en">CONSTRAINED (SILC & Anneal Budget Control)</span></span>`;
      }
    }

    // Update Verdict Box
    const vDesc = this.container.querySelector('#cu-verdict-desc');
    if (vDesc) {
      let verdictZh = '';
      let verdictEn = '';
      if (physics.voidRisk === 'fatal' || physics.voidRisk === 'high') {
        verdictZh = `警告：CMP 微凹陷 (${this.state.cmpDishing.toFixed(1)}nm) 超過退火膨脹能填補之極限 (${physics.totalExpansionNm.toFixed(1)}nm)，鍵合界面將產生殘留奈米微空洞，導致開路或接觸阻抗急遽升高。建議提高退火溫度或增加銅柱厚度。`;
        verdictEn = `Warning: CMP dishing (${this.state.cmpDishing.toFixed(1)}nm) exceeds thermal expansion closure (${physics.totalExpansionNm.toFixed(1)}nm), forming interface nanovoids. Increase annealing temperature or copper thickness.`;
      } else if (this.state.tech === 'eflash' && physics.sigmaPeakMPa > 220) {
        verdictZh = `工程注意：浮閘/電荷捕捉 eFlash 受到較大熱應力 (${Math.round(physics.sigmaPeakMPa)} MPa)，穿隧氧化層易產生缺陷陷阱，應力誘發漏電 (SILC) 增加約 ${Math.round(physics.leakageSurgeFactor)} 倍。在 3D 混合鍵合設計中，需加大保留區 (KOZ 建議 >= ${physics.finalKozUm.toFixed(2)} μm) 並嚴格控管退火熱預算。`;
        verdictEn = `Engineering Caution: Floating-gate/CT eFlash subjected to significant thermal stress (${Math.round(physics.sigmaPeakMPa)} MPa) may induce oxide defect traps, elevating SILC leakage by ~${Math.round(physics.leakageSurgeFactor)}x. In 3D hybrid bonding designs, enlarge keep-out zone (KOZ >= ${physics.finalKozUm.toFixed(2)} μm) and tightly budget annealing thermal exposure.`;
      } else {
        verdictZh = `設計評估合格：${physics.tech.nameZh} 搭配當前 3D 混合鍵合製程，界面微凹陷順利閉合 (${physics.closureMarginNm >= 0 ? '+' : ''}${physics.closureMarginNm.toFixed(2)}nm 裕度)。陣列安全邊界 KOZ 建議設定為 ${physics.finalKozUm.toFixed(2)} μm，以緩解 Cu 鍵合焊盤所誘發之壓電電阻閾值電壓漂移 (${physics.vthShiftMv.toFixed(1)} mV)。`;
        verdictEn = `Design Qualified: ${physics.tech.nameEn} under current 3D hybrid bonding successfully closes CMP dishing with ${physics.closureMarginNm.toFixed(2)}nm margin. Recommended array Keep-Out Zone (KOZ) is ${physics.finalKozUm.toFixed(2)} μm to mitigate piezoresistive threshold drift (${physics.vthShiftMv.toFixed(1)} mV).`;
      }

      vDesc.innerHTML = `<span data-lang="zh">${verdictZh}</span><span data-lang="en">${verdictEn}</span>`;
    }

    this.renderCanvasCross(physics);
    this.renderCanvasStress(physics);
  }

  renderCanvasCross(p) {
    const canvas = this.container.querySelector('#cu-canvas-cross');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Geometry Scaling
    const midY = h / 2;
    const padW = Math.max(80, Math.min(220, p.rPadUm * 2 * 120));
    const padX = (w - padW) / 2;
    const padHalfH = 65;

    // 1. Top & Bottom Dielectric Layers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, midY - padHalfH - 20, padX - 20, padHalfH + 20);
    ctx.fillRect(padX + padW, midY - padHalfH - 20, w - padX - padW - 20, padHalfH + 20);
    ctx.fillRect(20, midY, padX - 20, padHalfH + 20);
    ctx.fillRect(padX + padW, midY, w - padX - padW - 20, padHalfH + 20);

    // Labels for Dielectrics
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(`${p.diel.name}`, 30, midY - 10);
    ctx.fillText('Top Wafer', 30, midY - 60);
    ctx.fillText('Bottom Wafer', 30, midY + 70);

    // 2. Copper Pads (Top & Bottom)
    const dishingVisualPx = Math.min(18, p.initialGap * 1.5);
    const expansionVisualPx = Math.min(22, p.totalExpansionNm * 1.5);
    const residualGapPx = Math.max(0, dishingVisualPx - expansionVisualPx);

    const gradTop = ctx.createLinearGradient(padX, midY - padHalfH, padX + padW, midY);
    gradTop.addColorStop(0, '#b45309');
    gradTop.addColorStop(0.5, '#f59e0b');
    gradTop.addColorStop(1, '#d97706');
    ctx.fillStyle = gradTop;

    ctx.beginPath();
    ctx.moveTo(padX, midY - padHalfH);
    ctx.lineTo(padX + padW, midY - padHalfH);
    ctx.lineTo(padX + padW, midY - residualGapPx / 2);
    ctx.quadraticCurveTo(padX + padW / 2, midY - residualGapPx / 2 - (residualGapPx > 0 ? dishingVisualPx / 2 : 0), padX, midY - residualGapPx / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const gradBot = ctx.createLinearGradient(padX, midY, padX + padW, midY + padHalfH);
    gradBot.addColorStop(0, '#d97706');
    gradBot.addColorStop(0.5, '#f59e0b');
    gradBot.addColorStop(1, '#b45309');
    ctx.fillStyle = gradBot;

    ctx.beginPath();
    ctx.moveTo(padX, midY + padHalfH);
    ctx.lineTo(padX + padW, midY + padHalfH);
    ctx.lineTo(padX + padW, midY + residualGapPx / 2);
    ctx.quadraticCurveTo(padX + padW / 2, midY + residualGapPx / 2 + (residualGapPx > 0 ? dishingVisualPx / 2 : 0), padX, midY + residualGapPx / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Interface Bonding / Void Annotation
    if (residualGapPx > 1.5) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(padX + 10, midY - residualGapPx / 2, padW - 20, residualGapPx);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 10, midY - residualGapPx / 2, padW - 20, residualGapPx);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`UNCLOSED NANOVOID (${Math.abs(p.closureMarginNm).toFixed(1)} nm GAP)`, padX + padW / 2, midY + 4);
      ctx.textAlign = 'start';
    } else {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(padX, midY);
      ctx.lineTo(padX + padW, midY);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ATOMIC DIFFUSION JOINT (STRESS = ${Math.round(p.sigmaPeakMPa)} MPa)`, padX + padW / 2, midY - 6);
      ctx.textAlign = 'start';
    }

    // Stress Concentration Wings at Corners
    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(padX, midY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(padX + padW, midY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f87171';
    ctx.font = '9px monospace';
    ctx.fillText('Peak σ', padX - 35, midY + 3);
    ctx.fillText('Peak σ', padX + padW + 10, midY + 3);
  }

  renderCanvasStress(p) {
    const canvas = this.container.querySelector('#cu-canvas-stress');
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

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.fillText('Stress (MPa)', 5, padTop - 10);
    ctx.fillText('Distance from Pad Edge r (μm)', padLeft + plotW / 2 - 60, padTop + plotH + 28);

    const maxStress = Math.max(600, p.sigmaPeakMPa * 1.15);
    const maxR = 4.0;

    // Y ticks
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    for (let s = 100; s <= maxStress; s += 150) {
      const y = padTop + plotH - (s / maxStress) * plotH;
      ctx.beginPath(); ctx.moveTo(padLeft - 3, y); ctx.lineTo(padLeft, y); ctx.stroke();
      ctx.fillText(`${s}`, padLeft - 28, y + 3);

      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
      ctx.strokeStyle = '#475569';
    }

    // X ticks
    for (let r = 1.0; r <= maxR; r += 1.0) {
      const x = padLeft + (r / maxR) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padTop + plotH); ctx.lineTo(x, padTop + plotH + 3); ctx.stroke();
      ctx.fillText(`${r.toFixed(1)}`, x - 8, padTop + plotH + 14);
    }

    // Tech Tolerance Limit Horizontal Line
    const limitY = padTop + plotH - (p.tech.sigmaLimit / maxStress) * plotH;
    ctx.strokeStyle = '#f97316';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, limitY);
    ctx.lineTo(padLeft + plotW, limitY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f97316';
    ctx.font = '10px monospace';
    ctx.fillText(`Limit: ${p.tech.sigmaLimit} MPa (${p.tech.nameZh.split(' ')[0]})`, padLeft + plotW - 170, limitY - 4);

    // Curve: Radial Stress Decay
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const points = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const r = (i / steps) * maxR;
      const sigmaR = p.sigmaPeakMPa * Math.pow(p.rPadUm / (r + p.rPadUm), 2.2);
      const x = padLeft + (r / maxR) * plotW;
      const y = padTop + plotH - (Math.min(maxStress, sigmaR) / maxStress) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      points.push({ x, y, r, sigmaR });
    }
    ctx.stroke();

    // Mark Recommended KOZ
    const kozX = padLeft + (Math.min(maxR, p.finalKozUm) / maxR) * plotW;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(kozX, padTop);
    ctx.lineTo(kozX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // KOZ Label Flag
    ctx.fillStyle = '#10b981';
    ctx.fillRect(kozX - 35, padTop + 10, 70, 20);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`KOZ: ${p.finalKozUm.toFixed(2)}μm`, kozX, padTop + 24);
    ctx.textAlign = 'start';
  }

  updateBilingualLabels() {
    this.update();
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CuCuHybridBondingSimulator());
  } else {
    new CuCuHybridBondingSimulator();
  }
}
