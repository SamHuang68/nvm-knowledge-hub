import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateCryoNvmMetrics} from '../cryo-cmos-quantum-nvm-simulator.js';
import {calculateChipletUcieNvm,CHIPLET_TOPOLOGY_PRESETS} from '../chiplet-ucie-nvm-simulator.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.env.NVM_QA_OUTPUT || 'qa/後續改善-20261008/圖表審核/修正驗證');
await fs.mkdir(output,{recursive:true});
const server = await startTestServer(root);
const browser = await chromium.launch({channel:process.env.NVM_QA_BROWSER === 'chromium' ? undefined : 'msedge',headless:true});
const results = [];
const temperatures = [0.1,1,4.2,10,20,50,77,100,150,200,300];
const chartOnly = process.env.NVM_QA_CHART_DIAGNOSE === '1';

async function inspectChart(page,topology,mode,language) {
  return page.evaluate(async ({topology,mode,language}) => {
    const {calculateChipletUcieNvm,drawChipletUcieCanvas} = await import('./chiplet-ucie-nvm-simulator.js');
    const canvas = document.getElementById('chiplet-canvas');
    const ctx = canvas.getContext('2d');
    const records = [];
    const originals = {};
    const point = (x,y) => {
      const transform = ctx.getTransform();
      return {x:transform.a*x+transform.c*y+transform.e,y:transform.b*x+transform.d*y+transform.f};
    };
    for (const method of ['fillText','fillRect','strokeRect','moveTo','lineTo']) {
      originals[method] = ctx[method];
      ctx[method] = function(...args) {
        let item;
        if (method === 'fillText') {
          const [text,x,y] = args;
          const metrics = ctx.measureText(text);
          const left = point(x-metrics.actualBoundingBoxLeft,y-metrics.actualBoundingBoxAscent);
          const right = point(x+metrics.actualBoundingBoxRight,y+metrics.actualBoundingBoxDescent);
          item = {method,text,font:ctx.font,left:left.x,top:left.y,right:right.x,bottom:right.y,measureWidth:metrics.width};
        } else if (method === 'fillRect' || method === 'strokeRect') {
          const [x,y,width,height] = args;
          const a = point(x,y),b = point(x+width,y+height);
          const edge = method === 'strokeRect' ? ctx.lineWidth*(window.devicePixelRatio || 1)/2 : 0;
          item = {method,left:Math.min(a.x,b.x)-edge,top:Math.min(a.y,b.y)-edge,right:Math.max(a.x,b.x)+edge,bottom:Math.max(a.y,b.y)+edge,width,height};
        } else {
          const p = point(args[0],args[1]);
          const edge = ctx.lineWidth*(window.devicePixelRatio || 1)/2;
          item = {method,left:p.x-edge,top:p.y-edge,right:p.x+edge,bottom:p.y+edge};
        }
        records.push(item);
        return originals[method].apply(ctx,args);
      };
    }
    try {
      const metrics = calculateChipletUcieNvm({
        topologyKey:topology,
        roleKey:document.getElementById('chiplet-role-select').value,
        computePowerWatts:Number(document.getElementById('chiplet-power-slider').value),
        ambientTempC:Number(document.getElementById('chiplet-temp-slider').value),
        busWidthLanes:Number(document.getElementById('chiplet-lanes-select').value)
      });
      drawChipletUcieCanvas(canvas,metrics,mode,language === 'zh');
    } finally {
      for (const method of Object.keys(originals)) ctx[method] = originals[method];
    }
    const rect = canvas.getBoundingClientRect();
    return {topology,mode,language,cssWidth:rect.width,cssHeight:rect.height,bufferWidth:canvas.width,bufferHeight:canvas.height,devicePixelRatio:devicePixelRatio,records,outside:records.filter(item => item.left < -0.5 || item.top < -0.5 || item.right > canvas.width+0.5 || item.bottom > canvas.height+0.5),negativeRectangles:records.filter(item => item.width < 0 || item.height < 0),cssPlotWidth:rect.width-60,drawPlotWidth:canvas.width/devicePixelRatio-60};
  },{topology,mode,language});
}

