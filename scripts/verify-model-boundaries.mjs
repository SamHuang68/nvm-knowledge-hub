import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa/model-boundaries');
fs.mkdirSync(output, { recursive: true });
const results = [];
const errors = [];
let server, browser;
try {
  server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
  const base = process.env.NVM_QA_BASE || server.base;
  const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const width of [1440, 390]) for (const language of ['en','zh']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    const open = file => page.goto(new URL(`${file}?lang=${language}`,base).href,{waitUntil:'load'});
    const overflow = async () => assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal overflow');

    await open('technology-comparison.html');
    const constraints = ['selNode','sliderPower','selMask','selTemp','selEndurance'];
    const initial = await page.evaluate(ids => ids.map(id => {
      const input = document.getElementById(id);
      return { value: input.value, label: input.getAttribute('aria-valuetext') };
    }), constraints);
    await page.evaluate(ids => ids.forEach(id => {
      const input = document.getElementById(id);
      input.value = input.value === input.min ? input.max : input.min;
      input.dispatchEvent(new Event('input'));
    }), constraints);
    await page.locator('#resetSelector').focus(); await page.locator('#resetSelector').press('Space');
    await page.waitForFunction(({ ids, initial }) => ids.every((id,index) => {
      const input = document.getElementById(id);
      return input.value === initial[index].value && input.getAttribute('aria-valuetext') === initial[index].label;
    }), { ids: constraints, initial });
    await overflow();
    results.push({width,language,scenario:'Five selector constraints and accessible readouts reset to current defaults',passed:true});

    await open('automotive-nvm.html');
    await page.waitForFunction(()=>document.querySelectorAll('#eccBitsDeck button').length === 72);
    const bits=page.locator('#eccBitsDeck button');
    await bits.nth(71).focus(); await bits.nth(71).press('Space');
    assert.equal(await bits.nth(71).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#eccSyndromeVal').textContent(),'S = 0x00 · P = 1');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.bit),'71');
    await page.locator('#btnInjectDouble').click();
    assert.equal(await page.locator('#eccSyndromeVal').textContent(),'S = 0x01 · P = 0');
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-decoder'),'uncorrectable');
    await page.locator('#btnResetEcc').click();
    for(const index of [0,1,2]) await bits.nth(index).click();
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-state'),'outside-guarantee');
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-decoder'),'correctable');
    await bits.nth(71).click();
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-decoder'),'no-error-detected');
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-state'),'outside-guarantee');
    await page.locator('#languageToggle').click(); await page.locator('#languageToggle').click();
    assert.equal(await page.locator('#eccBitsDeck').getAttribute('data-errors'),'4');
    assert.match(await page.locator('#eccSafetyVal').textContent(),language === 'zh' ? /漏檢/ : /missed detection/);
    assert.ok(await page.evaluate(() => {
      const bounds = document.querySelector('#eccBitsDeck').getBoundingClientRect();
      return [...document.querySelectorAll('#eccBitsDeck button')].every(button => {
        const rect = button.getBoundingClientRect();
        // Flipped buttons intentionally scale 1.06 on hover; allow two pixels for that treatment.
        return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2;
      });
    }), 'all 72 bit buttons fit inside the visible grid');
    await page.locator('#tempSlider').evaluate(el=>{el.value='55';el.dispatchEvent(new Event('input'));});
    assert.equal(await page.locator('#afVal').getAttribute('data-value'),'1');
    await page.locator('#yearSlider').evaluate(el=>{el.value='25';el.dispatchEvent(new Event('input'));});
    assert.equal(await page.locator('#afVal').getAttribute('data-value'),'1');
    assert.match(await page.locator('#thermalSummary').textContent(),language === 'zh' ? /並非由 AF 推導/ : /not an AF-derived/);
    await overflow();
    await page.locator('#sec-ecc').screenshot({path:path.join(output,`ecc-${width}-${language}.png`)});
    results.push({width,language,scenario:'SECDED parity, >2-bit counterexamples, keyboard and thermal assumptions',passed:true});

    await open('security-assurance.html');
    const certified=page.locator('#evidenceLadder button[data-level="4"]');
    await certified.focus(); await certified.press('Space');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.level),'4');
    assert.match(await page.locator('#evidenceDetail .model-boundary').textContent(),language==='zh'?/不表示/:/does not claim/);
    await page.locator('#languageToggle').click(); await page.locator('#languageToggle').click();
    assert.equal(await certified.getAttribute('aria-pressed'),'true');
    await page.locator('#marketSelect').selectOption('auto');
    assert.match(await page.locator('#certResult .route').textContent(),language==='zh'?/非認證結果/:/NOT A CERTIFICATION RESULT/);
    assert.match(await page.locator('#certResult .cert-selection').textContent(),language==='zh'?/車用/:/Automotive/);
    await overflow();
    results.push({width,language,scenario:'Assurance focus survives selection and category is not a product certification',passed:true});

    await open('iot-mcu-envm.html');
    await page.locator('#ntvVdd').evaluate(el=>{el.value='0.6';el.dispatchEvent(new Event('input'));});
    assert.match(await page.locator('#iotPowerResult').textContent(),/75.0%/);
    assert.match(await page.locator('#iotPowerResult').textContent(),language==='zh'?/固定 α、C、f/:/Fixed α, C, f/);
    await page.locator('#camTriggerBtn').click();
    assert.equal(await page.locator('#camTriggerBtn').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#iotCamResult').textContent(),/0x0800_FF00/);
    await page.locator('#languageToggle').click(); await page.locator('#languageToggle').click();
    assert.equal(await page.locator('#camTriggerBtn').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#camOtpState').textContent(),language==='zh'?/待驗證/:/TO VERIFY/);
    await overflow();
    results.push({width,language,scenario:'IoT V² assumptions and bounded CAM redirect survive locale changes',passed:true});

    await open('oip-secure-storage.html');
    const phases=page.locator('.lifecycle-controls button');
    await phases.first().focus(); await phases.first().press('End');
    assert.equal(await page.locator('#lifecycleOutput').getAttribute('data-phase'),'zeroize');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.phase),'zeroize');
    const persistence = await page.locator('#phasePersistent').textContent();
    for(const phase of ['off','reconstruct','access','zeroize']) {
      await page.locator(`.lifecycle-controls button[data-phase="${phase}"]`).click();
      assert.equal(await page.locator('#lifecycleOutput').getAttribute('data-phase'),phase);
      assert.equal(await page.locator('#phasePersistent').textContent(),persistence);
      const evidence = await page.locator('#phaseEvidence').textContent();
      const expected = { off: /power|電源/i, reconstruct: /PVT/, access: /APB/, zeroize: /zeroization|零化/i };
      assert.match(evidence, expected[phase]);
    }
    await page.locator('#languageToggle').click(); await page.locator('#languageToggle').click();
    assert.equal(await page.locator('#lifecycleOutput').getAttribute('data-phase'),'zeroize');
    assert.equal(await page.locator('#phasePersistent').textContent(),persistence);
    await overflow();
    await page.locator('.lifecycle-reader').screenshot({path:path.join(output,`lifecycle-${width}-${language}.png`)});
    results.push({width,language,scenario:'OIP four phases, persistent-state distinction, keyboard and locale preservation',passed:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);
} catch(error) {
  results.push({passed:false,error:error.stack}); process.exitCode=1;
} finally {
  await browser?.close(); await server?.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
}
