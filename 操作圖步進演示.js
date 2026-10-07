// 原始比較圖是完整教材；演示只投影同一組 SVG，不推算物理中間態或時間。
const isEnglish = () => (window.HubLanguage?.get() || document.documentElement.lang) === 'en';
const say = (zh, en) => isEnglish() ? en : zh;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const staticView = new URLSearchParams(location.search).get('motion') === 'static';
const demos = new Map();
const hold = 1200;

export function cloneDiagram(original, suffix = 'engineering-zoom') {
  const svg = original.cloneNode(true);
  const ids = new Map([svg, ...svg.querySelectorAll('[id]')].filter(node => node.id).map(node => [node.id, `${node.id}--${suffix}`]));
  for (const node of [svg, ...svg.querySelectorAll('*')]) {
    if (ids.has(node.id)) node.id = ids.get(node.id);
    for (const attribute of [...node.attributes]) {
      let value = attribute.value;
      for (const [oldId, newId] of ids) value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`);
      if (['aria-labelledby', 'aria-describedby'].includes(attribute.name)) value = value.split(' ').map(id => ids.get(id) || id).join(' ');
      if (['href', 'xlink:href'].includes(attribute.name) && value.startsWith('#')) value = '#' + (ids.get(value.slice(1)) || value.slice(1));
      if (value !== attribute.value) node.setAttribute(attribute.name, value);
    }
    if (node.localName === 'style') node.textContent = node.textContent.replace(/#([A-Za-z0-9_:.-]+)/g, (match, id) => ids.has(id) ? '#' + ids.get(id) : match);
  }
  return svg;
}

// 將已顯示的圖面樣式寫入 SVG，下載後不依賴網站的外部 CSS。
export function exportDiagram(original) {
  const clone = original.cloneNode(true);
  const properties = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'fill-opacity', 'stroke-opacity', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'vector-effect', 'stop-color', 'stop-opacity'];
  const sources = [original, ...original.querySelectorAll('*')];
  const targets = [clone, ...clone.querySelectorAll('*')];
  sources.forEach((source, index) => {
    if (['title', 'desc', 'style', 'defs'].includes(source.localName)) return;
    const computed = getComputedStyle(source);
    for (const property of properties) {
      const value = computed.getPropertyValue(property);
      if (value) targets[index].style.setProperty(property, value);
    }
  });
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return clone;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function enhanceVariant(variant) {
  if (demos.has(variant) || !variant.checkVisibility()) return;
  const frames = [...variant.querySelectorAll(':scope > .nvm-op-frames > .nvm-op-frame')];
  const svgs = frames.map(frame => frame.querySelector('.nvm-op-drawing > svg'));
  if (frames.length < 3 || frames.length > 8 || svgs.some(svg => !svg)) return;
  // 只有相同圖框的圖序適合直接投影；其他圖組保留原始並排比較。
  if (new Set(svgs.map(svg => svg.getAttribute('viewBox'))).size !== 1) return;
  const sequenceId = frames[0].dataset.figureName.replace(/-1$/, '');
  const root = element('div', 'nvm-step-demo');
  root.dataset.nvmStepRoot = sequenceId;
  root.dataset.stepCount = String(frames.length);
  root.dataset.stepCurrent = '1';
  root.dataset.stepMode = 'step';
  root.dataset.frame = 'start';
  const header = element('div', 'nvm-step-head');
  const heading = element('h6');
  const count = element('span', 'nvm-step-count');
  header.append(heading, count);
  const layout = element('div', 'nvm-step-layout');
  const stage = element('div', 'nvm-step-stage');
  stage.id = `nvm-step-${sequenceId}`;
  stage.tabIndex = 0;
  stage.style.aspectRatio = `${svgs[0].viewBox.baseVal.width} / ${svgs[0].viewBox.baseVal.height}`;
  const notes = element('div', 'nvm-step-notes');
  const frameTitle = element('h6', 'nvm-step-title');
  const frameNotes = element('div', 'nvm-step-description');
  notes.append(frameTitle, frameNotes);
  layout.append(stage, notes);
  const timeline = element('ol', 'nvm-step-timeline');
  frames.forEach((frame, index) => {
    const item = element('li');
    const ordinal = element('span', 'nvm-step-ordinal', String(index + 1).padStart(2, '0'));
    const label = element('span', 'nvm-step-label', frame.querySelector('h6').textContent);
    item.append(ordinal, label);
    timeline.append(item);
  });
  const controls = element('div', 'nvm-step-controls');
  controls.setAttribute('role', 'group');
  const buttons = {};
  for (const action of ['prev', 'play', 'next', 'reset']) {
    const button = element('button');
    button.type = 'button';
    button.dataset.nvmStepAction = action;
    button.setAttribute('aria-controls', stage.id);
    buttons[action] = button;
    controls.append(button);
  }
  buttons.play.setAttribute('aria-pressed', 'false');
  const guidance = element('p', 'nvm-step-guidance');
  const status = element('p', 'nvm-step-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  root.append(header, layout, timeline, controls, guidance, status);
  let current = 0;
  let timer = null;
  let playing = false;
  let inViewport = true;
  const visible = () => inViewport && variant.checkVisibility() && document.visibilityState !== 'hidden';
  const clearClock = () => { clearTimeout(timer); timer = null; };
  const stageName = () => frames[current].querySelector('h6').textContent;
  const announcement = () => say(`第 ${current + 1}／${frames.length} 步：${stageName()}`, `Step ${current + 1} of ${frames.length}: ${stageName()}`);
  const updateButtons = () => {
    buttons.prev.disabled = current === 0;
    buttons.next.disabled = current === frames.length - 1;
    buttons.play.textContent = playing ? say('Ⅱ 暫停', 'Ⅱ Pause') : say('▶ 播放', '▶ Play');
    buttons.play.setAttribute('aria-pressed', String(playing));
    buttons.play.setAttribute('aria-label', playing ? say('暫停步進演示', 'Pause Step Demonstration') : say('播放步進演示', 'Play Step Demonstration'));
    root.dataset.playing = String(playing);
  };
  function pause(announce = false) {
    clearClock();
    playing = false;
    updateButtons();
    if (announce) status.textContent = say(`已暫停於第 ${current + 1}／${frames.length} 步`, `Paused at step ${current + 1} of ${frames.length}`);
  }
  function render(next, announce = false) {
    current = Math.max(0, Math.min(frames.length - 1, next));
    root.dataset.stepCurrent = String(current + 1);
    root.dataset.frame = current === frames.length - 1 ? 'end' : current === 0 ? 'start' : 'step';
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
    stage.replaceChildren(cloneDiagram(svgs[current], `step-${sequenceId}`));
    frameTitle.textContent = stageName();
    frameNotes.replaceChildren(...[...frames[current].querySelector('[data-figure-notes]').childNodes].map(node => node.cloneNode(true)));
    [...timeline.children].forEach((item, index) => {
      item.classList.toggle('is-current', index === current);
      if (index === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    updateButtons();
    if (announce) status.textContent = announcement();
  }
  function tick() {
    if (!playing) return;
    if (!visible()) { pause(); return; }
    render(current + 1);
    if (current === frames.length - 1) {
      pause();
      status.textContent = say(`演示完成：第 ${frames.length}／${frames.length} 步`, `Demonstration complete: step ${frames.length} of ${frames.length}`);
      return;
    }
    timer = setTimeout(tick, hold);
  }
  function play() {
    if (reducedMotion.matches || staticView || !visible()) return;
    clearClock();
    if (current === frames.length - 1) render(0);
    playing = true;
    updateButtons();
    status.textContent = say(`播放中：第 ${current + 1}／${frames.length} 步`, `Playing: step ${current + 1} of ${frames.length}`);
    timer = setTimeout(tick, hold);
  }
  function move(next) { pause(); render(next, true); }
  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-nvm-step-action]')?.dataset.nvmStepAction;
    if (action === 'play') playing ? pause(true) : play();
    if (action === 'prev') move(current - 1);
    if (action === 'next') move(current + 1);
    if (action === 'reset') move(0);
  });
  root.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,a[href]')) return;
    const destinations = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: frames.length - 1, r: 0, R: 0};
    if (event.key in destinations) {
      event.preventDefault();
      move(destinations[event.key]);
    } else if (event.code === 'Space' && !event.target.closest('button')) {
      event.preventDefault();
      playing ? pause(true) : play();
    }
  });
  const sync = () => {
    pause();
    heading.textContent = say('步進演示', 'Step Demonstration');
    stage.setAttribute('aria-label', say('操作狀態圖；方向鍵逐步檢視，空白鍵播放或暫停', 'Operation-state figure; use arrow keys to step and Space to play or pause'));
    controls.setAttribute('aria-label', say('操作圖步進控制', 'Operation Figure Step Controls'));
    buttons.prev.textContent = say('← 前一步', '← Previous');
    buttons.next.textContent = say('下一步 →', 'Next →');
    buttons.reset.textContent = say('↺ 重設', '↺ Reset');
    const unavailable = reducedMotion.matches || staticView;
    root.dataset.stepMode = unavailable ? 'static' : 'step';
    layout.hidden = unavailable;
    timeline.hidden = unavailable;
    controls.hidden = unavailable;
    if (unavailable) {
      root.dataset.frame = 'static';
      root.dataset.stepCurrent = String(frames.length);
      count.textContent = say(`${frames.length} 張完整比較圖`, `${frames.length} complete frames`);
      status.textContent = reducedMotion.matches ? say('已啟用減少動態效果；完整比較圖保留於下方。', 'Reduced motion is enabled; complete comparison frames remain below.') : say('靜態檢視；完整比較圖保留於下方。', 'Static view; complete comparison frames remain below.');
      guidance.textContent = '';
    } else {
      render(current);
      guidance.textContent = say('←／→ 切換步次 · Home／End 到首末步 · 空白鍵播放／暫停。每步對應原圖；演示節奏不代表實際操作時間。', '←/→ step · Home/End first/last · Space play/pause. Each step uses an original frame; playback pace does not represent physical operation time.');
      status.textContent = '';
    }
  };
  sync();
  variant.querySelector(':scope > header').after(root);
  root.classList.add('is-ready');
  demos.set(variant, {pause, sync, playing: () => playing});
  // 只在可視交集改變時更新；捲回畫面不自動恢復播放。
  const viewportObserver = new IntersectionObserver(entries => {
    inViewport = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
    if (!inViewport && playing) pause();
  });
  viewportObserver.observe(root);
}

export function enhanceEngineeringViews() {
  const scan = () => {
    for (const [variant, demo] of demos) if (!variant.checkVisibility()) demo.pause();
    const panels = document.querySelectorAll('[data-nvm-panel]:not([hidden])');
    for (const panel of panels) panel.querySelectorAll('.nvm-op-variant').forEach(enhanceVariant);
  };
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; scan(); });
  };
  new MutationObserver(records => {
    if (records.some(record => record.type === 'attributes'
      ? record.target.matches('[data-nvm-panel],[data-operation-detail],details')
      : !record.target.closest('[data-nvm-step-root]') && [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('svg,[data-nvm-panel]') || node.querySelector('.nvm-op-variant'))))) schedule();
  }).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'open']});
  const pauseAll = () => { for (const demo of demos.values()) if (demo.playing()) demo.pause(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pauseAll(); });
  window.addEventListener('blur', pauseAll);
  window.addEventListener('pagehide', pauseAll);
  window.addEventListener('beforeprint', pauseAll);
  document.addEventListener('click', event => { if (event.target.closest('[data-engineering-zoom],[data-zoom-diagram]')) pauseAll(); }, true);
  reducedMotion.addEventListener('change', () => { for (const demo of demos.values()) demo.sync(); });
  window.addEventListener('hub:language-change', () => { for (const demo of demos.values()) demo.sync(); });
  window.addEventListener('hashchange', schedule);
  schedule();
}