async function checkCharts(page,language) {
  const charts = [];
  for (const topology of Object.keys(CHIPLET_TOPOLOGY_PRESETS)) {
    await page.locator('#chiplet-top-select').selectOption(topology);
    for (const mode of ['package_view','latency_breakdown']) {
      await page.locator(mode === 'package_view' ? '#chiplet-mode-pkg' : '#chiplet-mode-lat').click();
      const chart = await inspectChart(page,topology,mode,language);
      charts.push(chart);
      if (!chartOnly) {
        assert.deepEqual(chart.outside,[],`${topology}／${mode}／${language} 全部圖文與筆畫位於畫布內`);
        assert.deepEqual(chart.negativeRectangles,[],`${topology}／${mode} 沒有負寬高形狀`);
        assert.ok(chart.cssWidth >= 480,'畫布實際寬度保留完整拓撲與圖例');
        assert.ok(chart.cssPlotWidth > 80,'畫布繪圖區保留正寬拓撲');
        assert.ok(Math.abs(chart.cssWidth*chart.devicePixelRatio-chart.bufferWidth) < 1,'實際畫布與繪圖座標一致，避免壓縮或裁切');
        const expectedTextCount = mode === 'latency_breakdown' ? 5 : {monolithic_envm:4,chiplet_ucie_standard:5,chiplet_ucie_advanced:6,stacked_3d_hybrid:4}[topology];
        assert.equal(chart.records.filter(item => item.method === 'fillText').length,expectedTextCount,'全部原標題、說明與圖例保留');
        const expectedStrokeCount = mode === 'latency_breakdown' ? 0 : {monolithic_envm:3,chiplet_ucie_standard:3,chiplet_ucie_advanced:4,stacked_3d_hybrid:3}[topology];
        assert.equal(chart.records.filter(item => item.method === 'strokeRect').length,expectedStrokeCount,'全部原拓撲矩形筆畫保留');
        if (mode === 'latency_breakdown') {
          for (const label of language === 'zh' ? ['記憶體陣列','UCIe 往返','協定控制','延遲門檻'] : ['Array','UCIe RTT','Controller','Budget']) {
            assert.ok(chart.records.some(item => item.method === 'fillText' && item.text.includes(label)),`完整保留 ${label} 圖例或門檻`);
          }
          const bars = chart.records.filter(item => item.method === 'fillRect').slice(1);
          assert.equal(bars.length,3,'全部三段延遲比例保留');
          const metrics = calculateChipletUcieNvm({topologyKey:topology});
          for (const [index,value] of [metrics.tauArrayNs,metrics.tauRoundTripD2dNs,metrics.tauControllerNs].entries()) {
            assert.ok(Math.abs(bars[index].width/chart.drawPlotWidth-value/metrics.totalReadLatencyNs) < 1e-9,'延遲圖的既有比例不變');
          }
        }
      }
    }
  }
  return charts;
}

