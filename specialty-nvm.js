// specialty-nvm.js · Interactive Features & Flagship Labs for Specialty eNVM
// Supports: BCD Power, Array Redundancy Repair, High-Voltage Display Drivers & E-Ink

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = (window.HubLanguage && window.HubLanguage.get()) || 'en';

  // =========================================================
  // 1. 全域語言監聽與事件同步
  // =========================================================
  window.addEventListener('hub:language-change', (e) => {
    currentLang = e.detail.language;
    redrawAllLabs();
  });

  function redrawAllLabs() {
    drawVrefCurve();
    drawMatrix();
    drawGammaCurve();
    drawMuraCanvas();
    drawWaveform();
  }

  // =========================================================
  // 2. 錨點平滑滾動
  // =========================================================
  document.querySelectorAll('.nav-pill').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetEl.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // =========================================================
  // 3. 旗艦實驗室 01: BCD 帶隙電壓微調 & 零光罩計算機
  // =========================================================
  const canvasVref = document.getElementById('canvasVref');
  const btnRunTrim = document.getElementById('btnRunTrim');
  const statRawVar = document.getElementById('statRawVar');
  const statTrimVar = document.getElementById('statTrimVar');
  const statYield = document.getElementById('statYield');

  let isTrimmed = false;
  let trimProgress = 0; // 0 (raw) to 1 (trimmed)
  let trimAnimId = null;

  function drawVrefCurve() {
    if (!canvasVref) return;
    const ctx = canvasVref.getContext('2d');
    const w = canvasVref.width;
    const h = canvasVref.height;
    ctx.clearRect(0, 0, w, h);

    // 繪製格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h - 25); }
    for (let y = 20; y < h - 25; y += 30) { ctx.moveTo(40, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // 軸線
    ctx.strokeStyle = 'rgba(113, 236, 227, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, h - 25);
    ctx.lineTo(w - 10, h - 25);
    ctx.stroke();

    // 規格上下限 (Spec Limits: &plusmn;1%)
    const center = w / 2;
    const specLeft = center - 60;
    const specRight = center + 60;

    ctx.fillStyle = 'rgba(113, 236, 227, 0.08)';
    ctx.fillRect(specLeft, 10, specRight - specLeft, h - 35);
    ctx.strokeStyle = 'rgba(113, 236, 227, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(specLeft, 10); ctx.lineTo(specLeft, h - 25);
    ctx.moveTo(specRight, 10); ctx.lineTo(specRight, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // 標籤文字
    ctx.fillStyle = '#8faab0';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillText('-1.0% Spec', specLeft - 30, h - 10);
    ctx.fillText('+1.0% Spec', specRight - 10, h - 10);
    ctx.fillText('Vref (1.200V)', center - 35, h - 10);

    // 計算當前高斯標準差 sigma
    // raw sigma = 45, trimmed sigma = 12
    const currentSigma = 45 - trimProgress * 33;
    const peakHeight = 50 + trimProgress * 100;

    // 繪製高斯曲線
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isTrimmed ? '#71ece3' : '#f87171';

    for (let x = 40; x <= w - 10; x++) {
      const dx = x - center;
      const y = (h - 25) - peakHeight * Math.exp(-(dx * dx) / (2 * currentSigma * currentSigma));
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 填色漸層
    ctx.lineTo(w - 10, h - 25);
    ctx.lineTo(40, h - 25);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (isTrimmed) {
      grad.addColorStop(0, 'rgba(113, 236, 227, 0.35)');
      grad.addColorStop(1, 'rgba(113, 236, 227, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(248, 113, 113, 0.3)');
      grad.addColorStop(1, 'rgba(248, 113, 113, 0.0)');
    }
    ctx.fillStyle = grad;
    ctx.fill();
  }

  if (btnRunTrim) {
    btnRunTrim.addEventListener('click', () => {
      isTrimmed = !isTrimmed;
      const startProg = trimProgress;
      const targetProg = isTrimmed ? 1 : 0;
      const startTime = performance.now();
      const dur = 600;

      btnRunTrim.disabled = true;

      function animateTrim(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / dur, 1);
        // easeOutCubic
        trimProgress = startProg + (targetProg - startProg) * (1 - Math.pow(1 - t, 3));
        drawVrefCurve();

        if (t < 1) {
          trimAnimId = requestAnimationFrame(animateTrim);
        } else {
          btnRunTrim.disabled = false;
          if (isTrimmed) {
            statTrimVar.textContent = '±0.28% (σ=0.09)';
            statYield.textContent = '99.8% PASS';
            statYield.className = 'stat-val text-green';
            btnRunTrim.textContent = currentLang === 'zh' ? '🔄 重置為未微調狀態' : '🔄 Reset to Untrimmed';
          } else {
            statTrimVar.textContent = '±4.2% (Raw)';
            statYield.textContent = '83.5% (Reject)';
            statYield.className = 'stat-val text-warn';
            btnRunTrim.textContent = currentLang === 'zh' ? '⚡ 執行 OTP 電性微調' : '⚡ Execute OTP Electrical Trim';
          }
        }
      }
      trimAnimId = requestAnimationFrame(animateTrim);
    });
  }

  // 零光罩計算機
  const sliderWafers = document.getElementById('sliderWafers');
  const lblWaferCount = document.getElementById('lblWaferCount');
  const resMaskSavings = document.getElementById('resMaskSavings');
  const resAnnualSavings = document.getElementById('resAnnualSavings');
  const nodeButtons = document.querySelectorAll('.node-btn');
  let selectedNode = 180;

  function updateCalculator() {
    if (!sliderWafers) return;
    const wafers = parseInt(sliderWafers.value, 10);
    lblWaferCount.textContent = wafers.toLocaleString() + (currentLang === 'zh' ? ' 片' : ' Wafers');

    let maskCost = 650000;
    let costPerWaferDelta = 80; // 30% saving on wafer
    if (selectedNode === 55) {
      maskCost = 1450000;
      costPerWaferDelta = 180;
    }

    const annualWaferSavings = wafers * costPerWaferDelta * 12;

    resMaskSavings.textContent = '$' + (maskCost / 1000).toLocaleString() + 'K';
    resAnnualSavings.textContent = '$' + (annualWaferSavings / 1000000).toFixed(2) + 'M';
  }

  if (sliderWafers) {
    sliderWafers.addEventListener('input', updateCalculator);
  }

  nodeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      nodeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedNode = parseInt(btn.dataset.node, 10);
      updateCalculator();
    });
  });

  // =========================================================
  // 4. 旗艦實驗室 02: CIS/DRAM 矩陣自主缺陷修復掃描器
  // =========================================================
  const canvasMatrix = document.getElementById('canvasMatrix');
  const btnGenDefect = document.getElementById('btnGenDefect');
  const btnRunBIST = document.getElementById('btnRunBIST');
  const btnRunBIRA = document.getElementById('btnRunBIRA');
  const btnBurnFuse = document.getElementById('btnBurnFuse');
  const terminalLogs = document.getElementById('terminalLogs');
  const lblScanStatus = document.getElementById('lblScanStatus');
  const statDefectCount = document.getElementById('statDefectCount');
  const statSparesUsed = document.getElementById('statSparesUsed');
  const statDieYield = document.getElementById('statDieYield');

  const GRID_SIZE = 12;
  let matrixCells = [];
  let defects = [];
  let spareRows = [];
  let scanProgressLine = -1;

  function initMatrix() {
    matrixCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      matrixCells[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        matrixCells[r][c] = 0; // 0 = normal
      }
    }
    defects = [];
    spareRows = [];
    scanProgressLine = -1;
  }

  function logTerminal(msg) {
    if (!terminalLogs) return;
    const div = document.createElement('div');
    div.className = 'term-line';
    div.textContent = '> ' + msg;
    terminalLogs.appendChild(div);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  function drawMatrix() {
    if (!canvasMatrix) return;
    const ctx = canvasMatrix.getContext('2d');
    const w = canvasMatrix.width;
    const h = canvasMatrix.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 12;
    const cellSize = (w - pad * 2) / GRID_SIZE;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = pad + c * cellSize;
        const y = pad + r * cellSize;
        const val = matrixCells[r][c];

        if (val === 0) {
          ctx.fillStyle = '#082838';
          ctx.strokeStyle = 'rgba(113, 236, 227, 0.2)';
        } else if (val === 1) { // defect
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#f87171';
        } else if (val === 2) { // spare remapped
          ctx.fillStyle = '#16a34a';
          ctx.strokeStyle = '#4ade80';
        }

        ctx.lineWidth = 1;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      }
    }

    // 繪製掃描雷達線
    if (scanProgressLine >= 0 && scanProgressLine < GRID_SIZE) {
      const lineY = pad + scanProgressLine * cellSize;
      ctx.fillStyle = 'rgba(113, 236, 227, 0.25)';
      ctx.fillRect(pad, lineY, w - pad * 2, cellSize);
      ctx.strokeStyle = '#71ece3';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, lineY, w - pad * 2, cellSize);
    }
  }

  initMatrix();

  if (btnGenDefect) {
    
    // 支援直接點擊或觸控晶圓矩陣注入/清除缺陷
    function handleMatrixCellClick(e) {
      e.preventDefault();
      const rect = canvasMatrix.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const cellSize = canvasMatrix.width / GRID_SIZE;
      const c = Math.floor(x / (rect.width / GRID_SIZE));
      const r = Math.floor(y / (rect.height / GRID_SIZE));
      
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        if (matrixCells[r][c] === 0) {
          // 注入缺陷
          matrixCells[r][c] = 1;
          defects.push({ r, c });
          logTerminal(`MANUAL INJECTION: Defect added at bitcell [R${r}C${c}].`);
        } else {
          // 清除缺陷
          matrixCells[r][c] = 0;
          defects = defects.filter(d => !(d.r === r && d.c === c));
          logTerminal(`MANUAL OVERRIDE: Defect cleared at bitcell [R${r}C${c}].`);
        }
        
        statDefectCount.textContent = defects.length.toString();
        if (defects.length > 0) {
          lblScanStatus.textContent = 'DEFECT DETECTED';
          lblScanStatus.className = 'badge-accent text-warn';
          statDieYield.textContent = 'FAIL (0%)';
          statDieYield.className = 'stat-val text-warn';
          btnRunBIST.disabled = false;
        } else {
          lblScanStatus.textContent = 'SYSTEM IDLE';
          lblScanStatus.className = 'badge-accent';
          statDieYield.textContent = '100%';
          statDieYield.className = 'stat-val text-green';
          btnRunBIST.disabled = true;
        }
        btnRunBIRA.disabled = true;
        btnBurnFuse.disabled = true;
        drawMatrix();
      }
    }

    canvasMatrix.addEventListener('click', handleMatrixCellClick);
    canvasMatrix.addEventListener('touchstart', handleMatrixCellClick, { passive: false });
    canvasMatrix.style.cursor = 'crosshair';

    btnGenDefect.addEventListener('click', () => {
      initMatrix();
      // 隨機產生 2 到 3 個缺陷
      const numDefects = 2 + Math.floor(Math.random() * 2);
      while (defects.length < numDefects) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (!defects.some(d => d.r === r && d.c === c)) {
          defects.push({ r, c });
          matrixCells[r][c] = 1;
        }
      }

      drawMatrix();
      lblScanStatus.textContent = 'DEFECT DETECTED';
      lblScanStatus.className = 'badge-accent text-warn';
      statDefectCount.textContent = defects.length.toString();
      statSparesUsed.textContent = '0 / 4';
      statDieYield.textContent = 'FAIL (0%)';
      statDieYield.className = 'stat-val text-warn';

      logTerminal(`PHYSICAL DEFECT INJECTED: ${defects.length} bad bitcells. DIE YIELD CRUSHED TO 0%.`);
      btnRunBIST.disabled = false;
      btnRunBIRA.disabled = true;
      btnBurnFuse.disabled = true;
    });

    btnRunBIST.addEventListener('click', () => {
      btnRunBIST.disabled = true;
      lblScanStatus.textContent = 'BIST SCANNING...';
      logTerminal('RUNNING MARCH C- ALGORITHM ACROSS 144 BITCELLS...');

      let cur = 0;
      const scanInterval = setInterval(() => {
        scanProgressLine = cur;
        drawMatrix();
        cur++;
        if (cur >= GRID_SIZE) {
          clearInterval(scanInterval);
          scanProgressLine = -1;
          drawMatrix();
          lblScanStatus.textContent = 'BIST COMPLETED';
          logTerminal(`BIST COMPLETED: Fault addresses captured at [${defects.map(d => `R${d.r}C${d.c}`).join(', ')}].`);
          btnRunBIRA.disabled = false;
        }
      }, 50);
    });

    btnRunBIRA.addEventListener('click', () => {
      btnRunBIRA.disabled = true;
      lblScanStatus.textContent = 'BIRA SOLVING...';
      logTerminal('BIRA HARDWARE SOLVER: Calculating minimum vertex cover...');

      setTimeout(() => {
        spareRows = [...new Set(defects.map(d => d.r))];
        statSparesUsed.textContent = `${spareRows.length} / 4`;
        lblScanStatus.textContent = 'BIRA SOLUTION LOCKED';
        logTerminal(`BIRA SOLUTION: Allocate ${spareRows.length} Spare Rows [${spareRows.map(r => `SpareRow_${r}`).join(', ')}].`);
        btnBurnFuse.disabled = false;
      }, 400);
    });

    btnBurnFuse.addEventListener('click', () => {
      btnBurnFuse.disabled = true;
      lblScanStatus.textContent = 'BURNING ANTIFUSE...';
      logTerminal('⚡ APPLYING 5.5V PULSE TO ANTIFUSE FUSEBOX...');

      setTimeout(() => {
        defects.forEach(d => {
          matrixCells[d.r][d.c] = 2; // remapped green
        });
        drawMatrix();

        lblScanStatus.textContent = 'REPAIR COMPLETE';
        lblScanStatus.className = 'badge-accent text-green';
        statDieYield.textContent = 'PASS (100%)';
        statDieYield.className = 'stat-val text-green';

        logTerminal('✓ FUSEBOX PERMANENTLY BURNED. ADDRESS DECODER REDIRECTED. DIE SALVAGED!');
      }, 500);
    });
  }

  // =========================================================
  // 5. 旗艦實驗室 03: 高壓顯示光學調節器 (Gamma & De-Mura)
  // =========================================================
  const canvasGamma = document.getElementById('canvasGamma');
  const sliderGamma = document.getElementById('sliderGamma');
  const lblGammaVal = document.getElementById('lblGammaVal');
  const gammaStrip = document.getElementById('gammaStrip');

  const canvasMura = document.getElementById('canvasMura');
  const btnToggleMura = document.getElementById('btnToggleMura');
  const statUniformity = document.getElementById('statUniformity');
  const statDeltaE = document.getElementById('statDeltaE');
  const statLutStatus = document.getElementById('statLutStatus');
  let isMuraCorrected = false;

  function drawGammaCurve() {
    if (!canvasGamma) return;
    const ctx = canvasGamma.getContext('2d');
    const w = canvasGamma.width;
    const h = canvasGamma.height;
    ctx.clearRect(0, 0, w, h);

    const gamma = sliderGamma ? parseFloat(sliderGamma.value) : 2.2;
    if (lblGammaVal) lblGammaVal.textContent = `Gamma: ${gamma.toFixed(2)}`;

    // 格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < w; x += 50) { ctx.moveTo(x, 10); ctx.lineTo(x, h - 25); }
    for (let y = 10; y < h - 25; y += 30) { ctx.moveTo(40, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // 理想 Gamma 2.2 虛線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let x = 40; x <= w - 10; x++) {
      const normX = (x - 40) / (w - 50);
      const normY = Math.pow(normX, 2.2);
      const y = (h - 25) - normY * (h - 35);
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 當前調整曲線
    ctx.strokeStyle = '#71ece3';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 40; x <= w - 10; x++) {
      const normX = (x - 40) / (w - 50);
      const normY = Math.pow(normX, gamma);
      const y = (h - 25) - normY * (h - 35);
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 漸層填色
    ctx.lineTo(w - 10, h - 25);
    ctx.lineTo(40, h - 25);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(113, 236, 227, 0.25)');
    g.addColorStop(1, 'rgba(113, 236, 227, 0.0)');
    ctx.fillStyle = g;
    ctx.fill();

    // 更新色階條
    if (gammaStrip) {
      let gradStr = 'linear-gradient(to right';
      for (let i = 0; i <= 10; i++) {
        const p = i / 10;
        const b = Math.round(Math.pow(p, gamma) * 255);
        gradStr += `, rgb(${b},${b},${b}) ${p * 100}%`;
      }
      gradStr += ')';
      gammaStrip.style.background = gradStr;
    }
  }

  if (sliderGamma) {
    sliderGamma.addEventListener('input', drawGammaCurve);
  }

  // De-Mura Canvas
  function drawMuraCanvas() {
    if (!canvasMura) return;
    const ctx = canvasMura.getContext('2d');
    const w = canvasMura.width;
    const h = canvasMura.height;
    ctx.clearRect(0, 0, w, h);

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // 模擬 Mura 不均勻度
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        let lum = 120;

        if (!isMuraCorrected) {
          // 雲狀暗斑噪訊
          const noise1 = Math.sin(x * 0.03) * Math.cos(y * 0.03) * 25;
          const noise2 = Math.sin(x * 0.015 + y * 0.02) * 20;
          lum += (noise1 + noise2);
        }

        lum = Math.max(0, Math.min(255, lum));
        data[idx] = lum * 0.4;     // R
        data[idx + 1] = lum * 0.8; // G
        data[idx + 2] = lum * 0.9; // B (OLED cyan-blue)
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 水印提示
    ctx.font = '12px "IBM Plex Mono", monospace';
    ctx.fillStyle = isMuraCorrected ? '#4ade80' : '#f87171';
    ctx.fillText(isMuraCorrected ? '✓ DE-MURA LUT APPLIED (UNIFORM)' : '⚠ RAW MURA UNEVENNESS DETECTED', 16, 24);
  }

  if (btnToggleMura) {
    btnToggleMura.addEventListener('click', () => {
      isMuraCorrected = !isMuraCorrected;
      drawMuraCanvas();

      if (isMuraCorrected) {
        statUniformity.textContent = '99.4% (Flawless)';
        statUniformity.className = 'stat-val text-green';
        statDeltaE.textContent = '0.45 (Imperceptible)';
        statDeltaE.className = 'stat-val text-cyan';
        statLutStatus.textContent = 'ACTIVE (64Kb)';
        statLutStatus.className = 'stat-val text-green';
        btnToggleMura.textContent = currentLang === 'zh' ? '🔄 移除 De-Mura LUT 補償' : '🔄 Bypass De-Mura LUT';
      } else {
        statUniformity.textContent = '74.2% (Raw Mura)';
        statUniformity.className = 'stat-val text-warn';
        statDeltaE.textContent = '3.8 (Severe)';
        statDeltaE.className = 'stat-val text-warn';
        statLutStatus.textContent = 'BYPASS';
        statLutStatus.className = 'stat-val text-cyan';
        btnToggleMura.textContent = currentLang === 'zh' ? '💡 載入 NVM De-Mura LUT 補償' : '💡 Apply NVM De-Mura LUT';
      }
    });
  }

  // =========================================================
  // 6. 旗艦實驗室 04: 電子紙 (E-Ink) 超高壓電泳與波形示波器
  // =========================================================
  const canvasCapsule = document.getElementById('canvasCapsule');
  const canvasWaveform = document.getElementById('canvasWaveform');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const lblEinkMode = document.getElementById('lblEinkMode');
  const lblPulseVolt = document.getElementById('lblPulseVolt');
  const lblPhaseTag = document.getElementById('lblPhaseTag');
  const txtPhaseDesc = document.getElementById('txtPhaseDesc');
  const valLutFootprint = document.getElementById('valLutFootprint');
  const valMacroHeight = document.getElementById('valMacroHeight');

  let currentEinkMode = 'mono'; // 'mono', 'esl', 'color'
  let particles = [];

  function initParticles() {
    particles = [];
    // 建立 40 顆粒子
    for (let i = 0; i < 45; i++) {
      let color = 'white';
      let charge = 1; // +1 = white, -1 = black, -2 = red/yellow
      if (i >= 15 && i < 30) { color = 'black'; charge = -1; }
      else if (i >= 30) { color = '#ff4444'; charge = -2; }

      particles.push({
        x: 40 + Math.random() * 400,
        y: 40 + Math.random() * 140,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0,
        targetY: 40 + Math.random() * 140,
        radius: 6,
        color: color,
        charge: charge
      });
    }
  }

  initParticles();

  function updateEinkPhysics() {
    particles.forEach(p => {
      // 根據模式賦予不同的目標 Y 座標（模擬電場受力）
      if (currentEinkMode === 'mono') {
        if (p.charge === 1) p.targetY = 45 + Math.random() * 30; // 白頂
        else p.targetY = 160 + Math.random() * 30; // 黑底
      } else if (currentEinkMode === 'esl') {
        if (p.charge === 1) p.targetY = 45 + Math.random() * 20;
        else if (p.charge === -1) p.targetY = 100 + Math.random() * 30;
        else p.targetY = 165 + Math.random() * 25; // 紅底
      } else { // color (Spectra 6)
        if (p.charge === -2) p.targetY = 45 + Math.random() * 25; // 紅色浮到頂部
        else if (p.charge === 1) p.targetY = 105 + Math.random() * 30;
        else p.targetY = 165 + Math.random() * 25;
      }

      p.y += (p.targetY - p.y) * 0.08;
      p.x += p.vx;
      if (p.x < 30 || p.x > 450) p.vx *= -1;
    });
  }

  function drawCapsule() {
    if (!canvasCapsule) return;
    const ctx = canvasCapsule.getContext('2d');
    const w = canvasCapsule.width;
    const h = canvasCapsule.height;
    ctx.clearRect(0, 0, w, h);

    // 微膠囊外壁
    ctx.strokeStyle = 'rgba(113, 236, 227, 0.4)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(8, 36, 51, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 220, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 頂部透明電極與底部電極
    ctx.fillStyle = '#71ece3';
    ctx.fillRect(w / 2 - 200, 8, 400, 4);
    ctx.fillStyle = '#ff9d5c';
    ctx.fillRect(w / 2 - 200, h - 12, 400, 4);

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#71ece3';
    ctx.fillText('TOP TRANSPARENT ELECTRODE (ITO)', w / 2 - 90, 20);
    ctx.fillStyle = '#ff9d5c';
    ctx.fillText('BOTTOM PIXEL ELECTRODE (+40V~50V PULSE)', w / 2 - 110, h - 18);

    updateEinkPhysics();

    // 繪製粒子
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#061925';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawWaveform() {
    if (!canvasWaveform) return;
    const ctx = canvasWaveform.getContext('2d');
    const w = canvasWaveform.width;
    const h = canvasWaveform.height;
    ctx.clearRect(0, 0, w, h);

    // 示波器格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y < h; y += 25) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // 0V 基準線
    const zeroY = h / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();

    // 繪製脈衝波形
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff9d5c';
    ctx.beginPath();
    ctx.moveTo(10, zeroY);

    if (currentEinkMode === 'mono') {
      // 15V 方波脈衝
      ctx.lineTo(60, zeroY);
      ctx.lineTo(60, zeroY - 40);
      ctx.lineTo(160, zeroY - 40);
      ctx.lineTo(160, zeroY + 40);
      ctx.lineTo(260, zeroY + 40);
      ctx.lineTo(260, zeroY);
      ctx.lineTo(460, zeroY);
    } else if (currentEinkMode === 'esl') {
      // 32V 多階波形
      ctx.lineTo(40, zeroY);
      ctx.lineTo(40, zeroY - 55);
      ctx.lineTo(120, zeroY - 55);
      ctx.lineTo(120, zeroY - 25);
      ctx.lineTo(180, zeroY - 25);
      ctx.lineTo(180, zeroY + 55);
      ctx.lineTo(260, zeroY + 55);
      ctx.lineTo(260, zeroY);
      ctx.lineTo(460, zeroY);
    } else {
      // 50V 高壓精密微脈衝
      ctx.lineTo(30, zeroY);
      for (let i = 0; i < 6; i++) {
        const stepX = 30 + i * 50;
        ctx.lineTo(stepX, zeroY - 65);
        ctx.lineTo(stepX + 20, zeroY - 65);
        ctx.lineTo(stepX + 20, zeroY + 65);
        ctx.lineTo(stepX + 40, zeroY + 65);
      }
      ctx.lineTo(330, zeroY);
      ctx.lineTo(460, zeroY);
    }
    ctx.stroke();
  }

  // 模式切換
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEinkMode = btn.dataset.mode;

      if (currentEinkMode === 'mono') {
        lblEinkMode.textContent = 'MONO FAST REFRESH';
        lblPulseVolt.textContent = '±15V PULSE (32Kb MTP)';
        valLutFootprint.textContent = '32 K-bit';
        lblPhaseTag.textContent = 'MTP / OTP BALANCED';
        lblPhaseTag.className = 'phase-tag phase-otp';
        txtPhaseDesc.innerHTML = currentLang === 'zh'
          ? '黑白雙色波形已極度成熟，驅動晶片已全面轉向低成本純邏輯 AntiFuse OTP。'
          : 'Monochrome waveform is fully stabilized; DDICs deploy pure logic AntiFuse OTP for cost leadership.';
      } else if (currentEinkMode === 'esl') {
        lblEinkMode.textContent = '4-COLOR ESL LABEL';
        lblPulseVolt.textContent = '±32V PULSE (48Kb MTP)';
        valLutFootprint.textContent = '48 K-bit';
        lblPhaseTag.textContent = 'MTP ACTIVE (TRANSITION ERA)';
        lblPhaseTag.className = 'phase-tag phase-mtp';
        txtPhaseDesc.innerHTML = currentLang === 'zh'
          ? '四色電子貨架標籤正在由 MTP 逐步收斂轉向 OTP，在線彈性微調是當前關鍵。'
          : '4-Color ESL is in late transition; design houses leverage MTP for firmware calibration before OTP freeze.';
      } else {
        lblEinkMode.textContent = 'SPECTRA 6 FULL COLOR';
        lblPulseVolt.textContent = '±50V ULTRA-HV PULSE (64Kb MTP)';
        valLutFootprint.textContent = '64 K-bit (High Density)';
        lblPhaseTag.textContent = 'MTP MANDATORY (ACTIVE EVOLUTION)';
        lblPhaseTag.className = 'phase-tag phase-mtp';
        txtPhaseDesc.innerHTML = currentLang === 'zh'
          ? '彩色粒子配方與微膠囊仍在快速演進，算法不易一次性出廠寫死，必須採用 64Kb MTP 保持彈性。'
          : 'Full-color particle chemistry is rapidly evolving; waveforms cannot be frozen once, mandating 64Kb MTP.';
      }

      drawWaveform();
    });
  });

  // 動畫循環
  function einkLoop() {
    drawCapsule();
    requestAnimationFrame(einkLoop);
  }
  requestAnimationFrame(einkLoop);

  // 初始化所有實驗室畫布
  redrawAllLabs();
  updateCalculator();
});
