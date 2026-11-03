// 3D 試點：把 2.5D 爆炸圖的同一組方塊（data-iso-model）用 CSS 3D 建成可旋轉的立體圖，不引入 3D 函式庫。
// 讀者按下才建立；拖曳或方向鍵旋轉、Home 回到預設角度；沒有自動旋轉，減少動態效果時也只隨操作改變角度。
const UNIT = 14;
const DEFAULT = {tilt: -28, turn: 38};

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = shift => Math.round(((value >> shift) & 255) * (1 - amount));
  return '#' + [16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('');
}

function face(width, height, transform, color, opacity) {
  const node = document.createElement('div');
  node.className = 'nvm-iso-face';
  node.style.cssText = `width:${width}px;height:${height}px;transform:${transform};background:${color};opacity:${opacity}`;
  return node;
}

// 世界座標：x 向右、y 朝向讀者、z 向上；CSS 中 y 軸向下，所以 z 取負號。
function cuboid({x, y, z, w, d, h, color, o = 1}, number) {
  const [W, D, H] = [w * UNIT, d * UNIT, h * UNIT];
  const node = document.createElement('div');
  node.className = 'nvm-iso-cuboid';
  node.style.transform = `translate3d(${x * UNIT}px, ${-z * UNIT}px, ${y * UNIT}px)`;
  const front = face(W, H, `translate3d(0, ${-H}px, ${D}px)`, shade(color, 0.12), o);
  if (number) {
    const badge = document.createElement('span');
    badge.className = 'nvm-iso-badge';
    badge.textContent = number;
    front.append(badge);
  }
  node.append(
    face(W, D, `translate3d(0, ${-H}px, 0) rotateX(90deg)`, color, o),
    face(W, D, `translate3d(0, 0, ${D}px) rotateX(-90deg)`, shade(color, 0.3), o),
    front,
    face(W, H, `translate3d(${W}px, ${-H}px, 0) rotateY(180deg)`, shade(color, 0.12), o),
    face(D, H, `translate3d(${W}px, ${-H}px, ${D}px) rotateY(90deg)`, shade(color, 0.24), o),
    face(D, H, `translate3d(0, ${-H}px, 0) rotateY(-90deg)`, shade(color, 0.24), o)
  );
  return node;
}

function build(figure) {
  const model = JSON.parse(figure.dataset.isoModel);
  const stage = figure.querySelector('[data-iso-3d-stage]');
  const scene = document.createElement('div');
  scene.className = 'nvm-iso-scene';
  const max = key => Math.max(...model.boxes.map(item => item[key] + item[{x: 'w', y: 'd', z: 'h'}[key]]));
  const center = {x: max('x') / 2, y: max('y') / 2, z: max('z') / 2};
  const pivot = document.createElement('div');
  pivot.className = 'nvm-iso-pivot';
  pivot.style.transform = `translate3d(${-center.x * UNIT}px, ${center.z * UNIT}px, ${-center.y * UNIT}px)`;
  const labelled = new Set();
  for (const item of model.boxes) {
    const number = labelled.has(item.g) ? '' : String(item.g + 1);
    labelled.add(item.g);
    pivot.append(cuboid(item, number));
  }
  scene.append(pivot);
  stage.replaceChildren(scene);
  let angle = {...DEFAULT};
  const apply = () => { scene.style.transform = `rotateX(${angle.tilt}deg) rotateY(${angle.turn}deg)`; };
  apply();
  let drag = null;
  stage.addEventListener('pointerdown', event => { drag = {x: event.clientX, y: event.clientY, ...angle}; stage.setPointerCapture(event.pointerId); });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    angle = {turn: drag.turn + (event.clientX - drag.x) * 0.5, tilt: Math.max(-85, Math.min(10, drag.tilt - (event.clientY - drag.y) * 0.4))};
    apply();
  });
  const end = () => { drag = null; };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('keydown', event => {
    const steps = {ArrowLeft: [0, -10], ArrowRight: [0, 10], ArrowUp: [-8, 0], ArrowDown: [8, 0]};
    if (event.key === 'Home') angle = {...DEFAULT};
    else if (steps[event.key]) angle = {turn: angle.turn + steps[event.key][1], tilt: Math.max(-85, Math.min(10, angle.tilt + steps[event.key][0]))};
    else return;
    event.preventDefault();
    apply();
  });
  figure.querySelector('[data-iso-3d-reset]').addEventListener('click', () => { angle = {...DEFAULT}; apply(); stage.focus(); });
}

export function enhanceIsometric3D() {
  for (const figure of document.querySelectorAll('[data-iso-model]')) {
    const toggle = figure.querySelector('[data-iso-3d]');
    const view = figure.querySelector('.nvm-iso-3d');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-pressed') !== 'true';
      if (open && !view.dataset.built) { build(figure); view.dataset.built = 'true'; }
      view.hidden = !open;
      toggle.setAttribute('aria-pressed', String(open));
      if (open) figure.querySelector('[data-iso-3d-stage]').focus();
    });
  }
}