async function checkScrollRegion(page,touchEnabled) {
  const region = page.locator('.chiplet-chart-scroll-region');
  await region.focus();
  const state = await region.evaluate(el => ({tabindex:el.tabIndex,role:el.getAttribute('role'),label:el.getAttribute('aria-label'),description:el.getAttribute('aria-describedby'),overflowX:getComputedStyle(el).overflowX,touchAction:getComputedStyle(el).touchAction,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,scrollLeft:el.scrollLeft,pageX:scrollX,pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,maxTouchPoints:navigator.maxTouchPoints}));
  assert.equal(state.tabindex,0,'圖表局部捲動區可以鍵盤聚焦');
  assert.equal(state.role,'region','圖表局部捲動區保留區域語意');
  assert.equal(state.description,'chiplet-chart-scroll-hint','圖表提示與捲動區關聯');
  assert.ok((await page.locator('#chiplet-chart-scroll-hint').innerText()).length > 20,'左右捲動提示可見且有實際說明');
  assert.equal(state.overflowX,'auto','圖表使用原生局部捲動');
  assert.ok(state.touchAction.includes('pan-x'),'圖表允許觸控水平捲動');
  assert.ok(state.pageWidth <= state.viewport+1 && state.pageX === 0,'圖表不造成整頁橫向溢位');
  let keyboard,touchConditions;
  if (state.scrollWidth > state.clientWidth+1) {
    await region.evaluate(el => {el.scrollLeft=0;});
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.chiplet-chart-scroll-region').scrollLeft > 0);
    await page.waitForTimeout(200);
    const afterRight = await region.evaluate(el => el.scrollLeft);
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(value => document.querySelector('.chiplet-chart-scroll-region').scrollLeft < value,afterRight);
    await page.waitForTimeout(200);
    const afterLeft = await region.evaluate(el => el.scrollLeft);
    keyboard = {右鍵後:afterRight,左鍵後:afterLeft};
    assert.equal(await page.evaluate(() => scrollX),0,'圖表方向鍵操作不橫移整頁');
    if (touchEnabled) {
      assert.ok(state.maxTouchPoints > 0,'本機瀏覽器已啟用觸控模擬');
      touchConditions = {
        已核對:['原生局部 overflow-x:auto','內容寬度超過局部容器','touch-action 允許 pan-x','瀏覽器觸控條件'],
        受測限制:'本次只核對局部捲動條件，未執行觸控手勢；歷史本機 Edge 的有界對照未產生捲動，不能代替實體手機驗收。',
        本機歷史參照:'qa/後續改善-20261008/圖表審核/畫布修正驗證/觸控模擬診斷.json',
        參照用途:'僅供本機歷史診斷閱讀；乾淨 CI 不讀取或依賴該檔。'
      };
    }
    await region.evaluate(el => {el.scrollLeft=0;});
  }
  return {初始條件:state,鍵盤:keyboard,觸控條件:touchConditions};
}

async function exportCsv(page,id,name,keyboard = false) {
  const received = page.waitForEvent('download',{timeout:5000});
  if (keyboard) {
    await page.locator(`#${id}`).focus();
    await page.keyboard.press('Enter');
  } else {
    await page.locator(`#${id}`).click();
  }
  const download = await received;
  assert.equal(await download.failure(),null,'CSV 下載必須完成');
  const saved = path.join(output,name);
  await download.saveAs(saved);
  const lines = (await fs.readFile(saved,'utf8')).trim().split(/\r?\n/);
  return {name:download.suggestedFilename(),header:lines[0],rows:lines.slice(1).map(line => line.split(',').map(Number))};
}

function checkCryo(csv,config) {
  assert.equal(csv.header,'Temp_K,Bandgap_eV,CarrierIonizationPct,EffectiveSS_mVdec,EffectiveRes_Ohm,ReadPower_uW,CoherenceMarginPct','低溫 CSV 欄位契約');
  assert.equal(csv.rows.length,temperatures.length,'低溫 CSV 保留完整溫度掃描');
  assert.equal(csv.name,`cryo_cmos_${config.presetKey}_${config.techKey}.csv`,'低溫檔名對應目前預設與技術');
  for (const [index,temp] of temperatures.entries()) {
    const m = calculateCryoNvmMetrics({...config,customTempK:temp});
    const expected = [temp,Number(m.bandgapEv.toFixed(4)),Number(m.carrierIonizationPct.toFixed(2)),Number(m.effectiveSsMvPerDec.toFixed(2)),Number(m.effectiveROhm.toFixed(1)),Number(m.readPowerUw.toFixed(4)),Number(m.coherenceMarginPct.toFixed(1))];
    assert.deepEqual(csv.rows[index],expected,`低溫 ${temp}K 與既有公開計算契約一致`);
    assert.ok(csv.rows[index].every(Number.isFinite),'低溫 CSV 不含非有限數值');
  }
  assert.notEqual(csv.rows[0][1],csv.rows.at(-1)[1],'掃描兩端能隙必須隨溫度改變，不能全部使用預設溫度');
}

