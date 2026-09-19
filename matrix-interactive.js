/**
 * @fileoverview NVM Technology Trade-Off Matrix Interactive Controller.
 * Implements Single-Tier Header, Category Collapsing/Expanding, One-Page Fit-to-Screen
 * view modes, and Scenario View Presets without drag-and-drop complexity.
 *
 * Compliant with Google JavaScript Style Guide and WCAG 2.1 accessibility standards.
 * @author NVM Knowledge Hub Architecture Team
 */

(function () {
  'use strict';

  /**
   * Definition of the 5 Level 1 Technology Categories and their leaf technologies.
   * @const {!Array<!Object>}
   */
  const CATEGORIES = [
    {
      id: 'foundry',
      nameZh: '晶圓廠製程',
      nameEn: 'Foundry Process',
      techs: ['efuse', 'maskrom', 'eeprom']
    },
    {
      id: 'otp',
      nameZh: '一次性寫入 (OTP)',
      nameEn: 'Logic OTP',
      techs: ['fgotp', 'antifuse']
    },
    {
      id: 'mtp',
      nameZh: '多次抹寫 (MTP)',
      nameEn: 'Logic MTP',
      techs: ['ldmtp', 'hdmtp']
    },
    {
      id: 'eflash',
      nameZh: '嵌入式 Flash',
      nameEn: 'Embedded Flash',
      techs: ['sst', 'sonos']
    },
    {
      id: 'emerging',
      nameZh: '新興記憶體',
      nameEn: 'Emerging NVM',
      techs: ['reram', 'mram']
    }
  ];

  /**
   * All 11 canonical technology IDs in column order.
   * @const {!Array<string>}
   */
  const ALL_TECHS = [
    'efuse', 'maskrom', 'eeprom', 'fgotp', 'antifuse',
    'ldmtp', 'hdmtp', 'sst', 'sonos', 'reram', 'mram'
  ];

  /**
   * Preset view definitions specifically optimized for single-page viewability.
   * @const {!Object<string, !Array<string>>}
   */
  const PRESET_VIEWS = {
    all: ALL_TECHS,
    zeromask: ['efuse', 'maskrom', 'fgotp', 'antifuse', 'ldmtp', 'hdmtp'],
    logic: ['fgotp', 'antifuse', 'ldmtp', 'hdmtp'],
    highdensity: ['sst', 'sonos', 'reram', 'mram']
  };

  /**
   * Fast lookup map from technology ID to parent category ID.
   * @const {!Object<string, string>}
   */
  const TECH_TO_CAT = {};
  CATEGORIES.forEach(cat => {
    cat.techs.forEach(techId => {
      TECH_TO_CAT[techId] = cat.id;
    });
  });

  /**
   * Fast lookup map from category ID to category metadata.
   * @const {!Object<string, !Object>}
   */
  const CAT_MAP = {};
  CATEGORIES.forEach(cat => {
    CAT_MAP[cat.id] = cat;
  });

  /**
   * Controller class governing matrix view modes, category collapsing, and fit-screen.
   */
  class MatrixInteractiveController {
    constructor() {
      /** @private {?HTMLElement} */
      this.matrixEl_ = null;
      /** @private {?HTMLElement} */
      this.wrapperEl_ = null;
      /** @private {?HTMLElement} */
      this.toolbarEl_ = null;

      /** @private {!Set<string>} */
      this.activeTechs_ = new Set(ALL_TECHS);
      /** @private {string} */
      this.currentView_ = 'all';
      /** @private {boolean} */
      this.fitScreen_ = false;

      /** @private {?HTMLElement} */
      this.toastEl_ = null;
      /** @private {?number} */
      this.toastTimer_ = null;
    }

    /**
     * Initializes the controller if matrix elements are present.
     */
    init() {
      this.matrixEl_ = document.querySelector('.compare-matrix');
      this.wrapperEl_ = document.querySelector('.compare-matrix-wrapper');
      this.toolbarEl_ = document.getElementById('matrixInteractiveToolbar');

      if (!this.matrixEl_ || !this.wrapperEl_) {
        return;
      }

      this.bindToolbarEvents_();
      this.bindHeaderCategoryEvents_();
      this.updateView_();
      this.setupLanguageListener_();
    }

    /**
     * Binds events to the control toolbar buttons.
     * @private
     */
    bindToolbarEvents_() {
      if (!this.toolbarEl_) return;

      // Category toggle pills
      this.toolbarEl_.querySelectorAll('.cat-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          if (catId) {
            this.toggleCategory_(catId);
          }
        });
      });

      // View preset buttons
      this.toolbarEl_.querySelectorAll('.matrix-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const viewKey = btn.getAttribute('data-view');
          if (viewKey) {
            this.applyPresetView_(viewKey);
          }
        });
      });

      // Fit Screen toggle button
      const fitBtn = this.toolbarEl_.querySelector('#btnToggleFitScreen');
      if (fitBtn) {
        fitBtn.addEventListener('click', () => {
          this.toggleFitScreen_();
        });
      }
    }

    /**
     * Binds click events to category tags in table headers to collapse/expand category.
     * @private
     */
    bindHeaderCategoryEvents_() {
      this.matrixEl_.querySelectorAll('.matrix-cat-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          const header = tag.closest('.matrix-header[data-category]');
          if (header) {
            const catId = header.getAttribute('data-category');
            if (catId) {
              this.toggleCategory_(catId);
            }
          }
        });
      });
    }

    /**
     * Toggles a category between expanded (visible) and collapsed (hidden).
     * @param {string} catId
     * @private
     */
    toggleCategory_(catId) {
      const cat = CAT_MAP[catId];
      if (!cat) return;

      // Check if all techs of this category are currently active
      const allActive = cat.techs.every(tid => this.activeTechs_.has(tid));

      if (allActive) {
        // Collapsing this category. Ensure at least one tech remains visible.
        const remainingCount = Array.from(this.activeTechs_).filter(tid => !cat.techs.includes(tid)).length;
        if (remainingCount === 0) {
          this.showToast_(this.isZh_() ? '請至少保留一項技術進行對比' : 'Please keep at least one technology visible');
          return;
        }
        cat.techs.forEach(tid => this.activeTechs_.delete(tid));
        this.showToast_(this.isZh_() ? `已收合：${cat.nameZh}` : `Collapsed: ${cat.nameEn}`);
      } else {
        // Expanding this category
        cat.techs.forEach(tid => this.activeTechs_.add(tid));
        this.showToast_(this.isZh_() ? `已展開：${cat.nameZh}` : `Expanded: ${cat.nameEn}`);
      }

      // Check if matches any preset view
      this.syncPresetState_();
      this.updateView_();
    }

    /**
     * Applies a specific preset view.
     * @param {string} viewKey
     * @private
     */
    applyPresetView_(viewKey) {
      const techList = PRESET_VIEWS[viewKey];
      if (!techList) return;

      this.currentView_ = viewKey;
      this.activeTechs_ = new Set(techList);

      const isZh = this.isZh_();
      let msg = '';
      if (viewKey === 'all') {
        msg = isZh ? '已展開全景 11 項技術對比' : 'Expanded all 11 technologies';
      } else if (viewKey === 'zeromask') {
        msg = isZh ? '一頁精選：5 項 0-Mask 純邏輯相容方案（11 葉子集；TwinBit 與 I-fuse 見註解 05，不在這五欄）' : 'Fit View: 5 0-Mask logic-compatible technologies (11-leaf subset; TwinBit and I-fuse are in note 05, not these five columns)';
      } else if (viewKey === 'logic') {
        msg = isZh ? '一頁精選：4 項核心自主 OTP 與 MTP 方案' : 'Fit View: 4 core logic OTP & MTP technologies';
      } else if (viewKey === 'highdensity') {
        msg = isZh ? '一頁精選：4 項高密度 Flash 與新興 eNVM' : 'Fit View: 4 eFlash & emerging eNVM technologies';
      }

      this.updateView_();
      this.showToast_(msg);
    }

    /**
     * Toggles single-screen fit mode on or off.
     * @private
     */
    toggleFitScreen_() {
      this.fitScreen_ = !this.fitScreen_;
      if (this.wrapperEl_) {
        this.wrapperEl_.classList.toggle('matrix-fit-screen', this.fitScreen_);
      }
      const fitBtn = this.toolbarEl_ ? this.toolbarEl_.querySelector('#btnToggleFitScreen') : null;
      if (fitBtn) {
        fitBtn.classList.toggle('is-active', this.fitScreen_);
        fitBtn.setAttribute('aria-pressed', String(this.fitScreen_));
      }

      this.updateView_();
      const isZh = this.isZh_();
      this.showToast_(this.fitScreen_
        ? (isZh ? '已啟用「一頁可視」自適應模式' : 'Fit-to-Page mode activated')
        : (isZh ? '已還原標準舒適排版模式' : 'Standard view mode activated'));
    }

    /**
     * Synchronizes preset button active states based on current activeTechs.
     * @private
     */
    syncPresetState_() {
      let matchedKey = null;
      for (const [key, list] of Object.entries(PRESET_VIEWS)) {
        if (list.length === this.activeTechs_.size && list.every(t => this.activeTechs_.has(t))) {
          matchedKey = key;
          break;
        }
      }
      this.currentView_ = matchedKey || 'custom';
    }

    /**
     * Updates the DOM, CSS Grid, and column visibilities.
     * @private
     */
    updateView_() {
      const visibleCount = this.activeTechs_.size;

      // 1. Update visibility of column headers and data cells
      ALL_TECHS.forEach(techId => {
        const isVisible = this.activeTechs_.has(techId);
        const header = this.matrixEl_.querySelector(`.matrix-header[data-tech="${techId}"]`);
        if (header) {
          header.classList.toggle('is-col-hidden', !isVisible);
        }
        for (let r = 1; r <= 9; r++) {
          const cell = this.matrixEl_.querySelector(`.matrix-cell[data-row="${r}"][data-tech="${techId}"]`);
          if (cell) {
            cell.classList.toggle('is-col-hidden', !isVisible);
          }
        }
      });

      // 2. Adjust CSS Grid template columns and minimum width
      const dimWidth = this.fitScreen_ ? '140px' : '190px';
      this.matrixEl_.style.gridTemplateColumns = `${dimWidth} repeat(${visibleCount}, minmax(0, 1fr))`;

      if (this.fitScreen_ || visibleCount <= 6) {
        this.matrixEl_.style.minWidth = '100%';
      } else if (visibleCount <= 8) {
        this.matrixEl_.style.minWidth = '960px';
      } else {
        this.matrixEl_.style.minWidth = '1320px';
      }

      // 3. Update Category Pills in Toolbar
      if (this.toolbarEl_) {
        this.toolbarEl_.querySelectorAll('.cat-filter-pill').forEach(pill => {
          const catId = pill.getAttribute('data-cat-id');
          const cat = CAT_MAP[catId];
          if (!cat) return;

          const anyActive = cat.techs.some(tid => this.activeTechs_.has(tid));
          pill.classList.toggle('is-expanded', anyActive);
          pill.classList.toggle('is-collapsed', !anyActive);
          pill.setAttribute('aria-pressed', String(anyActive));

          const icon = pill.querySelector('.pill-state-icon');
          if (icon) {
            icon.textContent = anyActive ? '▾' : '▸';
          }
        });

        // 4. Update Preset Buttons in Toolbar
        this.toolbarEl_.querySelectorAll('.matrix-view-btn').forEach(btn => {
          const vKey = btn.getAttribute('data-view');
          btn.classList.toggle('is-active', vKey === this.currentView_);
        });
      }
    }

    /**
     * Displays a floating non-intrusive feedback toast.
     * @param {string} message
     * @private
     */
    showToast_(message) {
      if (!this.toastEl_) {
        this.toastEl_ = document.createElement('div');
        this.toastEl_.className = 'matrix-feedback-toast';
        this.toastEl_.setAttribute('role', 'status');
        this.toastEl_.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.toastEl_);
      }

      this.toastEl_.textContent = message;
      this.toastEl_.classList.add('is-visible');

      if (this.toastTimer_) {
        clearTimeout(this.toastTimer_);
      }
      this.toastTimer_ = window.setTimeout(() => {
        if (this.toastEl_) {
          this.toastEl_.classList.remove('is-visible');
        }
      }, 2200);
    }

    /**
     * Listens for global language change events and refreshes dynamic text.
     * @private
     */
    setupLanguageListener_() {
      window.addEventListener('hub:language-change', () => {
        this.updateView_();
      });
    }

    /**
     * Helper to check if current locale is Traditional Chinese.
     * @return {boolean}
     * @private
     */
    isZh_() {
      return window.HubLanguage ? window.HubLanguage.get() === 'zh' : false;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new MatrixInteractiveController().init();
    });
  } else {
    new MatrixInteractiveController().init();
  }
})();
