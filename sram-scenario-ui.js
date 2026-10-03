import { estimate, integer } from './sram-repair-model.js';
import { SLOT_IDS, MAX_FILE_BYTES, STORAGE_KEY, ScenarioError, createSnapshot, createScenarioFile, parseScenarioFile, validateSource } from './sram-scenarios.js';
import { REPORT_CSS, buildScenarioReport, standaloneReport } from './sram-scenario-report.js';

export function initScenarios({ getState, applyState, isValid }) {
  const $ = id => document.getElementById(id);
  const L = (zh, en) => window.HubLanguage?.get() === 'zh' ? zh : en;
  const language = () => window.HubLanguage?.get() === 'zh' ? 'zh' : 'en';
  let slots = { A: null, B: null }, source = null, pending = null, storageState = 'ready';
  let status = null, failure = null, reading = false;
  const drafts = [];
  const importDialog = $('scenario-import-dialog'), summaryDialog = $('scenario-summary-dialog');
  const style = document.createElement('style'); style.textContent = REPORT_CSS; document.head.append(style);

  function errorText(code) {
    return ({
      size: L('檔案超過 64 KiB，未匯入；目前輸入與情境保持不變。', 'The file exceeds 64 KiB. Nothing was imported; current inputs and scenarios are unchanged.'),
      json: L('無法解析 JSON，未匯入；請使用本工具下載的情境檔。', 'The JSON could not be parsed. Nothing was imported; use a scenario file downloaded from this tool.'),
      format: L('這不是本工具的情境格式，未匯入。', 'This is not a scenario file from this tool. Nothing was imported.'),
      schema: L('不支援此檔案結構版本，未匯入；不會猜測轉換資料。', 'This schema version is unsupported. Nothing was imported; no conversion was guessed.'),
      model: L('情境的計算模型版本不同，未匯入；請使用對應版本核對。', 'The calculation model version differs. Nothing was imported; review it with the matching version.'),
      inputs: L('情境輸入缺漏、無效、超出範圍或超過欄位 80 字上限；目前輸入與已存情境保持不變。', 'Scenario inputs are missing, invalid, out of range or exceed 80 characters per field. Current inputs and saved scenarios are unchanged.'),
      source: L('情境來源識別格式不正確，未匯入。', 'The scenario source identifier is malformed. Nothing was imported.'),
      structure: L('情境欄位不完整或含未知欄位，未匯入。', 'The scenario fields are incomplete or include unknown fields. Nothing was imported.'),
      empty: L('檔案沒有已保存的 A 或 B 情境，未匯入。', 'The file contains no saved A or B scenario. Nothing was imported.'),
      read: L('無法讀取檔案，未匯入；可重新選取 JSON。', 'The file could not be read. Nothing was imported; select the JSON again.'),
      stored: L('此瀏覽器的既有情境資料無法讀取或驗證；未自動載入，也未覆寫儲存資料。可匯入有效 JSON 復原。', 'Existing browser scenario data could not be read or validated. It was not loaded or overwritten. Import a valid JSON copy to recover.'),
    })[code] || L('操作未完成；目前輸入保持不變。', 'The operation did not complete; current inputs are unchanged.');
  }
  function feedback() {
    const setText = (id, text) => { const node = $(id); if (node.textContent !== text) node.textContent = text; };
    $('scenario-error').hidden = !failure;
    setText('scenario-error', failure ? errorText(failure) : '');
    const [code, id] = status || [];
    setText('scenario-status', ({
      saved: L(`目前輸入已保存為情境 ${id}。`, `Current inputs saved as scenario ${id}.`),
      loaded: L(`已載入情境 ${id}；可返回前一份輸入。`, `Scenario ${id} loaded; previous inputs can be restored.`),
      restored: L('已返回前一份計算器輸入。', 'Previous calculator inputs restored.'),
      imported: L('已替換情境 A／B；目前計算器輸入保持不變。', 'Saved A / B replaced; current calculator inputs are unchanged.'),
      exported: L('已下載情境 JSON，可用本工具匯入還原。', 'Scenario JSON downloaded; import it with this tool to restore scenarios.'),
      canceled: L('已取消匯入；目前輸入與已存情境保持不變。', 'Import canceled; current inputs and saved scenarios are unchanged.'),
      report: L('已下載摘要 HTML；請另存 JSON 以便還原。', 'Summary HTML downloaded; retain the JSON separately for restoration.'),
      reading: L('正在讀取並驗證情境檔案。', 'Reading and validating the scenario file.'),
    })[code] || '');
    setText('scenario-storage-note', storageState === 'unavailable'
      ? L('瀏覽器儲存不可用：本次情境僅保留在此分頁，重新整理可能回到舊資料；請下載 JSON 保存。', 'Browser storage is unavailable: scenarios remain in this tab only and a reload may restore older data. Download JSON to keep this copy.')
      : storageState === 'invalid'
        ? L('既有瀏覽器資料尚未載入；計算器及 JSON 下載仍可使用。', 'Existing browser data was not loaded; the calculator and JSON downloads remain available.')
        : L('保存位置：此瀏覽器。清除網站資料會移除已存情境。', 'Storage: this browser. Clearing site data removes saved scenarios.'));
  }
  function announce(code, id) { failure = null; status = [code, id]; feedback(); }
  function reject(error) { failure = error instanceof ScenarioError ? error.code : 'read'; status = null; feedback(); }
  function renderCards() {
    for (const id of SLOT_IDS) {
      const area = $('scenario-' + id + '-values'), snapshot = slots[id];
      area.replaceChildren();
      if (!snapshot) {
        const p = document.createElement('p'); p.textContent = L('尚未保存。調整計算器後，將目前輸入存到這裡。', 'Not saved yet. Adjust the calculator, then save its current inputs here.'); area.append(p);
      } else {
        const s = snapshot.inputs, r = estimate(s), dl = document.createElement('dl');
        for (const [title, value] of [
          [L('SRAM 容量', 'SRAM capacity'), `${s.capacity} ${s.unit}`],
          [L('有效修復資料', 'Repair payload'), `${integer(r.payload)} bits`],
          [L('OTP 配置', 'OTP allocation'), `${integer(r.otp.allocated)} bits`],
          [L('eFuse 配置', 'eFuse allocation'), `${integer(r.efuse.allocated)} bits`],
        ]) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = title; dd.textContent = value; dl.append(dt, dd); }
        area.append(dl);
      }
      $('scenario-load-' + id).disabled = !snapshot;
    }
  }
  function refresh() {
    const valid = isValid(), any = SLOT_IDS.some(id => slots[id]);
    for (const id of SLOT_IDS) $('scenario-save-' + id).disabled = !valid;
    $('scenario-export').disabled = !any;
    $('scenario-summary').disabled = !any;
    $('scenario-undo').disabled = !drafts.length;
    $('scenario-import').disabled = reading;
    const state = JSON.stringify(getState());
    const same = SLOT_IDS.filter(id => slots[id] && JSON.stringify(slots[id].inputs) === state);
    $('scenario-draft-note').textContent = !valid
      ? L('目前輸入有錯誤；修正後才能保存。已存情境仍可查看與下載。', 'Current inputs have errors; correct them before saving. Saved scenarios can still be reviewed and downloaded.')
      : same.length
        ? L(`目前輸入與情境 ${same.join('、')} 相同。`, `Current inputs match scenario ${same.join(' / ')}.`)
        : L('目前計算器輸入尚未存為 A 或 B。', 'Current calculator inputs are not saved as A or B.');
    feedback();
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(createScenarioFile(slots))); storageState = 'ready'; }
    catch { storageState = 'unavailable'; }
  }
  function download(text, filename, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportScenarios() {
    download(JSON.stringify(createScenarioFile(slots), null, 2) + '\n', 'SRAM-repair-scenarios.json', 'application/json;charset=utf-8');
    announce('exported');
  }
  function fillReport(container, scenarios) {
    container.replaceChildren(buildScenarioReport(scenarios, { document, language: language() }));
  }
  function show(dialog, opener) {
    // Native close then restores this button even for WebKit pointer activation.
    opener.focus({ preventScroll: true });
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  for (const id of SLOT_IDS) {
    $('scenario-save-' + id).addEventListener('click', () => {
      if (!isValid()) return;
      try {
        slots[id] = createSnapshot(getState(), source);
        persist(); renderCards(); announce('saved', id); refresh();
      } catch (error) { reject(error); }
    });
    $('scenario-load-' + id).addEventListener('click', () => {
      if (!slots[id]) return;
      drafts.push(structuredClone(getState()));
      applyState(slots[id].inputs);
      announce('loaded', id); refresh();
    });
  }
  $('scenario-undo').addEventListener('click', () => {
    if (!drafts.length) return;
    applyState(drafts.pop()); announce('restored'); refresh();
  });
  $('scenario-export').addEventListener('click', exportScenarios);
  $('scenario-backup').addEventListener('click', exportScenarios);
  $('scenario-import').addEventListener('click', () => { $('scenario-file').value = ''; $('scenario-file').click(); });
  $('scenario-file').addEventListener('change', async () => {
    const file = $('scenario-file').files[0]; if (!file || reading) return;
    reading = true; announce('reading'); refresh();
    try {
      if (file.size > MAX_FILE_BYTES) throw new ScenarioError('size');
      const parsed = parseScenarioFile(await file.text());
      pending = parsed;
      fillReport($('scenario-import-preview'), parsed.scenarios);
      $('scenario-backup').disabled = !SLOT_IDS.some(id => slots[id]);
      reading = false; refresh();
      show(importDialog, $('scenario-import'));
      status = null; feedback();
    } catch (error) { pending = null; reject(error); }
    finally { reading = false; refresh(); }
  });
  const cancelImport = () => { pending = null; announce('canceled'); };
  $('scenario-import-cancel').addEventListener('click', () => { cancelImport(); importDialog.close(); });
  importDialog.addEventListener('cancel', cancelImport);
  $('scenario-import-confirm').addEventListener('click', () => {
    if (!pending) return;
    slots = pending.scenarios; pending = null;
    persist(); renderCards(); announce('imported'); refresh(); importDialog.close();
  });
  $('scenario-summary').addEventListener('click', event => {
    fillReport($('scenario-report'), slots);
    show(summaryDialog, event.currentTarget);
  });
  $('scenario-summary-close').addEventListener('click', () => summaryDialog.close());
  $('scenario-print').addEventListener('click', () => window.print());
  $('scenario-report-download').addEventListener('click', () => {
    const report = $('scenario-report').firstElementChild;
    if (!report) return;
    download(standaloneReport(report, language(), document), `SRAM-repair-summary-${language()}.html`, 'text/html;charset=utf-8');
    announce('report');
  });

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      try { slots = parseScenarioFile(saved).scenarios; }
      catch { storageState = 'invalid'; failure = 'stored'; }
    }
  } catch { storageState = 'unavailable'; }
  const abort = new AbortController(), timer = setTimeout(() => abort.abort(), 4000);
  fetch(new URL('data/release-lineage.json', import.meta.url), { signal: abort.signal })
    .then(response => { if (!response.ok) throw new Error('lineage'); return response.json(); })
    .then(data => { source = validateSource({ releaseId: data.releaseId, canonicalCommit: data.canonicalCommit }); })
    .catch(() => { source = null; }).finally(() => clearTimeout(timer));
  renderCards(); refresh();
  return {
    refresh,
    syncLanguage() {
      renderCards(); refresh();
      if (summaryDialog.open) fillReport($('scenario-report'), slots);
      if (importDialog.open && pending) fillReport($('scenario-import-preview'), pending.scenarios);
    },
  };
}
