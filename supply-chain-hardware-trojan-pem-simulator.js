/**
 * supply-chain-hardware-trojan-pem-simulator.js
 * 
 * 供應鏈硬體木馬、光學側信道 (Photon Emission Analysis, PEM / TRE)
 * 與物理不可仿冒指紋 (PUF Fingerprint) 認證模擬器 (TEST 91, Evidence V22)
 * 
 * First-Principles Models:
 * 1. Hot-Carrier Photon Emission & Optical Attenuation:
 *    I_photon = eta_emission * I_channel * exp( -d_si / lambda_opt )
 *    Attenuation_dB = 10 * log10( I_photon_unshielded / I_photon_measured )
 * 2. Hardware Trojan Detection & Silicon Fingerprinting:
 *    P_detect = 1 - (1 - f_sens)^N_samples
 * 3. PUF Randomness & Hamming Distance Distribution:
 *    Inter-Chip HD ~ Gaussian(mu = 50.0%, sigma = 2.1%)
 *    Intra-Chip Bit Flip Rate ~ Gaussian(mu = 0.6%, sigma = 0.2%)
 * 4. Zero-Trust Supply Chain Verification Grade:
 *    NIST SP 800-193 & ISO/IEC 20243 Assurance Score
 */

export class SupplyChainTrojanPemSimulator {
  constructor(containerId = 'trojan-pem-simulator-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.presets = {
      'zero-trust-audit': {
        labelZh: '零信任供應鏈稽核',
        labelEn: 'Zero-Trust Audit',
        nameZh: '零信任供應鏈威脅稽核 (高屏蔽與薄化矽基板模型)',
        nameEn: 'Zero-Trust Supply Chain Audit (High-Shielding & Thinned Si Model)',
        substrateThickUm: 8.0,
        opticalShieldDb: 45,
        trojanPayloadPpm: 50,
        tech: 'antifuse_puf',
        descZh: '模擬高安全晶片面對背面薄化矽基板光學發射 (PEM) 與微小硬體木馬之邊界條件。',
        descEn: 'Models high-security IC boundaries against backside thinned Si emission (PEM) and stealth trojans.'
      },
      'backside-tre-attack': {
        labelZh: '背面光學 TRE 攻擊',
        labelEn: 'Backside TRE Attack',
        nameZh: '背面近紅外時間分辨光子發射分析 (Backside NIR TRE / 28nm Logic)',
        nameEn: 'Backside NIR Time-Resolved Emission Attack (TRE / 28nm Logic)',
        substrateThickUm: 15.0,
        opticalShieldDb: 10,
        trojanPayloadPpm: 200,
        tech: 'eflash',
        descZh: '模擬攻擊者使用超導單光子探測器 (SNSPD) 透過背面薄化矽窗口還原內部信號。',
        descEn: 'Models attacker leveraging SNSPD through thinned silicon to recover internal switching.'
      },
      'dopant-trojan-hunt': {
        labelZh: '摻雜木馬威脅排查',
        labelEn: 'Dopant Trojan Hunt',
        nameZh: '不可信代工廠摻雜層木馬排查模型 (Becker 2013 威脅場景)',
        nameEn: 'Untrusted Foundry Dopant Trojan Hunt (Becker 2013 Threat Model)',
        substrateThickUm: 30.0,
        opticalShieldDb: 25,
        trojanPayloadPpm: 800,
        tech: 'sram_puf',
        descZh: '排查非光罩層或微觀摻雜極性修改之硬體木馬，評估物理指紋與統計測試之檢出能力。',
        descEn: 'Assesses detection capability for dopant-polarity Trojans via physical fingerprint testing.'
      },
      'iot-anti-cloning': {
        labelZh: '商業物聯網防偽',
        labelEn: 'IoT Anti-Cloning',
        nameZh: '物聯網裝置防仿冒與身分驗證 (PUF Identity Verification)',
        nameEn: 'IoT Anti-Counterfeiting & Identity Verification (PUF Identity)',
        substrateThickUm: 50.0,
        opticalShieldDb: 35,
        trojanPayloadPpm: 120,
        tech: 'mram',
        descZh: '邊緣裝置大量出貨時，透過晶片指紋防止供應鏈假冒換料與未授權超額生產。',
        descEn: 'Assesses identity verification against counterfeit substitution and unauthorized overproduction.'
      }
    };

