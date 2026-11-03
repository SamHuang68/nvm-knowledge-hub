// 原始比較圖是完整教材；演示只投影同一組 SVG，不推算物理中間態或時間。
// 示意動態只作用在演示框內已畫出的元素，見下方 MOTION 說明。
const isEnglish = () => (window.HubLanguage?.get() || document.documentElement.lang) === 'en';
const say = (zh, en) => isEnglish() ? en : zh;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const staticView = new URLSearchParams(location.search).get('motion') === 'static';
const demos = new Map();
const hold = 1200;

// 示意動態層：只動產生器以 data-motion 標記、且已畫在原圖中的元素，只改 transform 與 opacity。
// along＝載子沿同一張圖已畫出的路徑（data-motion-track）移動；pulse＝電場或電流脈動；appear＝本格新出現的狀態淡入。
// 原始比較圖、減少動態效果、motion=static 與列印都不套用；動畫結束後回到原圖的樣子。
const MOTION = {along: {duration: 1600, iterations: 2}, pulse: {duration: 1400, iterations: 2}, appear: {duration: 700, iterations: 1}};
const TRAVEL = 48;

function alongKeyframes(node, track) {
  const length = track.getTotalLength();
  const box = node.getBBox();
  const center = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  // 以載子在路徑上的投影為停駐點，前後各走半段，結束時回到原圖位置。
  let anchor = 0;
  let best = Infinity;
  for (let i = 0; i <= 40; i++) {
    const point = track.getPointAtLength(length * i / 40);
    const distance = Math.hypot(point.x - center.x, point.y - center.y);
    if (distance < best) { best = distance; anchor = length * i / 40; }
  }
  const origin = track.getPointAtLength(anchor);
  const start = Math.max(0, anchor - TRAVEL / 2);
  const end = Math.min(length, anchor + TRAVEL / 2);
  return Array.from({length: 9}, (_, i) => {
    const point = track.getPointAtLength(start + (end - start) * i / 8);
    return {offset: i / 8, transform: `translate(${(point.x - origin.x).toFixed(2)}px, ${(point.y - origin.y).toFixed(2)}px)`, opacity: i === 0 || i === 8 ? 0 : 1};
  });
}

function startMotion(svg) {
  const animations = [];
  for (const node of svg.querySelectorAll('[data-motion]')) {
    const kind = node.dataset.motion;
    const timing = MOTION[kind];
    if (!timing) continue;
    let keyframes = null;
    if (kind === 'along') {
      const track = svg.querySelector(`[data-motion-track="${node.dataset.motionAlong}"]`);
      if (track) keyframes = alongKeyframes(node, track);
    }
    if (kind === 'pulse') keyframes = [{opacity: 1}, {opacity: 0.35}, {opacity: 1}];
    if (kind === 'appear') keyframes = [{opacity: 0}, {opacity: 1}];
    if (keyframes) animations.push(node.animate(keyframes, {...timing, easing: kind === 'along' ? 'linear' : 'ease-in-out'}));
  }
  return animations;
}

