(function () {
  'use strict';
  var PAPER = '#f8fafc';
  var CARD = '#fcfcfd';
  var INK = '#0f172a';
  var SKIP_BTN = 'a.primary, button.primary, .button.primary, .knowledge-primary, .filter-btn.active, [aria-pressed="true"], .view-tab[aria-selected="true"], .ladder button.active, .role-tabs button.active, .skip-link, .lens-vertical-rail';
  function lum(rgb) {
    var m = String(rgb || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return 255;
    if (m[4] !== undefined && parseFloat(m[4]) < 0.08) return 255;
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
    document.documentElement.style.setProperty('background-color', PAPER, 'important');
    root.style.setProperty('background-color', PAPER, 'important');
    root.style.setProperty('color', INK, 'important');
    root.querySelectorAll('*').forEach(function (el) {
      if (el.matches && (el.matches(SKIP_BTN) || el.closest(SKIP_BTN))) return;
      var tag = el.tagName;
      if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'SOURCE') return;
      if (tag === 'SVG' || tag === 'G' || tag === 'PATH' || tag === 'CIRCLE' || tag === 'POLYGON' || tag === 'LINE' || tag === 'POLYLINE' || tag === 'ELLIPSE') return;
      var s = getComputedStyle(el);
      if (tag === 'RECT') {
        if (lum(s.fill) < 120 || hexLum(el.getAttribute('fill')) < 120) {
          el.style.setProperty('fill', '#f1f5f9', 'important');
        }
        return;
      }
      if (tag === 'TEXT' || tag === 'TSPAN') {
        if (lum(s.fill) > 180 || hexLum(el.getAttribute('fill')) > 180) {
          el.style.setProperty('fill', INK, 'important');
        }
        return;
      }
      if (lum(s.backgroundColor) < 140) {
        var useCard = /header|topbar|card|panel|note|toolbar|search|input|button|tab|dock|grid|article|modal/i.test((el.className || '') + ' ' + tag);
        el.style.setProperty('background-color', useCard ? CARD : PAPER, 'important');
        el.style.setProperty('background-image', 'none', 'important');
      } else if (s.backgroundImage && s.backgroundImage !== 'none' && /#(0[0-9a-f]{5}|1[0-6][0-9a-f]{4})|rgb\(\s*(?:[0-9]|1[0-9]|2[0-5])\s*,/i.test(s.backgroundImage)) {
        el.style.setProperty('background-image', 'none', 'important');
      }
      if (lum(s.color) > 165) {
        el.style.setProperty('color', INK, 'important');
      }
    });
    root.querySelectorAll('svg [fill], svg [stroke], svg stop[stop-color]').forEach(function (el) {
      ['fill', 'stroke', 'stop-color'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (hexLum(v) < 120) {
          el.setAttribute(attr, attr === 'stroke' ? INK : '#e2e8f0');
        }
      });
    });
  }
  function run() { lift(); setTimeout(lift, 150); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  document.addEventListener('click', function () { setTimeout(lift, 30); }, true);
})();
