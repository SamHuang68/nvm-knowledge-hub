import crypto from 'node:crypto';

// 僅分離向量內容；文字、章節、操作按鈕及所有既有導覽保留在原頁。
export function splitAtlasDiagrams(html, language) {
  const panels = [...html.matchAll(/<(?:article|section)\b[^>]*\bdata-nvm-panel\b[^>]*>/g)].map(match => ({
    offset: match.index, id: match[0].match(/\bid="([^"]+)"/)?.[1]
  })).filter(panel => panel.id);
  const output = html.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg, offset) => {
    const panel = panels.findLast(item => item.offset < offset);
    if (!panel) return svg;
    const key = crypto.createHash('sha256').update(svg).digest('hex');
    // JS 啟用時 noscript 保留文字而不建立 SVG DOM；停用時直接顯示原圖。
    // 完整向量留在同一 HTML，列印可同步展開，不依賴非同步網路。
    return `<div class="nvm-lazy-diagram" data-nvm-diagram="${key}"><noscript>${svg}</noscript></div>`;
  });
  return {html: output, outputs: []};
}