    this.techProfiles = {
      antifuse_puf: {
        nameZh: '0-Mask AntiFuse 原生 PUF',
        nameEn: '0-Mask AntiFuse Native PUF',
        maskAdders: 0,
        baseEmissionRate: 12, // Photons/sec (low-current ohmic filament)
        shieldingFactor: 48, // dB model attenuation
        interHammingMean: 50.02, // %
        intraBitErrorRate: 0.25, // %
        trojanImmunity: '消除專屬光罩插入面；需防範摻雜層木馬',
        trojanImmunityEn: 'Eliminates dedicated mask vector; requires dopant defenses',
        descZh: '閘極氧化層微崩潰隨機特徵，標準邏輯製程無專用光罩插入面，微安級讀取電流發射微弱。',
        descEn: 'Oxide breakdown stochasticity; standard logic process eliminates dedicated mask insertion vector.'
      },
      sram_puf: {
        nameZh: 'SRAM 啟動狀態 PUF',
        nameEn: 'SRAM Power-Up PUF',
        maskAdders: 0,
        baseEmissionRate: 150,
        shieldingFactor: 18,
        interHammingMean: 49.3,
        intraBitErrorRate: 4.8, // Vulnerable to supply noise and temperature drift
        trojanImmunity: '免額外光罩；需防範供電噪訊與雷射 BBI 誘騙',
        trojanImmunityEn: 'No mask adders; requires anti-glitch & laser BBI filtering',
        descZh: '依賴未初始化正反器亞穩態，易受外部電源抖動誘騙，需配合強韌 ECC 糾錯。',
        descEn: 'Relies on uninitialized latch metastability; susceptible to power noise and laser injection.'
      },
      mram: {
        nameZh: 'STT-MRAM 磁阻隨機數',
        nameEn: 'STT-MRAM TRNG / MOKE',
        maskAdders: 4,
        baseEmissionRate: 85,
        shieldingFactor: 28,
        interHammingMean: 49.8,
        intraBitErrorRate: 1.8,
        trojanImmunity: 'BEOL 磁穿隧結隱蔽性高；需防範外部磁場與 MOKE',
        trojanImmunityEn: 'BEOL MTJ concealment; requires MOKE / magnetic shielding',
        descZh: '利用 MTJ 臨界翻轉隨機性，無明顯光學發射，但需防範磁光柯爾效應 (MOKE) 磁場探測。',
        descEn: 'Leverages MTJ switching stochasticity; minimal photon emission, but vulnerable to MOKE magnetic probes.'
      },
      eflash: {
        nameZh: '傳統 eFlash 儲存金鑰',
        nameEn: 'Conventional eFlash Key Store',
        maskAdders: 10,
        baseEmissionRate: 1200, // Elevated due to high-voltage charge pump & programming hot electrons
        shieldingFactor: 8,
        interHammingMean: 0.0, // Not a PUF, static stored bits
        intraBitErrorRate: 0.0,
        trojanImmunity: '具專屬高壓光罩攻擊面；高壓電荷泵需發射遮蔽',
        trojanImmunityEn: 'Dedicated HV mask vector; charge pump requires emission shielding',
        descZh: '高壓電荷泵在讀寫時產生較多碰撞電離光子，且額外光罩道數多增加客製層檢查負擔。',
        descEn: 'Charge pumps generate impact-ionization photons; dedicated masks add custom layer attack surface.'
      }
    };

    this.state = {
      preset: 'zero-trust-audit',
      substrateThickUm: 8.0,
      opticalShieldDb: 45,
      trojanPayloadPpm: 50,
      tech: 'antifuse_puf'
    };

