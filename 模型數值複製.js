// 複製回饋與模型輸出分離；非同步結果永遠不覆寫計算數值。
const states = new WeakMap();
const copyIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M9 8h11v13H9zM5 16H3V3h11v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
const language = () => (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'en').startsWith('zh');
const text = () => language()
  ? {copy:'複製數值',busy:'正在複製',done:'已複製',failed:'無法複製；請選取數值後手動複製。'}
  : {copy:'Copy value',busy:'Copying',done:'Copied',failed:'Unable to copy. Select the value and copy it manually.'};

function installStyles() {
  if (document.getElementById('model-value-copy-styles')) return;
  const style = document.createElement('style');
  style.id = 'model-value-copy-styles';
  style.textContent = `
    .model-value-copy {display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:0;max-width:100%}
    .model-value-copy > :first-child {min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere}
    .model-value-copy-button {display:inline-flex;align-items:center;justify-content:center;flex:0 0 44px;width:44px;min-height:44px;padding:8px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;cursor:pointer}
    .model-value-copy-button:hover {background:rgba(127,127,127,.12)}
    .model-value-copy-button:focus-visible {outline:2px solid currentColor;outline-offset:3px}
    .model-value-copy-button:disabled {opacity:.65;cursor:wait}
    .model-value-copy-status {flex-basis:100%;min-width:0;font:400 12px/1.5 sans-serif;white-space:normal;overflow-wrap:anywhere}
    .model-value-copy-status:empty {display:none}
  `;
  document.head.appendChild(style);
}

function refresh(element,state) {
  const labels = text();
  state.wrapper.style.color = element.style.color || 'inherit';
  element.title = labels.copy;
  state.button.setAttribute('aria-label', `${state.busy ? labels.busy : labels.copy}: ${element.textContent.trim()}`);
  state.button.title = element.title;
  if (state.message === 'done') state.status.textContent = `${labels.done}: ${state.copied}`;
  if (state.message === 'failed') state.status.textContent = labels.failed;
  if (state.busy) state.status.textContent = labels.busy;
}

async function copyValue(element,state) {
  if (state.busy) return;
  const value = element.textContent.trim();
  state.busy = true;
  state.message = '';
  state.button.disabled = true;
  state.button.setAttribute('aria-busy','true');
  clearTimeout(state.feedbackTimer);
  refresh(element,state);
  let timeout;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('剪貼簿不可用');
    await Promise.race([
      navigator.clipboard.writeText(value),
      new Promise((_,reject) => {timeout=setTimeout(()=>reject(new Error('剪貼簿逾時')),8000);})
    ]);
    state.message = 'done';
    state.copied = value;
  } catch {
    state.message = 'failed';
  } finally {
    clearTimeout(timeout);
    state.busy = false;
    state.button.disabled = false;
    state.button.setAttribute('aria-busy','false');
    if (element.isConnected) refresh(element,state);
  }
  if (state.message === 'done') {
    state.feedbackTimer=setTimeout(()=>{
      state.message='';
      state.status.textContent='';
    },1200);
  }
}

export function syncMetricCopy(elements) {
  installStyles();
  for (const element of elements) {
    if (!element) continue;
    let state = states.get(element);
    if (!state) {
      const wrapper=document.createElement('div'),button=document.createElement('button'),status=document.createElement('span');
      wrapper.className='model-value-copy';
      button.className='model-value-copy-button';
      button.type='button';
      button.dataset.copyValue=element.id;
      button.innerHTML=copyIcon;
      status.className='model-value-copy-status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      status.setAttribute('aria-atomic','true');
      element.before(wrapper);
      wrapper.append(element,button,status);
      state={wrapper,button,status,busy:false,message:'',copied:''};
      states.set(element,state);
      element.dataset.copyAttached='true';
      element.style.cursor='pointer';
      button.addEventListener('click',()=>copyValue(element,state));
      element.addEventListener('click',()=>copyValue(element,state));
    }
    refresh(element,state);
  }
}
