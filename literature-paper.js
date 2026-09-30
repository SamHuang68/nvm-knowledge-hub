(function () {
  'use strict';
  var PAPER = '#f8fafc';
  var CARD = '#fcfcfd';
  var INK = '#0f172a';
  var MUTED = '#475569';
  var SKIP_BTN = 'a.primary, button.primary, .button.primary, .knowledge-primary, .filter-btn.active, [aria-pressed="true"], .view-tab[aria-selected="true"], .ladder button.active, .role-tabs button.active, .skip-link, .lens-vertical-rail';
  var SKIP_STRICT = '.skip-link, .lens-vertical-rail';
  function parseRgba(str) {
    var m = String(str || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : parseFloat(m[4]) };
  }
  function blend(fg, bg) {
    var a = fg.a + bg.a * (1 - fg.a);
    if (a === 0) return { r: 248, g: 250, b: 252, a: 1 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a: a
    };
  }
  function effBg(el) {
    var chain = [];
    var cur = el;
    while (cur && cur.nodeType === 1) {
      var c = parseRgba(getComputedStyle(cur).backgroundColor);
      if (c && c.a > 0) chain.push(c);
      cur = cur.parentElement;
    }
    var acc = { r: 248, g: 250, b: 252, a: 1 };
    for (var i = chain.length - 1; i >= 0; i--) {
      acc = blend(chain[i], acc);
    }
    return acc;
  }
  function relLum(c) {
    function ch(v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }
  function wcagRatio(c1, c2) {
    var l1 = relLum(c1), l2 = relLum(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
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
      if (el.matches && (el.matches(SKIP_STRICT) || el.closest(SKIP_STRICT))) return;
      if (el.matches && (el.matches(SKIP_BTN) || el.closest(SKIP_BTN))) {
        var btnStyle = getComputedStyle(el);
        var bgC = effBg(el);
        var fgRaw = parseRgba(btnStyle.color);
        if (fgRaw) {
          var fgC = blend(fgRaw, bgC);
          if (wcagRatio(fgC, bgC) < 4.5) {
            var bgL = 0.2126 * bgC.r + 0.7152 * bgC.g + 0.0722 * bgC.b;
            el.style.setProperty('color', bgL < 125 ? '#ffffff' : INK, 'important');
          }
        }
        return;
      }
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
      var rawFg = parseRgba(s.color);
      if (rawFg) {
        var curBg = effBg(el);
        var effFg = blend(rawFg, curBg);
        if (wcagRatio(effFg, curBg) < 4.55) {
          var cLum = lum(s.color);
          if (cLum > 165) {
            el.style.setProperty('color', INK, 'important');
          } else if (effFg.r > effFg.g * 1.45 && effFg.r > effFg.b * 1.45) {
            el.style.setProperty('color', '#b91c1c', 'important');
          } else if (effFg.r > effFg.g && effFg.g > effFg.b && (effFg.r - effFg.b) > 32) {
            el.style.setProperty('color', '#6e491d', 'important');
          } else if (effFg.b > effFg.r * 1.25 && effFg.g > effFg.r * 1.25) {
            el.style.setProperty('color', '#006366', 'important');
          } else {
            el.style.setProperty('color', MUTED, 'important');
          }
        }
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
