/**
 * @fileoverview NVM Technology Trade-Off Matrix Interactive Controller.
 * Implements Layer 1 (Category) collapsible functionality and Layer 2 (Technology)
 * drag-and-drop / click-to-reorder functionality with accessibility and bilingual support.
 *
 * Compliant with Google JavaScript Style Guide and WCAG 2.1 standards.
 * @author NVM Knowledge Hub Architecture Team
 */

(function () {
  'use strict';

  /**
   * Definition of the 5 Level 1 Technology Categories.
   * @const {!Array<!Object>}
   */
  const CATEGORIES = [
    {
      id: 'foundry',
      nameZh: '晶圓廠製程類',
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
   * Default canonical ordering of 11 technology leaf columns.
   * @const {!Array<string>}
   */
  const DEFAULT_TECH_ORDER = [
    'efuse', 'maskrom', 'eeprom', 'fgotp', 'antifuse',
    'ldmtp', 'hdmtp', 'sst', 'sonos', 'reram', 'mram'
  ];

  /**
   * Fast lookup map from technology ID to its parent category ID.
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
   * Controller class governing interactive matrix states, reordering, and collapsing.
   */
  class MatrixInteractiveController {
    constructor() {
      /** @private {?HTMLElement} */
      this.matrixEl_ = null;
      /** @private {?HTMLElement} */
      this.wrapperEl_ = null;
      /** @private {?HTMLElement} */
      this.toolbarEl_ = null;

      /** @private {!Array<string>} */
      this.currentOrder_ = [...DEFAULT_TECH_ORDER];
      /** @private {!Set<string>} */
      this.collapsedCats_ = new Set();

      /** @private {?string} */
      this.draggedTechId_ = null;
      /** @private {?string} */
      this.dropTargetTechId_ = null;
      /** @private {string} */
      this.dropPosition_ = 'before'; // 'before' | 'after'

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

      if (!this.matrixEl_ || !this.wrapperEl_) {
        return;
      }

      this.createToolbar_();
      this.enhanceGroupHeaders_();
      this.enhanceLeafHeaders_();
      this.render_();
      this.setupLanguageListener_();
    }

    /**
     * Creates and mounts the interactive control toolbar above the matrix.
     * @private
     */
    createToolbar_() {
      const existing = document.getElementById('matrixInteractiveToolbar');
      if (existing) {
        existing.remove();
      }

      const toolbar = document.createElement('div');
      toolbar.id = 'matrixInteractiveToolbar';
      toolbar.className = 'matrix-interactive-toolbar';
      toolbar.setAttribute('role', 'toolbar');
      toolbar.setAttribute('aria-label', '矩陣第一層折疊與第二層排序控制');

      const isZh = this.isZh_();

      toolbar.innerHTML = `
        <div class="matrix-toolbar-row">
          <div class="matrix-toolbar-left">
            <span class="matrix-toolbar-title">
              <span class="toolbar-dot"></span>
              <span data-lang="zh">第一層 · 分類收合控制</span>
              <span data-lang="en">L1 · CATEGORY COLLAPSE</span>
            </span>
            <div class="matrix-cat-pills" role="group" aria-label="分類收合按鈕組">
              ${CATEGORIES.map(cat => `
                <button type="button" 
                        class="cat-filter-pill is-expanded" 
                        data-cat-id="${cat.id}"
                        aria-pressed="true"
                        title="${isZh ? '點擊收合此分類' : 'Click to collapse category'}">
                  <span class="pill-state-icon">▾</span>
                  <span data-lang="zh">${cat.nameZh}</span>
                  <span data-lang="en">${cat.nameEn}</span>
                  <span class="pill-count-badge">${cat.techs.length}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <div class="matrix-toolbar-right">
            <button type="button" id="btnExpandAllMatrix" class="matrix-action-btn" title="展開所有分類 / Expand all categories">
              <span data-lang="zh">全部展開</span>
              <span data-lang="en">Expand All</span>
            </button>
            <button type="button" id="btnCollapseAllMatrix" class="matrix-action-btn" title="收合所有分類 / Collapse all categories">
              <span data-lang="zh">全部收合</span>
              <span data-lang="en">Collapse All</span>
            </button>
            <button type="button" id="btnResetMatrixOrder" class="matrix-action-btn btn-reset" title="還原預設欄位排序與展開狀態 / Reset default order">
              <span class="btn-icon">↺</span>
              <span data-lang="zh">重設排序</span>
              <span data-lang="en">Reset Order</span>
            </button>
          </div>
        </div>
        <div class="matrix-drag-guidance">
          <span class="guidance-icon">💡</span>
          <span class="guidance-text">
            <span data-lang="zh"><b>操作指南：</b>點擊第一層分類可快速收合／展開；長按拖曳第二層技術標題 <b>⠿</b> 可自訂對比欄位順序（亦可使用 ‹ › 鍵微調）。</span>
            <span data-lang="en"><b>User Guide:</b> Click Level 1 Categories to collapse/expand; Drag Level 2 headers <b>⠿</b> or use ‹ › buttons to customize benchmark column ordering.</span>
          </span>
        </div>
      `;

      this.wrapperEl_.parentNode.insertBefore(toolbar, this.wrapperEl_);
      this.toolbarEl_ = toolbar;

      // Event delegation for category filter pills
      toolbar.querySelectorAll('.cat-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          this.toggleCategory_(catId);
        });
      });

      // Quick action buttons
      toolbar.querySelector('#btnExpandAllMatrix')?.addEventListener('click', () => {
        this.expandAll_();
      });
      toolbar.querySelector('#btnCollapseAllMatrix')?.addEventListener('click', () => {
        this.collapseAll_();
      });
      toolbar.querySelector('#btnResetMatrixOrder')?.addEventListener('click', () => {
        this.reset_();
      });
    }

    /**
     * Enhances Row 0 Category Group Headers with click-to-collapse controls.
     * @private
     */
    enhanceGroupHeaders_() {
      // Event delegation on matrix container for all category toggles
      this.matrixEl_.addEventListener('click', (e) => {
        const target = e.target;
        // Check if clicked inside a category header or collapsed placeholder
        const gh = target.closest('.matrix-group-header[data-category], .matrix-header.is-col-collapsed, .matrix-cell.is-cell-collapsed');
        if (gh) {
          const catId = gh.getAttribute('data-category');
          if (catId) {
            this.toggleCategory_(catId);
          }
        }
      });

      this.matrixEl_.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const gh = e.target.closest('.matrix-group-header[data-category], .matrix-header.is-col-collapsed');
          if (gh) {
            e.preventDefault();
            const catId = gh.getAttribute('data-category');
            if (catId) {
              this.toggleCategory_(catId);
            }
          }
        }
      });
    }

    /**
     * Enhances Row 1 Leaf Headers with Drag-and-Drop and accessibility shift controls.
     * @private
     */
    enhanceLeafHeaders_() {
      const leafHeaders = this.matrixEl_.querySelectorAll('.matrix-header[data-tech]');
      leafHeaders.forEach(lh => {
        const techId = lh.getAttribute('data-tech');
        lh.setAttribute('draggable', 'true');
        lh.classList.add('is-draggable-header');
        lh.setAttribute('title', this.isZh_() ? '拖曳此欄位調整排序' : 'Drag to reorder column');

        // Insert drag handles and shift buttons if not already added
        if (!lh.querySelector('.header-drag-bar')) {
          const originalContent = lh.innerHTML;
          lh.innerHTML = `
            <div class="header-drag-bar">
              <button type="button" class="col-shift-btn shift-left" data-shift="left" title="向左移動欄位 / Move left" aria-label="向左移動欄位">‹</button>
              <span class="drag-handle-grip" title="拖曳排序" aria-hidden="true">⠿</span>
              <button type="button" class="col-shift-btn shift-right" data-shift="right" title="向右移動欄位 / Move right" aria-label="向右移動欄位">›</button>
            </div>
            <div class="header-name-wrap">${originalContent}</div>
          `;
        }

        // Shift button events
        lh.querySelectorAll('.col-shift-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const direction = btn.getAttribute('data-shift');
            this.shiftColumn_(techId, direction);
          });
        });

        // Drag & Drop Events
        lh.addEventListener('dragstart', (e) => this.onDragStart_(e, techId, lh));
        lh.addEventListener('dragover', (e) => this.onDragOver_(e, techId, lh));
        lh.addEventListener('dragleave', () => this.onDragLeave_(lh));
        lh.addEventListener('drop', (e) => this.onDrop_(e, techId));
        lh.addEventListener('dragend', () => this.onDragEnd_());
      });
    }

    /**
     * Handles dragstart event.
     * @param {!DragEvent} e
     * @param {string} techId
     * @param {!HTMLElement} headerEl
     * @private
     */
    onDragStart_(e, techId, headerEl) {
      this.draggedTechId_ = techId;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', techId);
      }
      headerEl.classList.add('is-dragging');
      this.setColumnHighlight_(techId, 'col-dragging', true);
    }

    /**
     * Handles dragover event.
     * @param {!DragEvent} e
     * @param {string} targetTechId
     * @param {!HTMLElement} targetHeaderEl
     * @private
     */
    onDragOver_(e, targetTechId, targetHeaderEl) {
      e.preventDefault();
      if (!this.draggedTechId_ || this.draggedTechId_ === targetTechId) {
        return;
      }
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      const rect = targetHeaderEl.getBoundingClientRect();
      const midPoint = rect.left + rect.width / 2;
      const isBefore = e.clientX < midPoint;

      this.dropTargetTechId_ = targetTechId;
      this.dropPosition_ = isBefore ? 'before' : 'after';

      targetHeaderEl.classList.toggle('drop-target-before', isBefore);
      targetHeaderEl.classList.toggle('drop-target-after', !isBefore);
    }

    /**
     * Handles dragleave event.
     * @param {!HTMLElement} targetHeaderEl
     * @private
     */
    onDragLeave_(targetHeaderEl) {
      targetHeaderEl.classList.remove('drop-target-before', 'drop-target-after');
    }

    /**
     * Handles drop event.
     * @param {!DragEvent} e
     * @param {string} targetTechId
     * @private
     */
    onDrop_(e, targetTechId) {
      e.preventDefault();
      const sourceId = this.draggedTechId_;
      if (!sourceId || sourceId === targetTechId) {
        return;
      }

      this.moveTechColumn_(sourceId, targetTechId, this.dropPosition_);
      const sourceName = this.getTechDisplayName_(sourceId);
      const targetName = this.getTechDisplayName_(targetTechId);
      this.showToast_(this.isZh_() 
        ? `已將 ${sourceName} 移動至 ${targetName} ${this.dropPosition_ === 'before' ? '之前' : '之後'}` 
        : `Moved ${sourceName} ${this.dropPosition_} ${targetName}`);
    }

    /**
     * Cleans up classes after drag completes.
     * @private
     */
    onDragEnd_() {
      if (this.draggedTechId_) {
        this.setColumnHighlight_(this.draggedTechId_, 'col-dragging', false);
      }
      this.draggedTechId_ = null;
      this.dropTargetTechId_ = null;

      this.matrixEl_.querySelectorAll('.matrix-header').forEach(h => {
        h.classList.remove('is-dragging', 'drop-target-before', 'drop-target-after');
      });
    }

    /**
     * Shifts a column one step to the left or right among visible columns.
     * @param {string} techId
     * @param {string} direction 'left' | 'right'
     * @private
     */
    shiftColumn_(techId, direction) {
      const visibleTechs = this.getVisibleTechs_();
      const curIdx = visibleTechs.indexOf(techId);
      if (curIdx === -1) return;

      const targetIdx = direction === 'left' ? curIdx - 1 : curIdx + 1;
      if (targetIdx < 0 || targetIdx >= visibleTechs.length) return;

      const targetTechId = visibleTechs[targetIdx];
      this.moveTechColumn_(techId, targetTechId, direction === 'left' ? 'before' : 'after');

      const name = this.getTechDisplayName_(techId);
      this.showToast_(this.isZh_() 
        ? `已向${direction === 'left' ? '左' : '右'}移動 ${name}` 
        : `Shifted ${name} ${direction}`);
    }

    /**
     * Moves a tech column before or after a target tech column.
     * @param {string} sourceId
     * @param {string} targetId
     * @param {string} position 'before' | 'after'
     * @private
     */
    moveTechColumn_(sourceId, targetId, position) {
      const order = [...this.currentOrder_];
      const fromIndex = order.indexOf(sourceId);
      if (fromIndex === -1) return;

      order.splice(fromIndex, 1);
      const toIndex = order.indexOf(targetId);
      if (toIndex === -1) {
        order.push(sourceId);
      } else {
        const insertIndex = position === 'before' ? toIndex : toIndex + 1;
        order.splice(insertIndex, 0, sourceId);
      }

      this.currentOrder_ = order;
      this.render_();
    }

    /**
     * Toggles the collapse/expand state of a given category.
     * @param {string} catId
     * @private
     */
    toggleCategory_(catId) {
      if (this.collapsedCats_.has(catId)) {
        this.collapsedCats_.delete(catId);
        const cat = CAT_MAP[catId];
        this.showToast_(this.isZh_() ? `已展開分類：${cat.nameZh}` : `Expanded category: ${cat.nameEn}`);
      } else {
        if (this.collapsedCats_.size >= CATEGORIES.length - 1) {
          this.showToast_(this.isZh_() ? `請至少保留一個分類展開` : `Please keep at least one category expanded`);
          return;
        }
        this.collapsedCats_.add(catId);
        const cat = CAT_MAP[catId];
        this.showToast_(this.isZh_() ? `已收合分類：${cat.nameZh}` : `Collapsed category: ${cat.nameEn}`);
      }
      this.render_();
    }

    /**
     * Expands all categories.
     * @private
     */
    expandAll_() {
      this.collapsedCats_.clear();
      this.render_();
      this.showToast_(this.isZh_() ? `已展開所有分類` : `All categories expanded`);
    }

    /**
     * Collapses non-focus categories, leaving Logic OTP.
     * @private
     */
    collapseAll_() {
      this.collapsedCats_.clear();
      CATEGORIES.forEach(c => {
        if (c.id !== 'otp') {
          this.collapsedCats_.add(c.id);
        }
      });
      this.render_();
      this.showToast_(this.isZh_() ? `已收合其他分類，保留焦點一次性寫入 (OTP)` : `Collapsed non-focus categories`);
    }

    /**
     * Resets ordering and expansion to default canonical state.
     * @private
     */
    reset_() {
      this.currentOrder_ = [...DEFAULT_TECH_ORDER];
      this.collapsedCats_.clear();
      this.render_();
      this.showToast_(this.isZh_() ? `已恢復預設欄位排序與展開狀態` : `Reset to default order and expansion`);
    }

    /**
     * Renders the matrix layout according to currentOrder_ and collapsedCats_.
     * @private
     */
    render_() {
      const isZh = this.isZh_();

      // 1. Synchronize Toolbar Pills
      if (this.toolbarEl_) {
        this.toolbarEl_.querySelectorAll('.cat-filter-pill').forEach(pill => {
          const cid = pill.getAttribute('data-cat-id');
          const isCollapsed = this.collapsedCats_.has(cid);
          pill.classList.toggle('is-expanded', !isCollapsed);
          pill.classList.toggle('is-collapsed', isCollapsed);
          pill.setAttribute('aria-pressed', String(!isCollapsed));

          const icon = pill.querySelector('.pill-state-icon');
          if (icon) icon.textContent = isCollapsed ? '▸' : '▾';
          pill.setAttribute('title', isCollapsed 
            ? (isZh ? '點擊展開此分類' : 'Click to expand category')
            : (isZh ? '點擊收合此分類' : 'Click to collapse category'));
        });
      }

      // 2. Remove previously injected collapsed column placeholders
      this.matrixEl_.querySelectorAll('.matrix-placeholder-col').forEach(el => el.remove());

      // 3. Compute column slots and contiguous category spans
      const slots = [];
      const visitedCollapsed = new Set();

      this.currentOrder_.forEach(tid => {
        const cid = TECH_TO_CAT[tid];
        if (this.collapsedCats_.has(cid)) {
          if (!visitedCollapsed.has(cid)) {
            visitedCollapsed.add(cid);
            slots.push({ type: 'collapsed', catId: cid, techId: null });
          }
        } else {
          slots.push({ type: 'tech', catId: cid, techId: tid });
        }
      });

      // 4. Update CSS Grid Template Columns
      const colDefs = ['200px'];
      slots.forEach(s => {
        if (s.type === 'collapsed') {
          colDefs.push('60px');
        } else {
          colDefs.push('minmax(124px, 1fr)');
        }
      });
      this.matrixEl_.style.gridTemplateColumns = colDefs.join(' ');
      const totalWidth = 200 + slots.reduce((acc, s) => acc + (s.type === 'collapsed' ? 60 : 130), 0);
      this.matrixEl_.style.minWidth = `${Math.max(880, totalWidth)}px`;

      // 5. Build/Reorder Row 0 (Category Headers)
      const catRuns = [];
      slots.forEach(s => {
        const cid = s.catId;
        const isCol = s.type === 'collapsed';
        if (catRuns.length > 0 &&
            catRuns[catRuns.length - 1].catId === cid &&
            catRuns[catRuns.length - 1].isCollapsed === isCol &&
            !isCol) {
          catRuns[catRuns.length - 1].span += 1;
        } else {
          catRuns.push({ catId: cid, isCollapsed: isCol, span: 1 });
        }
      });

      const cornerEl = this.matrixEl_.querySelector('.matrix-corner');
      let insertAfterAnchor = cornerEl;

      const existingGH = {};
      this.matrixEl_.querySelectorAll('.matrix-group-header[data-category]').forEach(gh => {
        existingGH[gh.getAttribute('data-category')] = gh;
      });

      catRuns.forEach(run => {
        const cat = CAT_MAP[run.catId];
        let ghEl = existingGH[run.catId];

        if (run.isCollapsed) {
          ghEl.className = 'matrix-group-header is-cat-collapsed';
          ghEl.style.gridColumn = 'span 1';
          ghEl.setAttribute('aria-expanded', 'false');
          ghEl.setAttribute('title', isZh ? `點擊展開 ${cat.nameZh}` : `Click to expand ${cat.nameEn}`);
          ghEl.innerHTML = `
            <button type="button" class="cat-expand-trigger" aria-label="展開 ${cat.nameZh}">
              <span class="fold-plus-icon">+</span>
              <span class="fold-cat-text">${cat.nameZh.slice(0, 4)}</span>
              <span class="fold-badge">${cat.techs.length}</span>
            </button>
          `;
          
        } else {
          ghEl.className = `matrix-group-header span-${run.span} is-cat-expanded`; ghEl.setAttribute('data-category', run.catId);
          ghEl.style.gridColumn = `span ${run.span}`;
          ghEl.setAttribute('aria-expanded', 'true');
          ghEl.setAttribute('title', isZh ? `點擊收合 ${cat.nameZh}` : `Click to collapse ${cat.nameEn}`);
          ghEl.innerHTML = `
            <span data-lang="zh">${cat.nameZh}</span>
            <span data-lang="en">${cat.nameEn}</span>
            <span class="cat-fold-chevron" aria-hidden="true"> ▾</span>
          `;

        }

        insertAfterAnchor.after(ghEl);
        insertAfterAnchor = ghEl;
      });

      // 6. Reorder Row 1 (Leaf Headers)
      const dimHeader = this.matrixEl_.querySelector('.matrix-dim-header') || this.matrixEl_.querySelector('.matrix-header');
      let prevLeafHeader = dimHeader;

      slots.forEach(s => {
        if (s.type === 'collapsed') {
          const cat = CAT_MAP[s.catId];
          const colPlaceholder = document.createElement('div');
          colPlaceholder.className = 'matrix-header matrix-placeholder-col is-col-collapsed';
          colPlaceholder.setAttribute('data-category', s.catId);
          colPlaceholder.innerHTML = `
            <button type="button" class="col-expand-btn" title="${isZh ? '展開' : 'Expand'} ${cat.nameZh} (+${cat.techs.length})">
              +${cat.techs.length}
            </button>
          `;
          
          prevLeafHeader.after(colPlaceholder);
          prevLeafHeader = colPlaceholder;
        } else {
          const lh = this.matrixEl_.querySelector(`.matrix-header[data-tech="${s.techId}"]`);
          if (lh) {
            lh.style.display = '';
            prevLeafHeader.after(lh);
            prevLeafHeader = lh;
          }
        }
      });

      // Hide headers of collapsed categories
      this.currentOrder_.forEach(tid => {
        const cid = TECH_TO_CAT[tid];
        if (this.collapsedCats_.has(cid)) {
          const lh = this.matrixEl_.querySelector(`.matrix-header[data-tech="${tid}"]`);
          if (lh) lh.style.display = 'none';
        }
      });

      // 7. Reorder Rows 2~10 (Cells for each row)
      for (let r = 1; r <= 9; r++) {
        const rowHeader = this.matrixEl_.querySelector(`.matrix-row-header[data-row="${r}"]`);
        if (!rowHeader) continue;
        let prevCell = rowHeader;

        slots.forEach(s => {
          if (s.type === 'collapsed') {
            const cat = CAT_MAP[s.catId];
            const cellPlaceholder = document.createElement('div');
            cellPlaceholder.className = 'matrix-cell matrix-placeholder-col is-cell-collapsed';
            cellPlaceholder.setAttribute('data-category', s.catId);
            cellPlaceholder.setAttribute('data-row', String(r));
            cellPlaceholder.setAttribute('title', isZh ? `點擊展開 ${cat.nameZh}` : `Click to expand ${cat.nameEn}`);
            cellPlaceholder.innerHTML = `<span class="collapsed-dot-fill">···</span>`;
            
            prevCell.after(cellPlaceholder);
            prevCell = cellPlaceholder;
          } else {
            const cell = this.matrixEl_.querySelector(`.matrix-cell[data-row="${r}"][data-tech="${s.techId}"]`);
            if (cell) {
              cell.style.display = '';
              prevCell.after(cell);
              prevCell = cell;
            }
          }
        });

        // Hide cells of collapsed categories
        this.currentOrder_.forEach(tid => {
          const cid = TECH_TO_CAT[tid];
          if (this.collapsedCats_.has(cid)) {
            const cell = this.matrixEl_.querySelector(`.matrix-cell[data-row="${r}"][data-tech="${tid}"]`);
            if (cell) cell.style.display = 'none';
          }
        });
      }
    }

    /**
     * Toggles highlight class for all cells in a technology column.
     * @param {string} techId
     * @param {string} className
     * @param {boolean} add
     * @private
     */
    setColumnHighlight_(techId, className, add) {
      const elements = this.matrixEl_.querySelectorAll(`[data-tech="${techId}"]`);
      elements.forEach(el => {
        el.classList.toggle(className, add);
      });
    }

    /**
     * Gets the list of currently visible technology IDs.
     * @return {!Array<string>}
     * @private
     */
    getVisibleTechs_() {
      return this.currentOrder_.filter(tid => !this.collapsedCats_.has(TECH_TO_CAT[tid]));
    }

    /**
     * Gets human-readable display name for a technology ID.
     * @param {string} techId
     * @return {string}
     * @private
     */
    getTechDisplayName_(techId) {
      const header = this.matrixEl_.querySelector(`.matrix-header[data-tech="${techId}"]`);
      if (header) {
        const text = header.innerText.replace(/[‹›⠿]/g, '').trim();
        return text.split('\n')[0] || techId;
      }
      return techId;
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
      }, 2400);
    }

    /**
     * Listens for global language changes and refreshes dynamic text.
     * @private
     */
    setupLanguageListener_() {
      window.addEventListener('hub:language-change', () => {
        this.render_();
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
