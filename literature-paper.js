(function () {
  'use strict';
  var PAPER = '#fafaf7';
  var CARD = '#ffffff';
  var INK = '#173b49';
  function lum(rgb) {
    var m = String(rgb || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return 255;
    return 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3];
  }
  function hexLum(v) {
    if (!v || v === 'none' || v === 'transparent' || v === 'currentColor') return 255;
    var n = String(v).trim();
    if (n.charAt(0) !== '#') return 255;
    n = n.slice(1);
    if (n.length === 3) n = n.charAt(0)+n.charAt(0)+n.charAt(1)+n.charAt(1)+n.charAt(2)+n.charAt(2);
    if (n.length < 6) return 255;
    var r = parseInt(n.slice(0,2), 16), g = parseInt(n.slice(2,4), 16), b = parseInt(n.slice(4,6), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function lift() {
    var root = document.body;
    if (!root || !root.classList.contains('hub-literature-paper')) return;
    root.querySelectorAll('*').forEach(function (el) {
      if (el.closest('.site-header')) return;
      var tag = el.tagName;
      if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'SOURCE') return;
      if (tag === 'PATH' || tag === 'RECT' || tag === 'CIRCLE' || tag === 'POLYGON' || tag === 'LINE' || tag === 'POLYLINE' || tag === 'ELLIPSE' || tag === 'G' || tag === 'TEXT' || tag === 'TSPAN') return;
      var s = getComputedStyle(el);
      if (lum(s.backgroundColor) < 120) {
        var useCard = /card|panel|note|toolbar|search|input|button|tab|dock|grid|article/i.test(el.className || '');
        el.style.setProperty('background-color', useCard ? CARD : PAPER, 'important');
        el.style.setProperty('background-image', 'none', 'important');
      }
      if (lum(s.color) > 186) {
        el.style.setProperty('color', INK, 'important');
      }
    });
    root.querySelectorAll('svg [fill], svg [stroke]').forEach(function (el) {
      if (el.closest('.site-header')) return;
      ['fill', 'stroke'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (hexLum(v) < 120) {
          el.setAttribute(attr, attr === 'fill' ? '#eaf1ed' : '#173b49');
        }
      });
    });
  }
  function run() { lift(); setTimeout(lift, 200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
})();