function checkChiplet(csv,config) {
  assert.equal(csv.header,'ComputePower_W,ReadLatency_ns,InterconnectEnergy_pJ_bit,Bandwidth_GBps,JunctionTemp_C,Yield_Percent','小晶片 CSV 欄位契約');
  assert.equal(csv.rows.length,23,'小晶片 CSV 保留 10 到 120W 的完整功耗掃描');
  assert.equal(csv.name,`chiplet_ucie_${config.topologyKey}_${config.roleKey}.csv`,'小晶片檔名對應目前拓撲與用途');
  for (const [index,row] of csv.rows.entries()) {
    const power = 10 + index * 5;
    const m = calculateChipletUcieNvm({...config,computePowerWatts:power});
    assert.deepEqual(row,[power,m.totalReadLatencyNs,m.interconnectEnergyPjBit,m.totalBandwidthGBps,m.nvmJunctionTempC,m.chipletYieldPercent],`小晶片 ${power}W 與既有公開計算契約一致`);
    assert.ok(row.every(Number.isFinite),'小晶片 CSV 不含非有限數值');
  }
}

async function checkBounds(page) {
  const geometry = await page.evaluate(() => {
    const items = [];
    for (const rootId of ['chiplet-ucie-simulator-root','cryo-cmos-simulator-root']) {
      for (const el of document.getElementById(rootId).querySelectorAll('button,select,input')) {
        if (!el.getClientRects().length) continue;
        const r = el.getBoundingClientRect();
        const clip = [];
        for (let p = el.parentElement; p; p = p.parentElement) {
          const b = p.getBoundingClientRect();
          if (['hidden','clip'].includes(getComputedStyle(p).overflowX) && (r.x < b.x - 1 || r.right > b.right + 1)) clip.push(p.id || p.className);
        }
        items.push({id:el.id || el.dataset.copyValue,x:r.x,right:r.right,width:r.width,height:r.height,clip});
      }
    }
    return {viewport:innerWidth,items};
  });
  for (const item of geometry.items) {
    assert.ok(item.x >= -1 && item.right <= geometry.viewport + 1,`${item.id} 在視窗內完整呈現`);
    assert.deepEqual(item.clip,[],`${item.id} 不被祖先裁切`);
    assert.ok(item.width > 0 && item.height > 0,`${item.id} 具有實際操作範圍`);
  }
  return geometry;
}

async function checkLabels(page,language) {
  const labels = await page.evaluate(() => ['chiplet-export-csv-btn','cryo-export-csv-btn'].map(id => ({id,text:document.getElementById(id).textContent,aria:document.getElementById(id).getAttribute('aria-label')})));
  assert.equal(labels[0].text,language === 'zh' ? '📥 匯出 UCIe 數據 CSV' : '📥 Export UCIe CSV','小晶片匯出名稱依目前語系');
  assert.equal(labels[1].text,language === 'zh' ? '📥 匯出 Cryo-CMOS 低溫特性 CSV' : '📥 Export Cryo-CMOS CSV','低溫匯出名稱依目前語系');
  for (const label of labels) assert.ok(language === 'zh' ? label.aria.startsWith('匯出') : label.aria.startsWith('Export'),'匯出無障礙名稱依目前語系');
  return labels;
}

