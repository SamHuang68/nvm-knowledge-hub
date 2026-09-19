// specialty-nvm.js · Interactive Features & Flagship Labs for Specialty eNVM
// Supports: BCD Power, Array Redundancy Repair, High-Voltage Display Drivers & E-Ink

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 0. Hi-DPI (Retina/4K) 縮放校正與精密半導體儀表引擎
  // =========================================================
  function setupHiDPICanvas(canvas, preferredW, preferredH) {
    if (!canvas) return null;
    const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : preferredW;
    const cssWidth = Math.min(preferredW, parentW > 50 ? parentW : preferredW);
    const cssHeight = Math.round(preferredH * (cssWidth / preferredW));
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const targetW = Math.round(cssWidth * dpr);
    const targetH = Math.round(cssHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const scaleFactor = (cssWidth / preferredW) * dpr;
    ctx.scale(scaleFactor, scaleFactor);
    return ctx;
  }

  function drawInstrumentGrid(ctx, w, h, opts) {
    if (!ctx) return;
    const divX = (opts && opts.divX) || 40;
    const divY = (opts && opts.divY) || 30;
    const gridColor = (opts && opts.gridColor) || 'rgba(176, 138, 91, 0.08)';
    const axisColor = (opts && opts.axisColor) || 'rgba(196, 165, 116, 0.35)';
    const showSubdiv = opts && opts.showSubdivisions !== false;

    ctx.save();
    ctx.lineWidth = 1;

    if (showSubdiv) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.beginPath();
      for (let x = divX / 5; x < w; x += divX / 5) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = divY / 5; y < h; y += divY / 5) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
    }

    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    for (let x = 0; x <= w; x += divX) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y <= h; y += divY) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    if (opts && opts.centerCrosshair) {
      const cx = Math.floor(w / 2);
      const cy = Math.floor(h / 2);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(196, 165, 116, 0.6)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += divX / 5) { ctx.moveTo(x, cy - 2.5); ctx.lineTo(x, cy + 2.5); }
      for (let y = 0; y <= h; y += divY / 5) { ctx.moveTo(cx - 2.5, y); ctx.lineTo(cx + 2.5, y); }
      ctx.stroke();
    }
    ctx.restore();
  }

  let currentLang = (window.HubLanguage && window.HubLanguage.get()) || 'en';
  const labText = (zh, en) => currentLang === 'zh' ? zh : en;

  // =========================================================
  // 1. 全域語言監聽與事件同步
  // =========================================================
  window.addEventListener('hub:language-change', (e) => {
    currentLang = e.detail.language;
    redrawAllLabs();
    updateCalculator();
    updateEinkMode();
    updateTrimUI(isTrimmed);
    updateMuraUI();
    renderRepairStatus();
    renderDieYield();
    renderTerminal();
    updateFuseboxMap(fuseboxView.status, fuseboxView.spares, fuseboxView.burned);
  });

  function redrawAllLabs() {
    drawVrefCurve();
    drawMatrix();
    drawGammaCurve();
    drawMuraCanvas();
    drawWaveform();
    drawCapsule();
  }
  window.addEventListener('resize', redrawAllLabs, { passive: true });

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
    const w = 480;
    const h = 220;
    const ctx = setupHiDPICanvas(canvasVref, w, h);
    ctx.clearRect(0, 0, w, h);

    // 精密半導體示波器背景格線
    drawInstrumentGrid(ctx, w, h, { divX: 40, divY: 30, showSubdivisions: true, centerCrosshair: false });

    // 繪製格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h - 25); }
    for (let y = 20; y < h - 25; y += 30) { ctx.moveTo(40, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // 軸線
    ctx.strokeStyle = 'rgba(196, 165, 116, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, h - 25);
    ctx.lineTo(w - 10, h - 25);
    ctx.stroke();

    // 規格上下限 (Spec Limits: &plusmn;1%)
    const center = w / 2;
    const specLeft = center - 60;
    const specRight = center + 60;

    ctx.fillStyle = 'rgba(196, 165, 116, 0.08)';
    ctx.fillRect(specLeft, 10, specRight - specLeft, h - 35);
    ctx.strokeStyle = 'rgba(196, 165, 116, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(specLeft, 10); ctx.lineTo(specLeft, h - 25);
    ctx.moveTo(specRight, 10); ctx.lineTo(specRight, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // 標籤文字
    ctx.fillStyle = '#8faab0';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillText(labText('-1.0% 規格', '-1.0% Spec'), specLeft - 30, h - 10);
    ctx.fillText(labText('+1.0% 規格', '+1.0% Spec'), specRight - 10, h - 10);
    ctx.fillText('Vref (1.200V)', center - 35, h - 10);

    // 計算當前高斯標準差 sigma
    // raw sigma = 45, trimmed sigma = 12
    const currentSigma = 45 - trimProgress * 33;
    const peakHeight = 50 + trimProgress * 100;

    // 繪製高斯曲線
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isTrimmed ? '#c4a574' : '#f87171';

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
      grad.addColorStop(0, 'rgba(196, 165, 116, 0.35)');
      grad.addColorStop(1, 'rgba(196, 165, 116, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(248, 113, 113, 0.3)');
      grad.addColorStop(1, 'rgba(248, 113, 113, 0.0)');
    }
    ctx.fillStyle = grad;
    ctx.fill();
  }

  const btnToggleTrimView = document.getElementById('btnToggleTrimView');
  const lblTrimMode = document.getElementById('lblTrimMode');
  const lblTrimModeEn = document.getElementById('lblTrimModeEn');

  function updateTrimUI(trimmed) {
    isTrimmed = trimmed;
    if (lblTrimMode && lblTrimModeEn) {
      lblTrimMode.textContent = trimmed ? '已微調 (±0.5%)' : '未微調 (±5%)';
      lblTrimModeEn.textContent = trimmed ? 'Trimmed (±0.5%)' : 'Raw Drift (±5%)';
    }
    if (trimmed) {
      statTrimVar.textContent = '±0.28% (σ=0.09)';
      statYield.textContent = labText('99.8% 通過', '99.8% PASS');
      statYield.className = 'stat-val text-green';
      btnRunTrim.textContent = currentLang === 'zh' ? '🔄 重置為未微調狀態' : '🔄 Reset to Untrimmed';
    } else {
      statTrimVar.textContent = labText('±4.2%（未微調）', '±4.2% (Raw)');
      statYield.textContent = labText('83.5%（未達標）', '83.5% (Reject)');
      statYield.className = 'stat-val text-warn';
      btnRunTrim.textContent = currentLang === 'zh' ? '⚡ 執行 OTP 電性微調' : '⚡ Execute OTP Electrical Trim';
    }
  }

  if (btnToggleTrimView) {
    btnToggleTrimView.addEventListener('click', () => {
      const nextState = !isTrimmed;
      trimProgress = nextState ? 1 : 0;
      updateTrimUI(nextState);
      drawVrefCurve();
    });
  }

  if (btnRunTrim) {
    btnRunTrim.addEventListener('click', () => {
      const nextState = !isTrimmed;
      const startProg = trimProgress;
      const targetProg = nextState ? 1 : 0;
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
          updateTrimUI(nextState);
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
  const SPARE_ROW_CAPACITY = 4;
  let matrixCells = [];
  let defects = [];
  let spareRows = [];
  let scanProgressLine = -1;
  let repairPhase = 'idle';
  const repairIsBusy = () => ['scanning', 'solving', 'burning'].includes(repairPhase);
  // 狀態識別碼供流程與驗證使用；畫面文案不參與工程邏輯判斷。
  const repairMessages = {
    standby: ['待命狀態', 'STANDBY'],
    idle: ['系統待命', 'SYSTEM IDLE'],
    defect: ['偵測到缺陷', 'DEFECT DETECTED'],
    scanning: ['BIST 掃描中…', 'BIST SCANNING...'],
    scanned: ['BIST 掃描完成', 'BIST COMPLETED'],
    solving: ['BIRA 解算中…', 'BIRA SOLVING...'],
    insufficient: ['備援不足：無法修復', 'UNREPAIRABLE: INSUFFICIENT SPARES'],
    allocated: ['BIRA 備援配置已確認', 'BIRA SOLUTION LOCKED'],
    burning: ['反熔絲燒錄中…', 'BURNING ANTIFUSE...'],
    repaired: ['修復完成', 'REPAIR COMPLETE']
  };
  let repairStatus = 'standby';
  let dieYieldState = 'normal';
  const terminalEntries = [];
  let fuseboxView = { status: null, spares: [], burned: false };

  function renderRepairStatus() {
    if (!lblScanStatus) return;
    lblScanStatus.dataset.state = repairStatus;
    lblScanStatus.textContent = labText(...repairMessages[repairStatus]);
  }
  function setRepairStatus(state) {
    repairStatus = state;
    renderRepairStatus();
  }
  function renderDieYield() {
    if (!statDieYield) return;
    statDieYield.dataset.state = dieYieldState;
    statDieYield.textContent = dieYieldState === 'failed' ? labText('未通過 (0%)', 'FAIL (0%)')
      : dieYieldState === 'repaired' ? labText('通過 (100%)', 'PASS (100%)') : '100%';
  }
  function setDieYield(state) {
    dieYieldState = state;
    renderDieYield();
  }

  
  // =========================================================
  // FuseBox Register Map Helper Functions
  // =========================================================
  const lblFuseboxStatus = document.getElementById('lblFuseboxStatus');
  function updateFuseboxMap(status, allocatedSpares, burned) {
    fuseboxView = { status, spares: [...(allocatedSpares || [])], burned };
    if (lblFuseboxStatus) {
      if (burned) {
        lblFuseboxStatus.textContent = labText('永久燒錄鎖定', 'FROZEN (LOCKED)');
        lblFuseboxStatus.className = 'fusebox-status burned';
      } else if (allocatedSpares && allocatedSpares.length > 0) {
        lblFuseboxStatus.textContent = labText('BIRA 備援已配置', 'BIRA ALLOCATED');
        lblFuseboxStatus.className = 'fusebox-status';
      } else {
        lblFuseboxStatus.textContent = labText('未燒錄', 'UNBLOWN (BLANK)');
        lblFuseboxStatus.className = 'fusebox-status';
      }
    }

    for (let i = 0; i < SPARE_ROW_CAPACITY; i++) {
      const regEl = document.getElementById(`fuseReg${i}`);
      if (!regEl) continue;
      const valEl = regEl.querySelector('.fuse-val');
      const stateEl = regEl.querySelector('.fuse-state');

      const resistances = [82, 78, 85, 76];
      if (allocatedSpares && i < allocatedSpares.length) {
        const spareRow = allocatedSpares[i];
        if (burned) {
          regEl.classList.add('burned-glow');
          valEl.innerHTML = `ROW_0x0${spareRow.toString(16).toUpperCase()} ➔ SPARE_${i} <span class="fuse-res-tag">R=${resistances[i]}Ω</span>`;
          stateEl.textContent = labText('永久鎖定', 'HARD LOCKED');
          stateEl.dataset.state = 'burned';
          stateEl.className = 'fuse-state state-burned';
        } else {
          regEl.classList.remove('burned-glow');
          valEl.textContent = labText(`映射：ROW_${spareRow} ➔ SPARE_${i}`, `MAP: ROW_${spareRow} ➔ SPARE_${i}`);
          stateEl.textContent = labText('已配置', 'ALLOCATED');
          stateEl.dataset.state = 'allocated';
          stateEl.className = 'fuse-state state-mapped';
        }
      } else {
        regEl.classList.remove('burned-glow');
        valEl.textContent = labText('---（空白）', '--- (BLANK)');
        stateEl.textContent = labText('空白', 'BLANK');
        stateEl.dataset.state = 'blank';
        stateEl.className = 'fuse-state state-blank';
      }
    }
  }

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
    repairPhase = 'idle';
    if (btnRunBIST) btnRunBIST.disabled = false;
    updateFuseboxMap(null, null, false);
  }

  function renderTerminal() {
    if (!terminalLogs) return;
    terminalLogs.replaceChildren(...terminalEntries.map(entry => {
      const div = document.createElement('div');
      div.className = 'term-line';
      div.textContent = '> ' + labText(entry.zh, entry.en);
      return div;
    }));
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }
  function logTerminal(zh, en) {
    terminalEntries.push({ zh, en });
    renderTerminal();
  }

  function drawMatrix() {
    if (!canvasMatrix) return;
    const w = 280;
    const h = 280;
    const ctx = setupHiDPICanvas(canvasMatrix, w, h);
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
          ctx.strokeStyle = 'rgba(196, 165, 116, 0.2)';
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
      ctx.fillStyle = 'rgba(196, 165, 116, 0.25)';
      ctx.fillRect(pad, lineY, w - pad * 2, cellSize);
      ctx.strokeStyle = '#c4a574';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, lineY, w - pad * 2, cellSize);
    }
  }

  initMatrix();

  if (btnGenDefect) {
    
    // 支援直接點擊或觸控晶圓矩陣注入/清除缺陷
    function handleMatrixCellClick(e) {
      if (repairIsBusy()) return;
      const rect = canvasMatrix.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = 280 / rect.width;
      const scaleY = 280 / rect.height;
      const localX = (clientX - rect.left) * scaleX;
      const localY = (clientY - rect.top) * scaleY;
      
      const pad = 12;
      const cellSize = (280 - pad * 2) / GRID_SIZE;
      const c = Math.floor((localX - pad) / cellSize);
      const r = Math.floor((localY - pad) / cellSize);
      
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        if (e.cancelable) e.preventDefault();
        // 缺陷集合變動後，舊掃描、備援配置與燒錄結果皆不再適用。
        spareRows = [];
        repairPhase = 'idle';
        defects.forEach(d => { matrixCells[d.r][d.c] = 1; });
        statSparesUsed.textContent = `0 / ${SPARE_ROW_CAPACITY}`;
        updateFuseboxMap(null, null, false);
        if (matrixCells[r][c] === 0) {
          // 注入缺陷
          matrixCells[r][c] = 1;
          defects.push({ r, c });
          logTerminal(`手動注入：已在位元單元 [R${r}C${c}] 新增缺陷。`, `MANUAL INJECTION: Defect added at bitcell [R${r}C${c}].`);
        } else {
          // 清除缺陷
          matrixCells[r][c] = 0;
          defects = defects.filter(d => !(d.r === r && d.c === c));
          logTerminal(`手動清除：已移除位元單元 [R${r}C${c}] 的缺陷。`, `MANUAL OVERRIDE: Defect cleared at bitcell [R${r}C${c}].`);
        }
        
        statDefectCount.textContent = defects.length.toString();
        if (defects.length > 0) {
          setRepairStatus('defect');
          lblScanStatus.className = 'badge-accent text-warn';
          setDieYield('failed');
          statDieYield.className = 'stat-val text-warn';
          btnRunBIST.disabled = false;
        } else {
          setRepairStatus('idle');
          lblScanStatus.className = 'badge-accent';
          setDieYield('normal');
          statDieYield.className = 'stat-val text-green';
          btnRunBIST.disabled = false;
        }
        btnRunBIRA.disabled = true;
        btnBurnFuse.disabled = true;
        drawMatrix();
      }
    }

    let activeScanInterval = null;
    let activeBiraTimeout = null;
    let activeBurnTimeout = null;

    function clearAllBistTimers() {
      if (activeScanInterval) { clearInterval(activeScanInterval); activeScanInterval = null; }
      if (activeBiraTimeout) { clearTimeout(activeBiraTimeout); activeBiraTimeout = null; }
      if (activeBurnTimeout) { clearTimeout(activeBurnTimeout); activeBurnTimeout = null; }
    }

    canvasMatrix.addEventListener('pointerdown', handleMatrixCellClick);
    canvasMatrix.style.cursor = 'crosshair';

    btnGenDefect.addEventListener('click', () => {
      if (repairIsBusy()) return;
      clearAllBistTimers();
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
      setRepairStatus('defect');
      lblScanStatus.className = 'badge-accent text-warn';
      statDefectCount.textContent = defects.length.toString();
      statSparesUsed.textContent = `0 / ${SPARE_ROW_CAPACITY}`;
      setDieYield('failed');
      statDieYield.className = 'stat-val text-warn';

      logTerminal(`已注入實體缺陷：${defects.length} 個不良位元單元，晶粒良率降為 0%。`, `PHYSICAL DEFECT INJECTED: ${defects.length} bad bitcells. DIE YIELD CRUSHED TO 0%.`);
      btnRunBIST.disabled = false;
      btnRunBIRA.disabled = true;
      btnBurnFuse.disabled = true;
    });

    btnRunBIST.addEventListener('click', () => {
      if (repairPhase !== 'idle') return;
      clearAllBistTimers();
      repairPhase = 'scanning';
      btnRunBIST.disabled = true;
      btnGenDefect.disabled = true;
      btnRunBIRA.disabled = true;
      btnBurnFuse.disabled = true;
      setRepairStatus('scanning');
      logTerminal('正在對 144 個位元單元執行 March C- 演算法…', 'RUNNING MARCH C- ALGORITHM ACROSS 144 BITCELLS...');

      let cur = 0;
      activeScanInterval = setInterval(() => {
        scanProgressLine = cur;
        drawMatrix();
        cur++;
        if (cur >= GRID_SIZE) {
          clearInterval(activeScanInterval);
          activeScanInterval = null;
          scanProgressLine = -1;
          drawMatrix();
          repairPhase = defects.length ? 'scanned' : 'idle';
          setRepairStatus('scanned');
          const addresses = defects.map(d => `R${d.r}C${d.c}`).join(', ');
          logTerminal(`BIST 掃描完成：已擷取缺陷位址 [${addresses}]。`, `BIST COMPLETED: Fault addresses captured at [${addresses}].`);
          btnRunBIRA.disabled = !defects.length;
          btnRunBIST.disabled = !!defects.length;
          btnGenDefect.disabled = false;
        }
      }, 50);
    });

    btnRunBIRA.addEventListener('click', () => {
      if (repairPhase !== 'scanned') return;
      clearAllBistTimers();
      repairPhase = 'solving';
      btnRunBIRA.disabled = true;
      btnGenDefect.disabled = true;
      setRepairStatus('solving');
      logTerminal('BIRA 列備援模型：計算含缺陷的相異列數。', 'BIRA ROW-REPAIR MODEL: Counting distinct defective rows.');

      activeBiraTimeout = setTimeout(() => {
        activeBiraTimeout = null;
        const requiredRows = [...new Set(defects.map(d => d.r))];
        btnGenDefect.disabled = false;
        if (requiredRows.length > SPARE_ROW_CAPACITY) {
          repairPhase = 'insufficient';
          spareRows = [];
          statSparesUsed.textContent = `0 / ${SPARE_ROW_CAPACITY}`;
          setRepairStatus('insufficient');
          lblScanStatus.className = 'badge-accent text-warn';
          setDieYield('failed');
          statDieYield.className = 'stat-val text-warn';
          updateFuseboxMap(null, null, false);
          logTerminal(`無法修復：需要 ${requiredRows.length} 列備援，容量只有 ${SPARE_ROW_CAPACITY} 列；未配置或燒錄。`,
            `UNREPAIRABLE: ${requiredRows.length} spare rows required; capacity is ${SPARE_ROW_CAPACITY}. No allocation or programming.`);
          btnBurnFuse.disabled = true;
          return;
        }
        spareRows = requiredRows;
        repairPhase = 'allocated';
        statSparesUsed.textContent = `${spareRows.length} / ${SPARE_ROW_CAPACITY}`;
        setRepairStatus('allocated');
        updateFuseboxMap('ALLOCATED', spareRows, false);
        const rows = spareRows.map(r => `SpareRow_${r}`).join(', ');
        logTerminal(`BIRA 解算：配置 ${spareRows.length} 列備援 [${rows}]。`, `BIRA SOLUTION: Allocate ${spareRows.length} Spare Rows [${rows}].`);
        btnBurnFuse.disabled = false;
      }, 400);
    });

    btnBurnFuse.addEventListener('click', () => {
      if (repairPhase !== 'allocated' || !spareRows.length || spareRows.length > SPARE_ROW_CAPACITY || defects.some(d => !spareRows.includes(d.r))) return;
      clearAllBistTimers();
      repairPhase = 'burning';
      btnBurnFuse.disabled = true;
      btnGenDefect.disabled = true;
      setRepairStatus('burning');
      logTerminal('⚡ [ATE_PROG] 對反熔絲巨集施加 5.5V、10µs 燒錄脈衝…', '⚡ [ATE_PROG] APPLYING 5.5V @ 10µs PULSE TO ANTIFUSE FUSEBOX MACRO...');

      activeBurnTimeout = setTimeout(() => {
        activeBurnTimeout = null;
        repairPhase = 'repaired';
        btnGenDefect.disabled = false;
        spareRows.forEach((r, idx) => {
          const rVal = [82, 78, 85, 76][idx % 4];
          logTerminal(`[ATE_BURN] ⚡ Row-CAM[${r}] 閘極氧化層硬擊穿… R_fil = ${rVal}Ω（<100Ω 通過）。`, `[ATE_BURN] ⚡ Row-CAM[${r}] Gate Oxide Hard Rupture... R_fil = ${rVal}Ω (<100Ω PASS).`);
        });

        defects.forEach(d => {
          matrixCells[d.r][d.c] = 2; // remapped green
        });
        drawMatrix();

        setRepairStatus('repaired');
        lblScanStatus.className = 'badge-accent text-green';
        setDieYield('repaired');
        statDieYield.className = 'stat-val text-green';
        updateFuseboxMap('BURNED', spareRows, true);

        logTerminal('✓ [ATE_VERIFY] 硬體 CAM 位址重導已啟用，已驗證 0 週期額外讀取延遲。', '✓ [ATE_VERIFY] HARDWARE CAM REDIRECTION ACTIVE. 0-CYCLE READ DELAY VERIFIED.');
        logTerminal('✓ [ATE_CHECKLIST_SIM] 所有熔絲暫存器已永久鎖定（教學模擬，非量產簽核）。晶粒良率回復：0% ➔ 100%！', '✓ [ATE_CHECKLIST_SIM] ALL FUSE REGISTERS HARD-LOCKED (demo sim — not a production sign-off). DIE YIELD RESCUED: 0% ➔ 100%!');
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
    const w = 480;
    const h = 220;
    const ctx = setupHiDPICanvas(canvasGamma, w, h);
    ctx.clearRect(0, 0, w, h);

    // 精密儀表背景格線
    drawInstrumentGrid(ctx, w, h, { divX: 40, divY: 30, showSubdivisions: true, centerCrosshair: false });

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
    ctx.strokeStyle = '#c4a574';
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
    g.addColorStop(0, 'rgba(196, 165, 116, 0.25)');
    g.addColorStop(1, 'rgba(196, 165, 116, 0.0)');
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
    ctx.fillText(isMuraCorrected
      ? labText('✓ 已套用 De-Mura LUT（亮度均勻）', '✓ DE-MURA LUT APPLIED (UNIFORM)')
      : labText('⚠ 偵測到原始 Mura 亮度不均', '⚠ RAW MURA UNEVENNESS DETECTED'), 16, 24);
  }

  function updateMuraUI() {
    if (!btnToggleMura) return;
    canvasMura.dataset.state = isMuraCorrected ? 'corrected' : 'raw';
    if (isMuraCorrected) {
      statUniformity.textContent = labText('99.4%（已補償）', '99.4% (Compensated)');
      statUniformity.className = 'stat-val text-green';
      statDeltaE.textContent = labText('0.45（難以察覺）', '0.45 (Imperceptible)');
      statDeltaE.className = 'stat-val text-cyan';
      statLutStatus.textContent = labText('已啟用 (64Kb)', 'ACTIVE (64Kb)');
      statLutStatus.className = 'stat-val text-green';
      btnToggleMura.textContent = currentLang === 'zh' ? '🔄 移除 De-Mura LUT 補償' : '🔄 Bypass De-Mura LUT';
    } else {
      statUniformity.textContent = labText('74.2%（原始 Mura）', '74.2% (Raw Mura)');
      statUniformity.className = 'stat-val text-warn';
      statDeltaE.textContent = labText('3.8（嚴重）', '3.8 (Severe)');
      statDeltaE.className = 'stat-val text-warn';
      statLutStatus.textContent = labText('未啟用補償', 'BYPASS');
      statLutStatus.className = 'stat-val text-cyan';
      btnToggleMura.textContent = currentLang === 'zh' ? '💡 載入 NVM De-Mura LUT 補償' : '💡 Apply NVM De-Mura LUT';
    }
  }
  if (btnToggleMura) {
    btnToggleMura.addEventListener('click', () => {
      isMuraCorrected = !isMuraCorrected;
      drawMuraCanvas();
      updateMuraUI();
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
    ctx.strokeStyle = 'rgba(196, 165, 116, 0.4)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(8, 36, 51, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 220, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 頂部透明電極與底部電極
    ctx.fillStyle = '#c4a574';
    ctx.fillRect(w / 2 - 200, 8, 400, 4);
    ctx.fillStyle = '#ff9d5c';
    ctx.fillRect(w / 2 - 200, h - 12, 400, 4);

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#c4a574';
    ctx.fillText(labText('頂部透明電極 (ITO)', 'TOP TRANSPARENT ELECTRODE (ITO)'), w / 2 - 90, 20);
    ctx.fillStyle = '#ff9d5c';
    ctx.fillText(labText('底部像素電極（+40V~50V 脈衝）', 'BOTTOM PIXEL ELECTRODE (+40V~50V PULSE)'), w / 2 - 110, h - 18);

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
    const w = 480;
    const h = 150;
    const ctx = setupHiDPICanvas(canvasWaveform, w, h);
    ctx.clearRect(0, 0, w, h);

    // Tektronix 示波器格線
    drawInstrumentGrid(ctx, w, h, { divX: 40, divY: 25, showSubdivisions: true, centerCrosshair: true });

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

  // 模式與語言切換共用同一個呈現函式，保留目前實驗狀態。
  function updateEinkMode() {
  const timingTrackEl = document.getElementById('waveformTimingTrack');
  if (currentEinkMode === 'mono') {
    lblEinkMode.textContent = currentLang === 'zh' ? '黑白快速更新' : 'MONO FAST REFRESH';
    lblPulseVolt.textContent = currentLang === 'zh' ? '±15V 脈衝 (32 K-bit · 4 KB)' : '±15V PULSE (32 K-bit · 4 KB)';
    valLutFootprint.textContent = '32 K-bit (4 KB)';
    lblPhaseTag.textContent = currentLang === 'zh' ? 'MTP／OTP 均衡' : 'MTP / OTP BALANCED';
    lblPhaseTag.className = 'phase-tag phase-otp';
    if (timingTrackEl) {
      timingTrackEl.innerHTML = '<span class="timing-step step-shake">Phase A: &plusmn;15V Shake (40ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-clear">Phase B: -15V Clear (60ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-drive">Phase C: +15V Drive (100ms)</span>';
    }
    txtPhaseDesc.innerHTML = currentLang === 'zh'
      ? '黑白波形已完全穩定，DDIC 採用純邏輯反熔絲 OTP 以取得成本優勢。'
      : 'Monochrome waveform is fully stabilized; DDICs deploy pure logic AntiFuse OTP for cost leadership.';
  } else if (currentEinkMode === 'esl') {
    lblEinkMode.textContent = currentLang === 'zh' ? '四色 ESL 電子貨架標籤' : '4-COLOR ESL LABEL';
    lblPulseVolt.textContent = currentLang === 'zh' ? '±32V 脈衝 (48 K-bit · 6 KB)' : '±32V PULSE (48 K-bit · 6 KB)';
    valLutFootprint.textContent = '48 K-bit (6 KB)';
    lblPhaseTag.textContent = currentLang === 'zh' ? 'MTP 使用中（轉換期）' : 'MTP ACTIVE (TRANSITION ERA)';
    lblPhaseTag.className = 'phase-tag phase-mtp';
    if (timingTrackEl) {
      timingTrackEl.innerHTML = '<span class="timing-step step-shake">Phase A: &plusmn;15V Shake (40ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-clear">Phase B: -32V Clear (80ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-drive">Phase C: +32V Color Drive (120ms)</span>';
    }
    txtPhaseDesc.innerHTML = currentLang === 'zh'
      ? '四色 ESL 處於轉換後期；設計公司在 OTP 定版前使用 MTP 進行韌體校準。'
      : '4-Color ESL is in late transition; design houses leverage MTP for firmware calibration before OTP freeze.';
  } else {
    lblEinkMode.textContent = currentLang === 'zh' ? 'Spectra 6 全彩' : 'SPECTRA 6 FULL COLOR';
    lblPulseVolt.textContent = currentLang === 'zh' ? '±50V 超高壓脈衝 (64 K-bit · 8 KB)' : '±50V ULTRA-HV PULSE (64 K-bit · 8 KB)';
    valLutFootprint.textContent = currentLang === 'zh' ? '64 K-bit（8 KB 高密度）' : '64 K-bit (8 KB High-Density)';
    lblPhaseTag.textContent = currentLang === 'zh' ? '必須採用 MTP（持續演進）' : 'MTP MANDATORY (ACTIVE EVOLUTION)';
    lblPhaseTag.className = 'phase-tag phase-mtp';
    if (timingTrackEl) {
      timingTrackEl.innerHTML = '<span class="timing-step step-shake">Phase A: &plusmn;15V Shake (40ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-clear">Phase B: -50V Clear (80ms)</span> <span class="timing-sep">&rarr;</span> <span class="timing-step step-drive">Phase C: +50V Target Drive (120ms)</span>';
    }
    txtPhaseDesc.innerHTML = currentLang === 'zh'
      ? '全彩粒子化學仍快速演進；波形無法一次定版，因此需要 64 K-bit (8 KB) MTP。'
      : 'Full-color particle chemistry is rapidly evolving; waveforms cannot be frozen once, mandating 64 K-bit (8 KB) MTP.';
  }
    if (currentLang === 'zh' && timingTrackEl) {
      const timingLabels = {"Phase A: ±15V Shake (40ms)": "階段 A：±15V 震盪 (40ms)", "Phase B: -15V Clear (60ms)": "階段 B：-15V 清除 (60ms)", "Phase C: +15V Drive (100ms)": "階段 C：+15V 驅動 (100ms)", "Phase B: -32V Clear (80ms)": "階段 B：-32V 清除 (80ms)", "Phase C: +32V Color Drive (120ms)": "階段 C：+32V 色彩驅動 (120ms)", "Phase B: -50V Clear (80ms)": "階段 B：-50V 清除 (80ms)", "Phase C: +50V Target Drive (120ms)": "階段 C：+50V 目標驅動 (120ms)"};
      timingTrackEl.querySelectorAll('.timing-step').forEach(step => { step.textContent = timingLabels[step.textContent] || step.textContent; });
    }
    drawWaveform();
  }
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(button => button.classList.toggle('active', button === btn));
      currentEinkMode = btn.dataset.mode;
      updateEinkMode();
    });
  });

  // 動畫循環：使用 IntersectionObserver 於視口可見時才驅動，並支援 prefers-reduced-motion
  let einkRafId = null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const capsuleCanvas = document.getElementById('canvasCapsule');

  function einkLoop() {
    drawCapsule();
    if (!prefersReduced) {
      einkRafId = requestAnimationFrame(einkLoop);
    }
  }

  if (capsuleCanvas && 'IntersectionObserver' in window && !prefersReduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!einkRafId) einkRafId = requestAnimationFrame(einkLoop);
        } else {
          if (einkRafId) { cancelAnimationFrame(einkRafId); einkRafId = null; }
        }
      });
    }, { threshold: 0.1 });
    observer.observe(capsuleCanvas);
  } else {
    drawCapsule();
  }

  // 初始化所有實驗室畫布
  redrawAllLabs();
  updateTrimUI(isTrimmed);
  updateMuraUI();
  renderRepairStatus();
  renderDieYield();
  logTerminal('模擬待命，等待注入缺陷…', 'SIMULATION IDLE. WAITING FOR DEFECT INJECTION...');
  updateCalculator();
  updateEinkMode();
});
