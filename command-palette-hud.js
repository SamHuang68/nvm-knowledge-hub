/**
 * command-palette-hud.js — NVM Knowledge Hub Silicon HUD Command Palette
 * 升級搜尋覆蓋層為半導體晶片指揮中心，支援 Mac (⌘K) / Win (Ctrl+K) 自適應與分類篩選
 */

(() => {
  'use strict';

  function initCommandPaletteHUD() {
    const isMac = typeof navigator !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
    const shortcutText = isMac ? '⌘K' : 'Ctrl+K';

    // 1. 自動適配搜尋觸發器按鈕中的 kbd 提示
    const kbdTags = document.querySelectorAll('.search-trigger kbd');
    kbdTags.forEach(kbd => {
      kbd.textContent = shortcutText;
    });

    // 2. 全域快捷鍵監聽 (Cmd+K / Ctrl+K)
    window.addEventListener('keydown', (e) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const trigger = document.getElementById('searchTrigger');
        if (trigger) {
          trigger.click();
        }
      }
    });

    // 3. 搜尋視窗注入 HUD 分類篩選藥丸 (HUD Filter Pills)
    const searchModal = document.querySelector('.search-modal');
    const inputRow = document.querySelector('.search-input-row');
    const searchInput = document.getElementById('nvmHubSearchInput');

    if (searchModal && inputRow && searchInput && !document.getElementById('searchHudPills')) {
      const pillsContainer = document.createElement('div');
      pillsContainer.className = 'search-hud-pills';
      pillsContainer.id = 'searchHudPills';
      pillsContainer.setAttribute('role', 'group');
      pillsContainer.setAttribute('aria-label', 'Search categories');

      const CATEGORIES = [
        { id: 'all', zh: '全部', en: 'All', query: '' },
        { id: 'physics', zh: '物理模型', en: 'Physics', query: 'physics' },
        { id: 'foundry', zh: '晶圓廠路線', en: 'Foundry', query: 'foundry' },
        { id: 'tools', zh: '工程工具', en: 'Tools', query: 'calculator' },
        { id: 'security', zh: '安全與 PUF', en: 'Security', query: 'security' },
        { id: 'sram', zh: 'SRAM 修復', en: 'SRAM', query: 'sram' }
      ];

      CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `search-hud-pill ${cat.id === 'all' ? 'active' : ''}`;
        btn.dataset.category = cat.id;
        btn.innerHTML = `<span data-lang="zh">${cat.zh}</span><span data-lang="en">${cat.en}</span>`;

        btn.addEventListener('click', () => {
          pillsContainer.querySelectorAll('.search-hud-pill').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          if (cat.query) {
            searchInput.value = cat.query;
          } else {
            searchInput.value = '';
          }
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.focus();
        });

        pillsContainer.appendChild(btn);
      });

      // 插入於 inputRow 之後
      inputRow.parentNode.insertBefore(pillsContainer, inputRow.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPaletteHUD);
  } else {
    initCommandPaletteHUD();
  }
})();