const motionLength = animations => Math.max(0, ...animations.map(animation => {
  const timing = animation.effect.getTiming();
  return timing.duration * timing.iterations;
}));

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
  // 字幕沿用影片字幕的來源：步驟標題加圖說第一項狀態，隨頁面語言切換。
  const view = element('div', 'nvm-step-view');
  const caption = element('p', 'nvm-step-caption');
  view.append(stage, caption);
  layout.append(view, notes);
  const timeline = element('ol', 'nvm-step-timeline');
  frames.forEach((frame, index) => {
    const item = element('li');
    const jump = element('button', 'nvm-step-jump');
    jump.type = 'button';
    jump.dataset.nvmStepJump = String(index);
    jump.setAttribute('aria-controls', stage.id);
    jump.append(element('span', 'nvm-step-ordinal', String(index + 1).padStart(2, '0')), element('span', 'nvm-step-label', frame.querySelector('h6').textContent));
    item.append(jump);
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
  // 第二列：拖曳時間軸、播放速度與字幕。速度同時套用換步間隔與示意動態。
  const options = element('div', 'nvm-step-options');
  const scrubLabel = element('label', 'nvm-step-option');
  const scrubText = element('span');
  const scrub = element('input', 'nvm-step-scrub');
  Object.assign(scrub, {type: 'range', min: '1', max: String(frames.length), step: '1', value: '1'});
  scrub.setAttribute('aria-controls', stage.id);
  scrubLabel.append(scrubText, scrub);
  const speedLabel = element('label', 'nvm-step-option');
  const speedText = element('span');
  const speed = element('select', 'nvm-step-speed');
  for (const value of ['0.5', '1', '2']) speed.append(new Option(`${value}×`, value, false, value === '1'));
  speedLabel.append(speedText, speed);
  const captionToggle = element('button', 'nvm-step-caption-toggle');
  captionToggle.type = 'button';
  captionToggle.setAttribute('aria-pressed', 'false');
  options.append(scrubLabel, speedLabel, captionToggle);
  const guidance = element('p', 'nvm-step-guidance');
  const status = element('p', 'nvm-step-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const motionNote = element('p', 'nvm-step-motion-note');
  const motionSources = [...new Set(svgs.flatMap(svg => [...svg.querySelectorAll('[data-motion]')].map(node => node.dataset.motionSource)))];
  root.dataset.motion = motionSources.length ? 'illustrative' : 'none';
  root.append(header, layout, timeline, controls, options, guidance, motionNote, status);
  let current = 0;
  let timer = null;
  let playing = false;
  let inViewport = true;
  let motions = [];
  let rate = 1;
  let captions = false;
  const visible = () => inViewport && variant.checkVisibility() && document.visibilityState !== 'hidden';
  const clearClock = () => { clearTimeout(timer); timer = null; };
  const stopMotion = () => { motions.forEach(animation => animation.cancel()); motions = []; };
  const frameHold = () => Math.max(hold, motionLength(motions) + 300) / rate;
  const stageName = () => frames[current].querySelector('h6').textContent;
  const stageState = () => frames[current].querySelector('[data-figure-notes] dd')?.textContent.trim() || '';
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
    stopMotion();
    playing = false;
    updateButtons();
    if (announce) status.textContent = say(`已暫停於第 ${current + 1}／${frames.length} 步`, `Paused at step ${current + 1} of ${frames.length}`);
  }
  function render(next, announce = false, animate = false) {
    current = Math.max(0, Math.min(frames.length - 1, next));
    root.dataset.stepCurrent = String(current + 1);
    root.dataset.frame = current === frames.length - 1 ? 'end' : current === 0 ? 'start' : 'step';
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
    stopMotion();
    const drawing = cloneDiagram(svgs[current], `step-${sequenceId}`);
    stage.replaceChildren(drawing);
    // 只在使用者切換步次或播放時啟動，載入頁面時不自行動。
    if (animate && !reducedMotion.matches && !staticView && visible()) {
      motions = startMotion(drawing);
      motions.forEach(animation => { animation.playbackRate = rate; });
    }
    frameTitle.textContent = stageName();
    frameNotes.replaceChildren(...[...frames[current].querySelector('[data-figure-notes]').childNodes].map(node => node.cloneNode(true)));
    caption.textContent = stageState() ? `${stageName()}${say('：', ': ')}${stageState()}` : stageName();
    caption.hidden = !captions;
    scrub.value = String(current + 1);
    scrub.setAttribute('aria-valuetext', announcement());
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
    render(current + 1, false, true);
    if (current === frames.length - 1) {
      // 最後一步的示意動態照常播完；停止的是自動換步。
      clearClock();
      playing = false;
      updateButtons();
      status.textContent = say(`演示完成：第 ${frames.length}／${frames.length} 步`, `Demonstration complete: step ${frames.length} of ${frames.length}`);
      return;
    }
    timer = setTimeout(tick, frameHold());
  }
  function play() {
    if (reducedMotion.matches || staticView || !visible()) return;
    clearClock();
    render(current === frames.length - 1 ? 0 : current, false, true);
    playing = true;
    updateButtons();
    status.textContent = say(`播放中：第 ${current + 1}／${frames.length} 步`, `Playing: step ${current + 1} of ${frames.length}`);
    timer = setTimeout(tick, frameHold());
  }
  function move(next) { pause(); render(next, true, true); }
  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-nvm-step-action]')?.dataset.nvmStepAction;
    if (action === 'play') playing ? pause(true) : play();
    if (action === 'prev') move(current - 1);
    if (action === 'next') move(current + 1);
    if (action === 'reset') move(0);
  });
  timeline.addEventListener('click', event => {
    const jump = event.target.closest('[data-nvm-step-jump]');
    if (jump) move(Number(jump.dataset.nvmStepJump));
  });
  // 拖曳中只換圖，放開時才播放該步的示意動態並朗讀。
  scrub.addEventListener('input', () => { pause(); render(Number(scrub.value) - 1); });
  scrub.addEventListener('change', () => render(Number(scrub.value) - 1, true, true));
  speed.addEventListener('change', () => {
    rate = Number(speed.value);
    motions.forEach(animation => animation.updatePlaybackRate(rate));
    if (playing) { clearClock(); timer = setTimeout(tick, frameHold()); }
  });
  captionToggle.addEventListener('click', () => {
    captions = !captions;
    captionToggle.setAttribute('aria-pressed', String(captions));
    caption.hidden = !captions;
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
    options.setAttribute('aria-label', say('時間軸、速度與字幕', 'Timeline, Speed and Captions'));
    scrubText.textContent = say('時間軸', 'Timeline');
    speedText.textContent = say('速度', 'Speed');
    captionToggle.textContent = say('字幕', 'Captions');
    const unavailable = reducedMotion.matches || staticView;
    root.dataset.stepMode = unavailable ? 'static' : 'step';
    layout.hidden = unavailable;
    timeline.hidden = unavailable;
    controls.hidden = unavailable;
    options.hidden = unavailable;
    motionNote.hidden = unavailable;
    // 圖中沒有畫出載子路徑或方向時不加動態，並直接說明，不另外推算。
    if (!motionSources.length) motionNote.textContent = say('示意動態：這組圖沒有畫出載子路徑或電場方向，所以不加動態。', 'Illustrative motion: this sequence draws no carrier path or field direction, so no motion is added.');
    else {
      // 依據直接連到這組圖既有的來源條目；找不到條目時顯示來源編號。
      const basis = motionSources.flatMap((id, index) => {
        const link = variant.querySelector(`.nvm-op-sources a[href="#source-${CSS.escape(id)}"]`);
        return [...(index ? [say('、', ', ')] : []), link ? link.cloneNode(true) : id];
      });
      motionNote.replaceChildren(say('示意動態：只讓圖中已畫出的載子、電場與狀態變化動起來；速度、時間與路徑比例不代表實際物理。依據：', 'Illustrative motion: only carriers, fields and state changes already drawn in the figure move; speed, timing and path proportions are not physical. Basis: '), ...basis);
    }
    if (unavailable) {
      root.dataset.frame = 'static';
      root.dataset.stepCurrent = String(frames.length);
      count.textContent = say(`${frames.length} 張完整比較圖`, `${frames.length} complete frames`);
      status.textContent = reducedMotion.matches ? say('已啟用減少動態效果；完整比較圖保留於下方。', 'Reduced motion is enabled; complete comparison frames remain below.') : say('靜態檢視；完整比較圖保留於下方。', 'Static view; complete comparison frames remain below.');
      guidance.textContent = '';
    } else {
      render(current);
      guidance.textContent = say('←／→ 切換步次 · Home／End 到首末步 · 空白鍵播放／暫停 · 可點選或拖曳時間軸。每步對應原圖；演示節奏與速度不代表實際操作時間。', '←/→ step · Home/End first/last · Space play/pause · click or drag the timeline. Each step uses an original frame; playback pace and speed do not represent physical operation time.');
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
    if (!inViewport) pause();
  });
  viewportObserver.observe(root);
}

