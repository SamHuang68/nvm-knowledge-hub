// 共用樣式表與 body 類別的靜態版本：site-language.js 原本在 <head> 執行時與 DOMContentLoaded 後才插入樣式表、加上 body 類別，
// 第一次繪製時版面還不是最終樣子，之後才跳成最終版面。腳本插入的樣式表只有在 <body> 出現前插入才會擋住繪製，
// 但那時位置會排在頁面 CSS 之前、疊加順序不同；所以改由這裡把同一組樣式表與類別寫進 HTML，最終順序與原本一致。
// 頁面帶 html[data-hub-static-styles] 時，site-language.js 不再插入或搬移這些樣式表（沒帶標記的舊頁面仍走原路）。
// 規則照抄 site-language.js 的判斷（含 secure-storage\.html 也比對到 oip-secure-storage.html 的現況），由 verify-shared-styles.mjs 比對兩條路的結果一致。

const APPS = /secure-storage\.html|security-assurance\.html|ai-nvm-opportunities\.html|iot-mcu-envm\.html|automotive-nvm\.html|specialty-nvm\.html|oip-secure-storage\.html|sram-repair\.html/i;
const STORY = /technology-comparison\.html|secure-storage\.html|memory-physics\.html|automotive-nvm\.html|iot-mcu-envm\.html|security-assurance\.html|specialty-nvm\.html|ai-nvm-opportunities\.html/i;
const NOT_LITERATURE = /^(?:index\.html|nvm-technology-atlas(?:-zh)?\.html|sram-repair\.html)$/i;
// 白皮書工作室入口立即轉址到 whitepaper/，不加靜態樣式。
export const SHARED_STYLE_EXCLUDED = new Set(['tools/whitepaper-studio/index.html']);
export const MANAGED_BODY_CLASSES = ['hub-apps-page', 'hub-literature-paper'];
const HEAD_START = '<!-- hub-shared-styles:head:start -->', HEAD_END = '<!-- hub-shared-styles:head:end -->';
const TAIL_START = '<!-- hub-shared-styles:tail:start -->', TAIL_END = '<!-- hub-shared-styles:tail:end -->';

// page 為 repo 內路徑（例如 briefing/index.html）；site-language.js 以網址路徑判斷，檔名相同時結果一致。
export function sharedStylesFor(page) {
  const route = '/' + page, file = page.split('/').pop();
  const apps = APPS.test(route), story = STORY.test(route), literature = !NOT_LITERATURE.test(file);
  // head：site-language.js 執行時插入、之後沒有搬動的樣式表，位置緊接在它的 <script> 之後。
  const head = [
    'surface-radius.css?v=20260929-v5',
    /memory-physics\.html/i.test(route) && 'memory-physics-contrast.css?v=20260929-v5',
    /ai-nvm-opportunities\.html/i.test(route) && 'ai-nvm-node.css?v=20260929-v5',
    /ai-nvm-opportunities\.html/i.test(route) && 'ai-nvm-tune.css?v=20260929-v5',
  ].filter(Boolean);
  // tail：DOMContentLoaded 後插到 <head> 最後的樣式表，以及最後被搬到最末的閱讀、應用頁外框與章節導覽。
  const tail = [
    'global-search.css?v=20260929-v5',
    story && 'hub-story-maps.css?v=20260929-v5',
    literature && 'literature-editorial.css?v=20261102-p2',
    /automotive-nvm\.html/i.test(route) && 'hub-auto-tune.css?v=20260929-v5',
    'global-reading-system.css?v=20260929-v5',
    apps && 'hub-apps-chrome.css?v=20260929-v5',
    'chapter-lens.css?v=20260929-v5',
  ].filter(Boolean);
  const bodyClasses = [apps && 'hub-apps-page', literature && 'hub-literature-paper'].filter(Boolean);
  return {head, tail, bodyClasses};
}

const link = (prefix, href) => `<link rel="stylesheet" href="${prefix}${href}" data-hub-shared-style="${href.split('?')[0]}">`;
const strip = (html, start, end) => html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'g'), '');

// 把共用樣式寫進整頁 HTML；可重複套用（先移除舊區塊、標記與受管類別再寫入），不改動其他位元組。
export function applySharedStyles(html, page) {
  const script = html.match(/<script src="((?:\.\.\/)*)site-language\.js\?v=[^"]*"><\/script>/);
  if (!script) throw new Error(`${page} 沒有載入 site-language.js`);
  const prefix = script[1];
  const {head, tail, bodyClasses} = sharedStylesFor(page);
  let out = strip(strip(html, HEAD_START, HEAD_END), TAIL_START, TAIL_END);
  out = out.replace(/<html data-hub-static-styles\b/, '<html').replace(/<html\b/, '<html data-hub-static-styles');
  out = out.replace(script[0], `${script[0]}${HEAD_START}${head.map(href => link(prefix, href)).join('')}${HEAD_END}`);
  if (out.split('</head>').length !== 2) throw new Error(`${page} 的 </head> 不是剛好一個`);
  out = out.replace('</head>', `${TAIL_START}${tail.map(href => link(prefix, href)).join('')}${TAIL_END}</head>`);
  // body 類別：在原 class 屬性內移除受管類別後依規則加回，保留其他類別與屬性位置；原本沒有 class 時加在 <body 之後。
  out = out.replace(/<body\b([^>]*)>/, (tag, attributes) => {
    const match = attributes.match(/(\sclass=")([^"]*)(")/);
    const kept = (match ? match[2].split(' ') : []).filter(name => !MANAGED_BODY_CLASSES.includes(name));
    while (kept.length && kept.at(-1) === '') kept.pop();
    const value = [...kept, ...bodyClasses].join(' ');
    if (match) return `<body${attributes.replace(match[0], value ? `${match[1]}${value}${match[3]}` : '')}>`;
    return value ? `<body class="${value}"${attributes}>` : tag;
  });
  return out;
}