    this.initDOM();
    this.bindEvents();
    this.update();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="trojan-pem-card" style="background: var(--surface, #111827); border: 1px solid var(--border-color, #374151); border-radius: 12px; padding: 24px; color: var(--text-color, #f3f4f6); font-family: system-ui, -apple-system, sans-serif;">
        <!-- Academic Model Disclaimer Banner -->
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 8px 12px; margin-bottom: 16px; border-radius: 0 4px 4px 0; font-size: 11.5px; line-height: 1.5; color: #f59e0b;">
          <span data-lang="zh">⚠️ 示意模擬模型：本工作台參數依據學術文獻（Becker 2013 摻雜木馬、Schlösser 2012 光學發射）與工程假設估算，非量產晶片實測保證。CC EAL 與 NIST 認證屬系統級 TOE 產品評估範疇，不可由儲存介質直接推定。</span>
          <span data-lang="en">⚠️ Exploratory Simulation: Parameters are derived from literature (Becker 2013, Schlösser 2012) and engineering assumptions, not silicon guarantees. CC EAL and NIST certifications apply to system-level TOE products and cannot be inferred from bitcell medium alone.</span>
        </div>

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="background: #9333ea; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase;">
                <span data-lang="zh">零信任供應鏈與光學防禦</span><span data-lang="en">Zero-Trust &amp; Optical Defense</span>
              </span>
              <span style="color: #10b981; font-size: 11px; font-weight: 600;">TEST 91 &amp; EVIDENCE V22</span>
            </div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 700;">
              <span data-lang="zh">供應鏈硬體木馬、光學側信道 (PEM) 與 PUF 認證模擬工作台</span>
              <span data-lang="en">Hardware Trojan, Optical PEM &amp; PUF Verification Simulator</span>
            </h3>
            <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af; max-width: 720px;">
              <span data-lang="zh">第一性原理建模：熱載子發光強度、背面矽基板光子穿透衰減、SNSPD 單光子偵測信噪比、硬體木馬檢出率與 0-Mask 原生 PUF 漢明距離分佈。</span>
              <span data-lang="en">First-principles physics: Hot-carrier luminescence, backside silicon transmission, SNSPD optical SNR, trojan detection probability, and 0-Mask PUF Hamming distribution.</span>
            </p>
          </div>
          <!-- Preset Buttons -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="trojan-preset-container">
            ${Object.entries(this.presets).map(([k, p]) => `
              <button type="button" class="trojan-btn-preset ${k === this.state.preset ? 'active' : ''}" data-preset="${k}" aria-label="${p.labelEn}" data-aria-en="${p.labelEn}" data-aria-zh="${p.labelZh}" style="background: ${k === this.state.preset ? '#9333ea' : '#1f2937'}; border: 1px solid ${k === this.state.preset ? '#c084fc' : '#374151'}; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                <span data-lang="zh">${p.labelZh}</span><span data-lang="en">${p.labelEn}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Controls Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <!-- Slider 1: Substrate Thickness -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">背面薄化矽基板厚度 (d_Si)</span><span data-lang="en">Backside Si Thickness (d_Si)</span></span>
              <span id="trojan-val-thick" style="color: #c084fc; font-family: monospace; font-weight: 700;">8.0 μm</span>
            </div>
            <input type="range" id="trojan-slide-thick" min="3.0" max="60.0" step="1.0" value="${this.state.substrateThickUm}" aria-label="Substrate Thickness" data-aria-en="Substrate Thickness" data-aria-zh="背面薄化矽基板厚度" style="width: 100%; accent-color: #9333ea;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">3.0 μm (極端薄化)</span><span data-lang="en">3.0 μm (Thinned)</span></span>
              <span><span data-lang="zh">60.0 μm (厚基板)</span><span data-lang="en">60.0 μm (Thick)</span></span>
            </div>
          </div>

          <!-- Slider 2: Optical Shield Attenuation -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">頂層/背面金屬主動遮蔽強度</span><span data-lang="en">Active Shield Attenuation</span></span>
              <span id="trojan-val-shield" style="color: #c084fc; font-family: monospace; font-weight: 700;">45 dB</span>
            </div>
            <input type="range" id="trojan-slide-shield" min="0" max="60" step="2" value="${this.state.opticalShieldDb}" aria-label="Shield Attenuation" data-aria-en="Shield Attenuation" data-aria-zh="金屬主動遮蔽強度" style="width: 100%; accent-color: #9333ea;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">0 dB (無屏蔽)</span><span data-lang="en">0 dB (None)</span></span>
              <span><span data-lang="zh">60 dB (軍規屏蔽網)</span><span data-lang="en">60 dB (Mil-Shield)</span></span>
            </div>
          </div>

          <!-- Slider 3: Trojan Target Size (PPM) -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="font-weight: 600;"><span data-lang="zh">硬體木馬植入比例 (PPM)</span><span data-lang="en">Trojan Payload Size (PPM)</span></span>
              <span id="trojan-val-ppm" style="color: #c084fc; font-family: monospace; font-weight: 700;">50 ppm</span>
            </div>
            <input type="range" id="trojan-slide-ppm" min="10" max="1000" step="10" value="${this.state.trojanPayloadPpm}" aria-label="Trojan Payload Size" data-aria-en="Trojan Payload Size" data-aria-zh="硬體木馬植入比例" style="width: 100%; accent-color: #9333ea;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
              <span><span data-lang="zh">10 ppm (微小隱蔽木馬)</span><span data-lang="en">10 ppm (Stealth)</span></span>
              <span><span data-lang="zh">1000 ppm (大負載木馬)</span><span data-lang="en">1000 ppm (Large)</span></span>
            </div>
          </div>

          <!-- Select 1: Security Architecture -->
          <div>
            <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">
              <span data-lang="zh">硬體信任根 / 儲存架構</span><span data-lang="en">Hardware Root-of-Trust</span>
            </label>
            <select id="trojan-sel-tech" aria-label="Root of Trust Architecture" data-aria-en="Root of Trust Architecture" data-aria-zh="硬體信任根儲存架構" style="width: 100%; background: #1f2937; border: 1px solid #374151; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px;">
              <option value="antifuse_puf">0-Mask AntiFuse 原生 PUF</option>
              <option value="sram_puf">SRAM 啟動狀態 PUF</option>
              <option value="mram">STT-MRAM 磁阻隨機數</option>
              <option value="eflash">傳統 eFlash 儲存金鑰</option>
            </select>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <!-- Metric 1: Optical Emission Leakage (Photons/s) -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">背面光子發射通量 (PEM)</span><span data-lang="en">Backside Photon Flux (PEM)</span>
            </div>
            <div id="trojan-out-photons" style="font-size: 18px; font-weight: 700; color: #38bdf8; font-family: monospace;">0.04 ph/s</div>
            <div id="trojan-out-snspd" style="font-size: 11px; margin-top: 4px; color: #94a3b8;"><span data-lang="zh">SNR &lt; -18 dB (噪聲淹沒)</span><span data-lang="en">SNR &lt; -18 dB (Below Noise)</span></div>
          </div>

          <!-- Metric 2: Trojan Detection Probability -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">硬體木馬偵測捕獲率</span><span data-lang="en">Trojan Detection Prob</span>
            </div>
            <div id="trojan-out-detect" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">99.98%</div>
            <div id="trojan-out-fp" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">FPR &lt; 0.01%</div>
          </div>

          <!-- Metric 3: PUF Inter-Chip Hamming Distance -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">晶片間漢明距離 (Inter-HD)</span><span data-lang="en">Inter-Chip Hamming Distance</span>
            </div>
            <div id="trojan-out-hd" style="font-size: 18px; font-weight: 700; color: #c084fc; font-family: monospace;">50.02% (理想)</div>
            <div id="trojan-out-intra" style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Intra-BER = 0.25%</div>
          </div>

          <!-- Metric 4: Modeled Protection Margin -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">模型防護餘量評估</span><span data-lang="en">Modeled Protection Margin</span>
            </div>
            <div id="trojan-out-tier" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">高防護餘量</div>
            <div id="trojan-out-rating" style="font-size: 11px; margin-top: 4px;"></div>
          </div>
        </div>

        <!-- Dual Canvas Visualizations -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Canvas 1: TRE Photon Count vs Clock Phase -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 1：時間分辨光子發射 (TRE) 時域波形與時鐘鎖相分佈</span>
                <span data-lang="en">Fig 1: Time-Resolved Emission (TRE) Waveform &amp; Clock Profile</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Picosecond TRE</span>
            </div>
            <canvas id="trojan-canvas-tre" width="460" height="240" style="width: 100%; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">紅峰值：電晶體開關發光</span><span data-lang="en">Red Peak: Switching Emission</span></span>
              <span><span data-lang="zh">紫線：遮蔽後探測噪訊底</span><span data-lang="en">Purple: Shielded Noise Floor</span></span>
            </div>
          </div>

          <!-- Canvas 2: PUF Hamming Distance Gaussian Distribution -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                <span data-lang="zh">圖 2：PUF 指紋漢明距離分佈 (Inter vs Intra HD)</span>
                <span data-lang="en">Fig 2: PUF Fingerprint Hamming Distribution (Inter vs Intra)</span>
              </span>
              <span style="font-size: 10px; color: #64748b;">Gaussian PDF</span>
            </div>
            <canvas id="trojan-canvas-puf" width="460" height="240" style="width: 100%; height: auto; display: block; border-radius: 4px; background: #020617;"></canvas>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
              <span><span data-lang="zh">綠峰：晶片間隨機性 (50%)</span><span data-lang="en">Green: Inter-Chip (50%)</span></span>
              <span><span data-lang="zh">藍峰：晶片內穩定度 (&lt;1%)</span><span data-lang="en">Blue: Intra-Chip (&lt;1%)</span></span>
            </div>
          </div>
        </div>

        <!-- Physical Verdict Callout -->
        <div id="trojan-verdict-box" style="background: rgba(147, 51, 234, 0.1); border-left: 4px solid #9333ea; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.5;">
          <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;" id="trojan-verdict-title">
            <span data-lang="zh">零信任供應鏈與光學防禦物理研判</span>
            <span data-lang="en">Zero-Trust Supply Chain &amp; Optical Defense Verdict</span>
          </div>
          <div id="trojan-verdict-desc" style="color: #d1d5db;"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.trojan-btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        if (this.presets[presetKey]) {
          this.applyPreset(presetKey);
        }
      });
    });

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

    bindSlider('#trojan-slide-thick', 'substrateThickUm', '#trojan-val-thick', 'μm', v => v.toFixed(1));
    bindSlider('#trojan-slide-shield', 'opticalShieldDb', '#trojan-val-shield', 'dB');
    bindSlider('#trojan-slide-ppm', 'trojanPayloadPpm', '#trojan-val-ppm', 'ppm');

    const selTech = this.container.querySelector('#trojan-sel-tech');
    if (selTech) {
      selTech.addEventListener('change', (e) => {
        this.state.tech = e.target.value;
        this.update();
      });
    }

    window.addEventListener('languagechange', () => {
      this.updateBilingualLabels();
      this.update();
    });
    window.addEventListener('hub:language-change', () => {
      this.updateBilingualLabels();
      this.update();
    });
    window.addEventListener('resize', () => {
      this.update();
    });
  }

  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;
    this.state = {
      preset: presetKey,
      substrateThickUm: p.substrateThickUm,
      opticalShieldDb: p.opticalShieldDb,
      trojanPayloadPpm: p.trojanPayloadPpm,
      tech: p.tech
    };

    this.container.querySelector('#trojan-slide-thick').value = p.substrateThickUm;
    this.container.querySelector('#trojan-val-thick').textContent = `${p.substrateThickUm.toFixed(1)} μm`;

    this.container.querySelector('#trojan-slide-shield').value = p.opticalShieldDb;
    this.container.querySelector('#trojan-val-shield').textContent = `${p.opticalShieldDb} dB`;

    this.container.querySelector('#trojan-slide-ppm').value = p.trojanPayloadPpm;
    this.container.querySelector('#trojan-val-ppm').textContent = `${p.trojanPayloadPpm} ppm`;

    this.container.querySelector('#trojan-sel-tech').value = p.tech;

    this.container.querySelectorAll('.trojan-btn-preset').forEach(btn => {
      const active = btn.getAttribute('data-preset') === presetKey;
      btn.style.background = active ? '#9333ea' : '#1f2937';
      btn.style.borderColor = active ? '#c084fc' : '#374151';
    });

    this.update();
  }

  computePhysics() {
    const s = this.state;
    const tech = this.techProfiles[s.tech] || this.techProfiles['antifuse_puf'];

    // 1. Hot-Carrier Photon Emission & Substrate Absorption
    // Silicon absorption depth for NIR (lambda ~ 1064nm): lambda_opt ~ 20 um (Schlösser et al. CHES 2012)
    const lambdaOptUm = 20.0;
    const substrateAbsorptionFactor = Math.exp(-s.substrateThickUm / lambdaOptUm);
    const totalShieldingDb = s.opticalShieldDb + tech.shieldingFactor;
    const shieldAttenuationFactor = Math.pow(10, -totalShieldingDb / 10);

    // Measured Photon flux (photons / sec)
    const measuredFlux = tech.baseEmissionRate * substrateAbsorptionFactor * shieldAttenuationFactor;
    // Dark count rate for SNSPD is ~ 5.0 cps. If measuredFlux < 0.5 cps, it is buried under detector noise
    const snrDb = 10 * Math.log10(Math.max(1e-4, measuredFlux / 5.0));

    // 2. Hardware Trojan Detection (Continuous Poisson coverage model)
    // Trojan payload scaling: larger footprint -> higher detection sensitivity
    const ppmNormalized = Math.min(1.0, Math.max(0.01, s.trojanPayloadPpm / 1000));
    // Architecture base inspectability (0.6 - 0.9):
    // 0-mask standard CMOS has strict DRC/OPC checking across identical standard cells.
    // Dedicated masks add verification vectors.
    const baseInspectability = tech.maskAdders === 0 ? 0.82 : Math.max(0.60, 0.82 - tech.maskAdders * 0.015);
    // Continuous detection probability: P = 1 - exp(-inspectability * (1 + 3 * ppm))
    const detectionProb = 1.0 - Math.exp(-baseInspectability * (0.8 + 2.5 * ppmNormalized));

    return {
      measuredFlux,
      snrDb,
      totalShieldingDb,
      detectionProb,
      tech
    };
  }

  update() {
    const p = this.computePhysics();

    // 1. Photon Flux Output
    const outPhotons = this.container.querySelector('#trojan-out-photons');
    if (outPhotons) {
      if (p.measuredFlux < 0.1) {
        outPhotons.textContent = `${p.measuredFlux.toFixed(3)} ph/s`;
        outPhotons.style.color = '#10b981';
      } else if (p.measuredFlux < 10) {
        outPhotons.textContent = `${p.measuredFlux.toFixed(2)} ph/s`;
        outPhotons.style.color = '#f59e0b';
      } else {
        outPhotons.textContent = `${p.measuredFlux.toFixed(0)} ph/s`;
        outPhotons.style.color = '#ef4444';
      }
    }

    const outSnspd = this.container.querySelector('#trojan-out-snspd');
    if (outSnspd) {
      if (p.snrDb < -10) {
        outSnspd.innerHTML = `<span data-lang="zh">SNR = ${p.snrDb.toFixed(1)} dB (深埋噪聲)</span><span data-lang="en">SNR = ${p.snrDb.toFixed(1)} dB (Buried)</span>`;
      } else if (p.snrDb < 5) {
        outSnspd.innerHTML = `<span data-lang="zh">SNR = ${p.snrDb.toFixed(1)} dB (弱信號臨界)</span><span data-lang="en">SNR = ${p.snrDb.toFixed(1)} dB (Marginal)</span>`;
      } else {
        outSnspd.innerHTML = `<span style="color:#ef4444;"><span data-lang="zh">SNR = +${p.snrDb.toFixed(1)} dB (光子可被還原)</span><span data-lang="en">SNR = +${p.snrDb.toFixed(1)} dB (Vulnerable)</span></span>`;
      }
    }

    // 2. Trojan Detect
    const outDetect = this.container.querySelector('#trojan-out-detect');
    if (outDetect) {
      outDetect.textContent = `${(p.detectionProb * 100).toFixed(2)}%`;
      outDetect.style.color = p.detectionProb >= 0.90 ? '#10b981' : (p.detectionProb >= 0.75 ? '#f59e0b' : '#ef4444');
    }

    // 3. HD
    const outHd = this.container.querySelector('#trojan-out-hd');
    if (outHd) {
      if (p.tech.interHammingMean > 0) {
        outHd.innerHTML = `${p.tech.interHammingMean.toFixed(2)}% (<span data-lang="zh">理想均勻</span><span data-lang="en">Ideal</span>)`;
      } else {
        outHd.innerHTML = `<span style="color:#ef4444;"><span data-lang="zh">非 PUF (固定靜態存儲)</span><span data-lang="en">Non-PUF (Static)</span></span>`;
      }
    }

    const outIntra = this.container.querySelector('#trojan-out-intra');
    if (outIntra) {
      if (p.tech.interHammingMean > 0) {
        outIntra.textContent = `Intra-BER = ${p.tech.intraBitErrorRate.toFixed(2)}%`;
      } else {
        outIntra.innerHTML = `<span data-lang="zh">無物理指紋特性</span><span data-lang="en">No Fingerprint</span>`;
      }
    }

    // 4. Rating (Modeled Margin, not fake certification)
    const outTier = this.container.querySelector('#trojan-out-tier');
    if (outTier) {
      if (p.snrDb < -10 && p.detectionProb >= 0.85) {
        outTier.innerHTML = '<span data-lang="zh">高防護餘量 (High Margin)</span><span data-lang="en">High Margin</span>';
        outTier.style.color = '#10b981';
      } else if (p.snrDb < 0 && p.detectionProb >= 0.70) {
        outTier.innerHTML = '<span data-lang="zh">中等防護 (Moderate)</span><span data-lang="en">Moderate</span>';
        outTier.style.color = '#f59e0b';
      } else {
        outTier.innerHTML = '<span data-lang="zh">需增強屏蔽 (Needs Shielding)</span><span data-lang="en">Needs Shielding</span>';
        outTier.style.color = '#ef4444';
      }
    }

    const outRating = this.container.querySelector('#trojan-out-rating');
    if (outRating) {
      outRating.innerHTML = `<span style="color: #94a3b8;"><span data-lang="zh">模型估算：SNR ${p.snrDb.toFixed(1)} dB · 檢出率 ${(p.detectionProb * 100).toFixed(1)}%</span><span data-lang="en">Model: SNR ${p.snrDb.toFixed(1)} dB · Detect ${(p.detectionProb * 100).toFixed(1)}%</span></span>`;
    }

    // 5. Verdict Box (Objective, referencing academic papers)
    const vDesc = this.container.querySelector('#trojan-verdict-desc');
    if (vDesc) {
      let verdictZh = '';
      let verdictEn = '';
      if (this.state.tech === 'eflash') {
        verdictZh = `模型分析：傳統 eFlash 的高壓電荷泵在讀寫時產生較強烈碰撞電離光子 (通量估算達 ${Math.round(p.measuredFlux)} ph/s)，背面時間分辨光子發射 (TRE) 在未充分屏蔽下較易被捕捉。且其包含多道額外光罩，增加客製層光罩比對檢查負擔。建議評估主動金屬網遮蔽。`;
        verdictEn = `Model Finding: Conventional eFlash charge pumps generate higher impact-ionization photons (~${Math.round(p.measuredFlux)} ph/s). Backside TRE detectors can capture switching signals if unshielded. Multiple mask adders also add custom-layer inspection overhead. Active metal shielding is recommended.`;
      } else if (this.state.tech === 'sram_puf') {
        verdictZh = `模型分析：SRAM PUF 無需額外光罩，但啟動狀態受外部電源噪訊與溫度梯度擾動 (Intra-BER 估算達 ${p.tech.intraBitErrorRate}%)。依據 Becker 2013 研究，若代工廠植入微觀摻雜極性木馬，需結合嚴格邏輯驗證與強韌 ECC 糾錯，不可僅依賴上電初始值。`;
        verdictEn = `Model Finding: SRAM PUF requires 0 mask adders, but startup states fluctuate with supply noise (Intra-BER ~${p.tech.intraBitErrorRate}%). Per Becker 2013, dopant-level Trojans require combined logic verification and robust ECC rather than relying solely on raw power-up values.`;
      } else {
        verdictZh = `模型分析：${p.tech.nameZh} 在當前參數下結合屏蔽與基板吸收 (${p.totalShieldingDb} dB)，光子通量估算降至 ${p.measuredFlux.toFixed(3)} ph/s (SNR 估算 ${p.snrDb.toFixed(1)} dB)。零額外光罩消除專屬層光罩插入面；但依據 Becker 2013 文獻，防範標準邏輯層摻雜木馬仍需系統級防禦責任鏈。`;
        verdictEn = `Model Finding: ${p.tech.nameEn} under modeled attenuation (${p.totalShieldingDb} dB) lowers photon flux to ${p.measuredFlux.toFixed(3)} ph/s (SNR ~${p.snrDb.toFixed(1)} dB). 0-Mask eliminates dedicated-layer mask insertion vectors; however, per Becker 2013, defending standard-cell dopant Trojans still requires composed system controls.`;
      }

      vDesc.innerHTML = `<span data-lang="zh">${verdictZh}</span><span data-lang="en">${verdictEn}</span>`;
    }

    this.renderCanvasTre(p);
    this.renderCanvasPuf(p);
  }

  renderCanvasTre(p) {
    const canvas = this.container.querySelector('#trojan-canvas-tre');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = canvas.clientWidth || 380;
    const cssH = canvas.clientHeight || 200;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const w = cssW;
    const h = cssH;

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
    ctx.fillText('Photon Count (CPS)', 5, padTop - 10);
    ctx.fillText('Clock Period (0 to 10 ns)', padLeft + plotW / 2 - 50, padTop + plotH + 28);

    // Y scale: 0 to 500 cps
    const maxCps = Math.max(100, Math.min(2000, p.measuredFlux * 1.5 + 50));
    for (let c = 50; c <= maxCps; c += Math.round(maxCps / 3)) {
      const y = padTop + plotH - (c / maxCps) * plotH;
      ctx.beginPath(); ctx.moveTo(padLeft - 3, y); ctx.lineTo(padLeft, y); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${c}`, padLeft - 26, y + 3);

      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
      ctx.strokeStyle = '#475569';
    }