// 操作影片：所在章節或操作被隱藏時暫停；列印前全部暫停。影片由讀者自己按下播放，其他情況不干預。
const pauseVideos = (all = false) => document.querySelectorAll('.nvm-op-video video').forEach(video => {
  if (!video.paused && (all || !video.checkVisibility())) video.pause();
});

export function enhanceEngineeringViews() {
  const scan = () => {
    for (const [variant, demo] of demos) if (!variant.checkVisibility()) demo.pause();
    pauseVideos();
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
  // 暫停同時停止示意動態；不在播放中的演示也可能還有動態在跑。
  const pauseAll = () => { for (const demo of demos.values()) demo.pause(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pauseAll(); });
  window.addEventListener('blur', pauseAll);
  window.addEventListener('pagehide', pauseAll);
  window.addEventListener('beforeprint', pauseAll);
  window.addEventListener('beforeprint', () => pauseVideos(true));
  document.addEventListener('click', event => { if (event.target.closest('[data-engineering-zoom],[data-zoom-diagram]')) pauseAll(); }, true);
  reducedMotion.addEventListener('change', () => { for (const demo of demos.values()) demo.sync(); });
  window.addEventListener('hub:language-change', () => { for (const demo of demos.values()) demo.sync(); });
  window.addEventListener('hashchange', schedule);
  schedule();
}
