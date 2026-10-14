// 僅同步本次核對的章節與來源列；其他文字索引內容保持原樣。
export const headings = [
 '### NeoBit: Floating-Gate OTP Cell',
 '### NeoFuse: Gate-Dielectric Antifuse OTP Cell',
 '## Antifuse: Permanent Conduction Through Dielectric Breakdown',
 '## Toggle MRAM: Magnetic-Field Sequencing',
 '### toggle · Toggle MRAM · Write / SET',
 '### toggle · Toggle MRAM · Reverse Rewrite / RESET',
 '### toggle · Toggle MRAM · Read',
 '### US6545906B1 · Rotate coupled moments with overlapping field pulses'
];
const ids = /US(?:6678190B2|6914825B2|6920067B2|20250024668A1|6545906B1)/;
export function section(text, heading) {
 const lines=text.split('\n'), start=lines.indexOf(heading);
 if(start<0 || lines.lastIndexOf(heading)!==start) throw new Error('章節缺漏或重複：'+heading);
 const level=heading.match(/^#+/)[0].length;
 let end=start+1;
 while(end<lines.length && !(lines[end].match(/^#+ /)?.[0].length<=level+1)) end++;
 return lines.slice(start,end).join('\n')+(end<lines.length?'\n':'');
}
export function syncPatentReferenceCorpus(corpus, markdown) {
 let result=corpus.replaceAll("\r\n","\n");
 markdown=markdown.replaceAll("\r\n","\n");
 for(const heading of headings) result=result.replace(section(result,heading),section(markdown,heading));
 // 同一來源在普通連結及來源紀錄中的格式不同，按來源 ID 與列型態對應。
 const glossary=markdown.split('\n').find(line=>line.startsWith('- CHI and CHEI:'));
 if(!glossary)throw new Error('缺少載子注入詞彙來源');
 result=result.split('\n').map(line=>line.startsWith('- CHI and CHEI:')?glossary:line).join('\n');
 const sources=new Map();
 const key=line=>{const m=line.match(/^- \[([^:]+):/);return m?m[1]+'|'+line.includes('Location in the Source:'):null;};
 for(const line of markdown.split('\n'))if(ids.test(line)&&key(line))sources.set(key(line),line);
 return result.split('\n').map(line=>ids.test(line)&&key(line)&&sources.has(key(line))?sources.get(key(line)):line).join('\n');
}