    // X ticks: 0 to 10 ns
    for (let t = 2; t <= 10; t += 2) {
      const x = padLeft + (t / 10) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padTop + plotH); ctx.lineTo(x, padTop + plotH + 3); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${t}ns`, x - 8, padTop + plotH + 14);
    }

    // Baseline Noise Floor Line (Purple Dash @ 10 CPS)
    const noiseY = padTop + plotH - (10.0 / maxCps) * plotH;
    ctx.strokeStyle = '#a855f7';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, noiseY);
    ctx.lineTo(padLeft + plotW, noiseY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#a855f7';
    ctx.font = '9px monospace';
    ctx.fillText('SNSPD Dark Noise Floor (10 cps)', padLeft + plotW - 160, noiseY - 4);

    // TRE Waveform Curve
    // Peak at clock transitions (t = 2.5ns and t = 7.5ns)
    ctx.strokeStyle = p.measuredFlux > 20 ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 10.0;
      // Gaussian peaks at 2.5 and 7.5 ns
      const g1 = Math.exp(-Math.pow(t - 2.5, 2) / 0.15);
      const g2 = Math.exp(-Math.pow(t - 7.5, 2) / 0.15);
      const signalCps = 8.0 + p.measuredFlux * (g1 + g2 * 0.85);

      const x = padLeft + (t / 10.0) * plotW;
      const y = padTop + plotH - (Math.min(maxCps, signalCps) / maxCps) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Annotation
    ctx.fillStyle = p.measuredFlux > 20 ? '#ef4444' : '#10b981';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(`Peak: ${p.measuredFlux.toFixed(2)} ph/s (${p.snrDb < -5 ? 'Hidden' : 'Detectable'})`, padLeft + 15, padTop + 20);
  }

  renderCanvasPuf(p) {
    const canvas = this.container.querySelector('#trojan-canvas-puf');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = canvas.clientWidth || 380;
    const cssH = canvas.clientHeight || 200;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const w = cssW;
    const h = cssH;

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
    ctx.fillText('Probability Density', 5, padTop - 10);
    ctx.fillText('Hamming Distance (%)', padLeft + plotW / 2 - 50, padTop + plotH + 28);

    // X scale: 0% to 100%
    for (let xPct = 0; xPct <= 100; xPct += 20) {
      const x = padLeft + (xPct / 100) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padTop + plotH); ctx.lineTo(x, padTop + plotH + 3); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`${xPct}%`, x - 8, padTop + plotH + 14);
    }

    if (p.tech.interHammingMean <= 0) {
      // Non-PUF display
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NON-PUF ARCHITECTURE: ZERO PHYSICAL ENTROPY', padLeft + plotW / 2, padTop + plotH / 2);
      ctx.textAlign = 'start';
      return;
    }

    // 1. Plot Inter-Chip Gaussian Peak (Center ~ 50%, sigma ~ 2.5%)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const meanInter = p.tech.interHammingMean;
    const sigmaInter = 2.8;
    for (let i = 0; i <= 100; i++) {
      const xVal = i;
      const gauss = Math.exp(-Math.pow(xVal - meanInter, 2) / (2 * sigmaInter * sigmaInter));
      const x = padLeft + (xVal / 100) * plotW;
      const y = padTop + plotH - gauss * plotH * 0.85;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Plot Intra-Chip Bit Flip Peak (Center ~ 0.5-5%, sigma ~ 0.5%)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const meanIntra = p.tech.intraBitErrorRate;
    const sigmaIntra = 0.8;
    for (let i = 0; i <= 30; i++) {
      const xVal = i * 0.5;
      const gauss = Math.exp(-Math.pow(xVal - meanIntra, 2) / (2 * sigmaIntra * sigmaIntra));
      const x = padLeft + (xVal / 100) * plotW;
      const y = padTop + plotH - gauss * plotH * 0.85;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Vertical 50% Ideal Reference Line
    const idealX = padLeft + 0.5 * plotW;
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(idealX, padTop);
    ctx.lineTo(idealX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '9px monospace';
    ctx.fillText('Ideal Inter 50%', idealX + 4, padTop + 15);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Intra: ${meanIntra.toFixed(1)}%`, padLeft + 15, padTop + 35);
  }

  updateBilingualLabels() {
    this.update();
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SupplyChainTrojanPemSimulator());
  } else {
    new SupplyChainTrojanPemSimulator();
  }
}