try {
  for (const width of [320,390,1440]) {
    for (const language of ['en','zh']) {
      const context = await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',acceptDownloads:true,hasTouch:width<1440});
      await context.route('**/*',route => new URL(route.request().url()).origin === new URL(server.base).origin ? route.continue() : route.abort());
      await context.addInitScript(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async () => {throw new Error('本測試不使用真實剪貼簿');}}}));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror',error => errors.push(error.message));
      const result = {寬度:width,初始語系:language,通過:false};
      try {
        await page.goto(`${server.base}specialty-nvm.html?lang=${language}`,{waitUntil:'networkidle'});
        await page.waitForSelector('#cryo-export-csv-btn');
        if (chartOnly) {
          result.診斷狀態 = '僅診斷、未驗證';
          result.畫布診斷 = await checkCharts(page,language);
          continue;
        }
        result.初始邊界 = await checkBounds(page);
        result.初始標籤 = await checkLabels(page,language);
        result.圖表邊界 = await checkCharts(page,language);
        result.圖表捲動 = await checkScrollRegion(page,width<1440);
        await page.locator('#chiplet-top-select').selectOption('chiplet_ucie_advanced');
        await page.locator('#chiplet-mode-pkg').click();
        const prefix = `${width}-${language}`;
        const defaultCryo = await exportCsv(page,'cryo-export-csv-btn',`${prefix}-低溫預設.csv`);
        checkCryo(defaultCryo,{presetKey:'cryo_dilution_fridge_4k',techKey:'antifuse_ohmic_filament',readBiasMv:400});
        const defaultChiplet = await exportCsv(page,'chiplet-export-csv-btn',`${prefix}-小晶片預設.csv`);
        checkChiplet(defaultChiplet,{topologyKey:'chiplet_ucie_advanced',roleKey:'secure_boot_rot',ambientTempC:70,busWidthLanes:16});

        await page.locator('#cryo-bias-slider').focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('#cryo-bias-val').innerText(),'450 mV','偏壓支援鍵盤調整並更新數值');
        await page.locator('#cryo-mode-power').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#cryo-mode-power').getAttribute('aria-pressed'),'true','低溫圖表支援鍵盤切換');
        await page.locator('#chiplet-mode-lat').focus();
        await page.keyboard.press('Space');
        assert.equal(await page.locator('#chiplet-mode-lat').getAttribute('aria-pressed'),'true','小晶片圖表支援鍵盤切換');

        await page.locator('#cryo-preset-select').selectOption('room_temp_300k_baseline');
        await page.locator('#cryo-tech-select').selectOption('stt_mram_spintronic');
        await page.locator('#cryo-bias-slider').focus();
        await page.keyboard.press('End');
        const changedCryo = await exportCsv(page,'cryo-export-csv-btn',`${prefix}-低溫變更.csv`,true);
        checkCryo(changedCryo,{presetKey:'room_temp_300k_baseline',techKey:'stt_mram_spintronic',readBiasMv:1000});
        assert.equal(changedCryo.rows[0][5],39.36,'STT-MRAM 在 0.1K／1000mV 的固定教學輸出');
        assert.equal(changedCryo.rows.at(-1)[5],400,'STT-MRAM 在 300K／1000mV 的固定教學輸出');

        await page.locator('#chiplet-top-select').selectOption('chiplet_ucie_standard');
        await page.locator('#chiplet-lanes-select').selectOption('4');
        await page.locator('#chiplet-temp-slider').focus();
        await page.keyboard.press('ArrowRight');
        const ambientTempC = Number(await page.locator('#chiplet-temp-slider').inputValue());
        const changedChiplet = await exportCsv(page,'chiplet-export-csv-btn',`${prefix}-小晶片變更.csv`,true);
        checkChiplet(changedChiplet,{topologyKey:'chiplet_ucie_standard',roleKey:'secure_boot_rot',ambientTempC,busWidthLanes:4});
        assert.notEqual(defaultChiplet.rows[0][1],changedChiplet.rows[0][1],'切換拓撲確實改變匯出延遲');
        assert.notEqual(defaultChiplet.rows[0][3],changedChiplet.rows[0][3],'切換通道數確實改變匯出頻寬');

        await page.locator('#languageToggle').click();
        const switched = language === 'zh' ? 'en' : 'zh';
        await page.waitForFunction(expected => window.HubLanguage.get() === expected,switched);
        result.切換標籤 = await checkLabels(page,switched);
        const scrollLabel = await page.locator('.chiplet-chart-scroll-region').getAttribute('aria-label');
        assert.equal(scrollLabel,switched === 'zh' ? '小晶片拓撲與延遲圖表，可橫向捲動' : 'Chiplet topology and latency chart, horizontally scrollable','語系切換同步圖表捲動區名稱');
        const scrollHint = await page.locator('#chiplet-chart-scroll-hint').innerText();
        assert.ok(switched === 'zh' ? scrollHint.includes('左右捲動') : scrollHint.includes('scroll the chart horizontally'),'語系切換同步可見捲動提示');
        assert.equal(await page.locator('#cryo-bias-slider').inputValue(),'1000','語系切換保留偏壓');
        assert.equal(await page.locator('#cryo-tech-select').inputValue(),'stt_mram_spintronic','語系切換保留技術');
        assert.equal(await page.locator('#chiplet-top-select').inputValue(),'chiplet_ucie_standard','語系切換保留拓撲');
        result.切換後邊界 = await checkBounds(page);
        const switchedCryo = await exportCsv(page,'cryo-export-csv-btn',`${prefix}-低溫切換語系.csv`);
        const switchedChiplet = await exportCsv(page,'chiplet-export-csv-btn',`${prefix}-小晶片切換語系.csv`);
        assert.deepEqual(switchedCryo.rows,changedCryo.rows,'語系切換後低溫 CSV 保留目前資料');
        assert.deepEqual(switchedChiplet.rows,changedChiplet.rows,'語系切換後小晶片 CSV 保留目前資料');
        assert.deepEqual(errors,[],'操作期間沒有未捕捉例外');
        result.匯出證據 = {低溫列數:changedCryo.rows.length,低溫兩端功耗:[changedCryo.rows[0][5],changedCryo.rows.at(-1)[5]],小晶片列數:changedChiplet.rows.length,小晶片首列:changedChiplet.rows[0]};
        for (const [id,name] of [['chiplet-export-csv-btn','小晶片控制項'],['cryo-export-csv-btn','低溫控制項']]) {
          await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await page.screenshot({path:path.join(output,`${width}-${switched}-${name}.png`)});
        }
        for (const [id,name] of [['chiplet-mode-pkg','小晶片拓撲'],['chiplet-mode-lat','小晶片延遲圖']]) {
          await page.locator(`#${id}`).click();
          const chartRegion = page.locator('.chiplet-chart-scroll-region');
          await chartRegion.scrollIntoViewIfNeeded();
          await chartRegion.evaluate(el => {el.scrollLeft=0;});
          await page.screenshot({path:path.join(output,`${width}-${switched}-${name}-左端視窗.png`)});
          await chartRegion.evaluate(el => {el.scrollLeft=el.scrollWidth-el.clientWidth;});
          await page.screenshot({path:path.join(output,`${width}-${switched}-${name}-右端視窗.png`)});
          const drawing = await page.locator('#chiplet-canvas').evaluate(el => el.toDataURL('image/png'));
          await fs.writeFile(path.join(output,`${width}-${switched}-${name}-完整畫布.png`),Buffer.from(drawing.split(',')[1],'base64'));
        }
        result.通過 = true;
      } catch (error) {
        result.錯誤 = error.stack;
      } finally {
        results.push(result);
        await context.close();
      }
    }
  }
} finally {
  await fs.writeFile(path.join(output,'特種製程匯出結果.json'),JSON.stringify({類型:chartOnly ? '座標診斷，不判定圖文邊界通過' : '必要驗證',情境數:results.length,通過數:results.filter(r => r.通過).length,結果:results},null,2));
  await browser.close();
  await server.close();
}
const chartCount = results.reduce((count,result) => count+(result.圖表邊界?.length || 0),0);
console.log(chartOnly ? `畫布原始座標診斷：${results.length} 個情境完成；此模式不判定圖文邊界通過。` : `特種製程匯出：${results.filter(r => r.通過).length}／${results.length} 情境通過，${chartCount} 個圖表邊界已檢查。`);
for (const result of results.filter(r => !r.通過 && r.錯誤)) console.error(`${result.寬度}px／${result.初始語系}：${result.錯誤}`);
if (chartOnly) process.exitCode = 2;
else if (results.some(r => !r.通過)) process.exitCode = 1;
