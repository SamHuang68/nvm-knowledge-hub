// 瀏覽器快照與判定共用於公開頁面及門禁反例；不以靜態刪除語系節點代替實際呈現。
export function captureLanguageSurface() {
  const visible = element => Boolean(element?.getClientRects().length)
    && element.checkVisibility({ checkVisibilityCSS:true, checkOpacity:true });
  const isLanguageChoice = element => Boolean(element.closest('.language-toggle,#languageToggle,[data-lang-option]'));
  const selector = element => element.id ? '#'+element.id : element.tagName.toLowerCase()
    +(typeof element.className === 'string' && element.className.trim() ? '.'+element.className.trim().split(/\s+/).slice(0,2).join('.') : '');
  const text = [], attributes = [], controls = [], wrongLanguage = [];
  const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const element = node.parentElement;
    if (!element || element.closest('script,style,noscript') || !visible(element) || isLanguageChoice(element)) continue;
    const value = node.textContent.trim();
    if (value) text.push({text:value,selector:selector(element)});
  }
  for (const element of document.querySelectorAll('[aria-label],[title],input[placeholder],textarea[placeholder],img[alt]')) {
    if (!visible(element) || isLanguageChoice(element)) continue;
    for (const name of ['aria-label','title','placeholder','alt']) {
      const value = element.getAttribute(name)?.trim();
      if (value) attributes.push({text:value,attribute:name,selector:selector(element)});
    }
  }
  for (const element of document.querySelectorAll('button,[role="button"],summary,input[type="submit"],input[type="button"]')) {
    if (!visible(element) || isLanguageChoice(element)) continue;
    const value = (element.getAttribute('aria-label') || element.innerText || element.value || '').trim();
    if (value) controls.push({text:value,selector:selector(element)});
  }
  const language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  for (const element of document.querySelectorAll('[data-lang]')) {
    if (element.dataset.lang !== language && ['en','zh'].includes(element.dataset.lang)
      && visible(element) && element.innerText?.trim() && !isLanguageChoice(element)) {
      wrongLanguage.push({text:element.innerText.trim(),selector:selector(element),declared:element.dataset.lang});
    }
  }
  return {url:location.href,language,htmlLanguage:document.documentElement.lang,title:document.title,text,attributes,controls,wrongLanguage};
}

const cjk = /[\u3400-\u9fff\uf900-\ufaff]/u;
// 精確的技術／產品控制名稱，不豁免整個元件、頁面或任意大寫英文。
const technicalControls = new Set([
  'OTP','MTP','NVM','SRAM','SRAM PUF','MRAM','RRAM','ReRAM','eMRAM','eRRAM','ePCM','eFlash',
  'Flash','EEPROM','NOR Flash','NAND Flash','BIST','BIRA','De-Mura','LUT','PUF','Secure Storage',
  'Secure OTP','STT-MRAM','SOT-MRAM','FeRAM','FeFET','PCM','FRAM','CIM','IMC','STT','SOT',
  'OTP/MTP','Flash/eNVM',
]);
export function assessLanguageSurface(snapshot, expectedLanguage) {
  const failures = [];
  if (snapshot.language !== expectedLanguage) failures.push({kind:'語言狀態',actual:snapshot.htmlLanguage,expected:expectedLanguage});
  for (const item of snapshot.wrongLanguage) failures.push({kind:'錯誤語系節點可見',...item});
  if (expectedLanguage === 'en') {
    for (const item of snapshot.text) if (cjk.test(item.text)) failures.push({kind:'英文正文出現中文',...item});
    for (const item of snapshot.attributes) if (cjk.test(item.text)) failures.push({kind:'英文介面屬性出現中文',...item});
    if (cjk.test(snapshot.title)) failures.push({kind:'英文文件標題出現中文',text:snapshot.title});
  } else {
    for (const item of snapshot.controls) {
      const value = item.text.replace(/\s+/g,' ').trim();
      const technicalName = value.replace(/\s*\(\d+\)$/,'');
      if (/[A-Za-z]/.test(value) && !cjk.test(value) && !technicalControls.has(technicalName)) {
        failures.push({kind:'繁中操作控制缺少翻譯',...item});
      }
    }
  }
  return failures;
}
