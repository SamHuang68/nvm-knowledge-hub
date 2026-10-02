// Readouts for the existing illustrative V² and CAM animations; no additional device model.
(() => {
  const element = id => document.getElementById(id);
  const text = (zh,en) => window.HubLanguage?.get() === 'zh' ? zh : en;
  function render() {
    const voltage = Number(element('ntvVdd').value);
    const reduction = ((1-(voltage/1.2)**2)*100).toFixed(1);
    element('iotPowerResult').textContent = text(
      `固定 α、C、f：${voltage.toFixed(2)} V 相對 1.2 V 的動態功耗減幅為 ${reduction}%。未包含漏電、頻率變化或電池壽命；波形不是實測啟動時序。`,
      `Fixed α, C, f: ${reduction}% dynamic-power reduction at ${voltage.toFixed(2)} V relative to 1.2 V. Excludes leakage, frequency changes and battery life; this waveform is not measured boot timing.`);
    element('ntvStateTag').textContent = text('概念波形 · 非實測啟動時序','Illustrative waveform · not measured boot timing');
    const patched = element('camStatusPc').textContent.includes('FF00');
    element('camOtpState').textContent = patched ? text('多工器啟用 · 時序待驗證','MUX ACTIVE · TIMING TO VERIFY') : text('待命／監測中','IDLE / MONITORING');
    element('iotCamResult').textContent = patched
      ? text('示例路徑：PC 0x0800_1240 → CAM 命中 → MUX → OTP 0x0800_FF00。原始 OTP 位元未改寫，等待週期須依目標時序驗證。','Example path: PC 0x0800_1240 → CAM match → MUX → OTP 0x0800_FF00. Original OTP bits are unchanged; wait states require target timing validation.')
      : text('目前路徑：PC 0x0800_1240 → 原始指令。注入缺陷可查看修補路徑。','Current path: PC 0x0800_1240 → original instruction. Inject a bug to inspect the patch route.');
    element('camTriggerBtn').setAttribute('aria-pressed',String(patched));
  }
  const initialize = () => {
    element('ntvVdd').addEventListener('input',render);
    element('camTriggerBtn').addEventListener('click',render);
    window.addEventListener('hub:language-change',render);
    render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
  else initialize();
})();
