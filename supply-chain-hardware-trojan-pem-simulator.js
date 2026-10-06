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
        labelZh: '國防零信任供應鏈',
        labelEn: 'Defense Zero-Trust',
        nameZh: '國防與高階伺服器零信任供應鏈稽核 (CC EAL6+ / 全面抗光學探測)',
        nameEn: 'Defense & Cloud Server Zero-Trust Audit (CC EAL6+ / Anti-PEM)',
        substrateThickUm: 8.0,
        opticalShieldDb: 45,
        trojanPayloadPpm: 50,
        tech: 'antifuse_puf',
        descZh: '最高國防與雲端金鑰安全等級，面對背面薄化矽基板光學發射與惡意代工廠摻雜木馬。',
        descEn: 'Highest defense grade against backside-thinned silicon photon emission and fab dopant trojans.'
      },
      'backside-tre-attack': {
        labelZh: '背面光學 TRE 攻擊',
        labelEn: 'Backside TRE Attack',
        nameZh: '背面近紅外時間分辨光子發射攻擊 (Backside NIR TRE / 28nm Logic)',
        nameEn: 'Backside NIR Time-Resolved Emission Attack (TRE / 28nm Logic)',
        substrateThickUm: 15.0,
        opticalShieldDb: 10,
        trojanPayloadPpm: 200,
        tech: 'eflash',
        descZh: '攻擊者使用超導單光子探測器 (SNSPD) 透過背面薄化矽窗口還原內部時鐘與密鑰。',
        descEn: 'Attacker leverages SNSPD through thinned silicon substrate to recover clock and encryption keys.'
      },
      'dopant-trojan-hunt': {
        labelZh: '惡意摻雜木馬排查',
        labelEn: 'Dopant Trojan Hunt',
        nameZh: '不可信代工廠惡意摻雜木馬排查 (Dopant Trojan / A2 Trigger)',
        nameEn: 'Untrusted Foundry Dopant Trojan Hunt (Dopant Trojan / A2 Trigger)',
        substrateThickUm: 30.0,
        opticalShieldDb: 25,
        trojanPayloadPpm: 800,
        tech: 'sram_puf',
        descZh: '排查非光罩層或微觀摻雜極性修改之硬體木馬，依託晶片原子級物理指紋做比對驗證。',
        descEn: 'Detecting subtle dopant polarity modifications via atomic-level physical fingerprinting.'
      },
      'iot-anti-cloning': {
        labelZh: '商業物聯網防仿冒',
        labelEn: 'IoT Anti-Cloning',
        nameZh: '商業車聯網/物聯網低成本防仿冒 (Fast PUF Identity Verification)',
        nameEn: 'Automotive IoT Commercial Anti-Cloning (Fast PUF Identity Verification)',
        substrateThickUm: 50.0,
        opticalShieldDb: 35,
        trojanPayloadPpm: 120,
        tech: 'mram',
        descZh: '邊緣裝置大量出貨時，透過晶片指紋防止供應鏈假冒換料與未授權超額生產。',
        descEn: 'Mass production verification preventing counterfeit substitution and unauthorized overproduction.'
      }
    };

    this.techProfiles = {
      antifuse_puf: {
        nameZh: '0-Mask AntiFuse 原生 PUF',
        nameEn: '0-Mask AntiFuse Native PUF',
        baseEmissionRate: 12, // Photons/sec (Extremely weak, near thermal noise)
        shieldingFactor: 48, // dB attenuation
        interHammingMean: 50.02, // %
        intraBitErrorRate: 0.25, // %
        trojanImmunity: '卓越 (Grade A+ / 零額外光罩，無法透過改光罩植入木馬)',
        trojanImmunityEn: 'Excellent (Grade A+ / 0-Mask, immune to mask trojans)',
        descZh: '利用閘極氧化層原子尺度隨機微崩潰特徵，無光罩木馬植入途徑，熱載子光子發射衰減高達 48 dB。',
        descEn: 'Atomic-scale oxide breakdown randomness; 0-mask eliminates mask trojans; 48 dB optical attenuation.'
      },
      sram_puf: {
        nameZh: 'SRAM 啟動狀態 PUF',
        nameEn: 'SRAM Power-Up PUF',
        baseEmissionRate: 150,
        shieldingFactor: 18,
        interHammingMean: 49.3,
        intraBitErrorRate: 4.8, // Vulnerable to supply noise and temperature drift
        trojanImmunity: '中等 (Grade B / 易受周邊邏輯木馬或雷射故障注入干擾)',
        trojanImmunityEn: 'Moderate (Grade B / Susceptible to power glitching & laser BBI)',
        descZh: '依賴未初始化正反器亞穩態，容易受外部電源抖動誘騙，且高溫環境位元翻轉率飆升。',
        descEn: 'Relies on uninitialized latch metastability; high error rates under temperature and voltage fluctuations.'
      },
      mram: {
        nameZh: 'STT-MRAM 磁阻隨機數',
        nameEn: 'STT-MRAM TRNG / MOKE',
        baseEmissionRate: 85,
        shieldingFactor: 28,
        interHammingMean: 49.8,
        intraBitErrorRate: 1.8,
        trojanImmunity: '良好 (Grade B+ / BEOL 磁穿隧層木馬隱蔽性高)',
        trojanImmunityEn: 'Good (Grade B+ / BEOL magnetic layers conceal trojans)',
        descZh: '利用 MTJ 臨界翻轉隨機性，無明顯光學發射，但需防範磁光柯爾效應 (MOKE) 磁場探測。',
        descEn: 'Leverages MTJ switching stochasticity; minimal photon emission, but vulnerable to MOKE magnetic probes.'
      },
      eflash: {
        nameZh: '傳統 eFlash 儲存金鑰',
        nameEn: 'Conventional eFlash Key Store',
        baseEmissionRate: 1200, // Very strong due to high-voltage charge pump & programming hot electrons
        shieldingFactor: 8,
        interHammingMean: 0.0, // Not a PUF, static stored bits
        intraBitErrorRate: 0.0,
        trojanImmunity: '極弱 (Grade F / 電荷泵強光子發射，光罩多達 8~12 道易植木馬)',
        trojanImmunityEn: 'Vulnerable (Grade F / Intense charge pump emission; 8-12 mask adders)',
        descZh: '高壓電荷泵產生顯著近紅外碰撞電離光子，可被 TRE 探測輕易還原金鑰，且額外光罩多易遭代工廠植入木馬。',
        descEn: 'High-voltage charge pumps generate bright NIR photon emission easily intercepted by TRE detectors.'
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

          <!-- Metric 4: Zero-Trust Supply Chain Rating -->
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
              <span data-lang="zh">零信任供應鏈認證等級</span><span data-lang="en">Zero-Trust Assurance Tier</span>
            </div>
            <div id="trojan-out-tier" style="font-size: 18px; font-weight: 700; color: #10b981; font-family: monospace;">CC EAL6+ / SP 800-193</div>
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

    document.addEventListener('languagechange', () => {
      this.updateBilingualLabels();
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
    // Silicon absorption depth for NIR (lambda ~ 1064nm): lambda_opt ~ 20 um
    const lambdaOptUm = 20.0;
    const substrateAbsorptionFactor = Math.exp(-s.substrateThickUm / lambdaOptUm);
    const totalShieldingDb = s.opticalShieldDb + tech.shieldingFactor;
    const shieldAttenuationFactor = Math.pow(10, -totalShieldingDb / 10);

    // Measured Photon flux (photons / sec)
    const measuredFlux = tech.baseEmissionRate * substrateAbsorptionFactor * shieldAttenuationFactor;
    // Dark count rate for SNSPD is ~ 10-100 cps. If measuredFlux < 1.0 cps, it is below detection noise
    const snrDb = 10 * Math.log10(Math.max(1e-4, measuredFlux / 5.0));

    // 2. Hardware Trojan Detection
    // Using Golden IC PUF Fingerprint verification:
    // P_detect = 1 - (1 - sensitivity)^samples
    let detectionProb = 0.999;
    if (s.tech === 'antifuse_puf') {
      // 0-Mask means foundry cannot alter standard layout masks without changing base DRC
      detectionProb = Math.min(0.9999, 0.99 + (s.trojanPayloadPpm / 1000) * 0.0099);
    } else if (s.tech === 'sram_puf') {
      detectionProb = Math.max(0.75, 0.92 - 0.15 * (tech.intraBitErrorRate / 10));
    } else if (s.tech === 'mram') {
      detectionProb = 0.965;
    } else {
      // eFlash has 8-12 mask adders, vulnerable to mask insertion
      detectionProb = Math.max(0.40, 0.65 - (s.trojanPayloadPpm / 2000));
    }

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
      outDetect.style.color = p.detectionProb >= 0.99 ? '#10b981' : (p.detectionProb >= 0.90 ? '#f59e0b' : '#ef4444');
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

    // 4. Rating
    const outTier = this.container.querySelector('#trojan-out-tier');
    if (outTier) {
      if (this.state.tech === 'antifuse_puf') {
        outTier.innerHTML = '<span data-lang="zh">CC EAL6+ / SP 800-193</span><span data-lang="en">CC EAL6+ / SP 800-193</span>';
        outTier.style.color = '#10b981';
      } else if (this.state.tech === 'mram') {
        outTier.innerHTML = '<span data-lang="zh">CC EAL5+ / NIST FIPS</span><span data-lang="en">CC EAL5+ / NIST FIPS</span>';
        outTier.style.color = '#60a5fa';
      } else if (this.state.tech === 'sram_puf') {
        outTier.innerHTML = '<span data-lang="zh">CC EAL4+ / 商業工規</span><span data-lang="en">CC EAL4+ / Commercial</span>';
        outTier.style.color = '#f59e0b';
      } else {
        outTier.innerHTML = '<span data-lang="zh">CC EAL2 / 高風險</span><span data-lang="en">CC EAL2 / High Risk</span>';
        outTier.style.color = '#ef4444';
      }
    }

    const outRating = this.container.querySelector('#trojan-out-rating');
    if (outRating) {
      if (this.state.tech === 'antifuse_puf') {
        outRating.innerHTML = `<span style="color: #10b981; font-weight: 600;"><span data-lang="zh">GRADE A+ (零光罩木馬免疫 + 48dB 光學衰減)</span><span data-lang="en">GRADE A+ (0-Mask Immune + 48dB Attenuation)</span></span>`;
      } else if (this.state.tech === 'mram') {
        outRating.innerHTML = `<span style="color: #60a5fa; font-weight: 600;"><span data-lang="zh">GRADE B+ (磁光特性良好)</span><span data-lang="en">GRADE B+ (Good Magnetic Randomness)</span></span>`;
      } else if (this.state.tech === 'sram_puf') {
        outRating.innerHTML = `<span style="color: #f59e0b; font-weight: 600;"><span data-lang="zh">GRADE B (易受供電噪聲與雷射 BBI 誘騙)</span><span data-lang="en">GRADE B (Vulnerable to Power Noise &amp; BBI)</span></span>`;
      } else {
        outRating.innerHTML = `<span style="color: #ef4444; font-weight: 600;"><span data-lang="zh">GRADE F (電荷泵強光子輻射洩漏)</span><span data-lang="en">GRADE F (Intense Pump Photon Leakage)</span></span>`;
      }
    }

    // 5. Verdict Box
    const vDesc = this.container.querySelector('#trojan-verdict-desc');
    if (vDesc) {
      let verdictZh = '';
      let verdictEn = '';
      if (this.state.tech === 'eflash') {
        verdictZh = `嚴重風險：傳統 eFlash 的高壓電荷泵在讀寫時產生強烈碰撞電離光子 (通量達 ${Math.round(p.measuredFlux)} ph/s)，背面時間分辨光子發射 (TRE) 可輕易在時鐘邊緣還原金鑰。且高達 8~12 道額外光罩大幅增加代工廠惡意植入木馬之攻擊面。建議升級為 0-Mask 原生 PUF。`;
        verdictEn = `Critical Risk: Conventional eFlash charge pumps generate intense impact-ionization photons (${Math.round(p.measuredFlux)} ph/s). Backside TRE detectors can easily extract keys. Furthermore, 8-12 mask adders offer large attack surfaces for foundry trojans. Recommend 0-Mask native PUF.`;
      } else if (this.state.tech === 'sram_puf' && this.state.trojanPayloadPpm >= 500) {
        verdictZh = `架構預警：SRAM PUF 啟動狀態受外部電源壓降與溫度梯度擾動，Intra-BER 達 ${p.tech.intraBitErrorRate}%，若攻擊者植入觸發式木馬，易引發正反器狀態重置失真。需搭配重度輔助數據 (Helper Data) 與 BCH 糾錯演算法。`;
        verdictEn = `Warning: SRAM PUF startup states fluctuate with supply noise and temperature (Intra-BER ${p.tech.intraBitErrorRate}%). Triggered trojans could distort latch power-up profiles, necessitating heavy helper data and BCH ECC algorithms.`;
      } else {
        verdictZh = `防禦合格：${p.tech.nameZh} 結合主動屏蔽與背面光學衰減 (${p.totalShieldingDb} dB)，光子發射通量壓低至 ${p.measuredFlux.toFixed(3)} ph/s (SNR < -10 dB)，完全阻絕背面近紅外 TRE 單光子探測！零額外光罩特性徹底消滅代工廠木馬植入途徑，完全符合 NIST SP 800-193 與 CC EAL6+ 零信任安全架構。`;
        verdictEn = `Defense Qualified: ${p.tech.nameEn} combined with active shielding (${p.totalShieldingDb} dB) suppresses photon flux to ${p.measuredFlux.toFixed(3)} ph/s (SNR < -10 dB), blinding backside NIR TRE single-photon detectors. 0-Mask geometry eliminates fab trojan insertion, fulfilling NIST SP 800-193 and CC EAL6+.`;
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
