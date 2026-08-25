(() => {
  const page = document.querySelector(".ai-nvm-page");
  const list = document.querySelector("#opportunityList");
  if (!page || !list) return;

  const records = [...list.querySelectorAll(".opportunity-record")];
  const viewButtons = [...document.querySelectorAll("[data-opportunity-view]")].filter(button => button.tagName === "BUTTON");
  const filterButtons = [...document.querySelectorAll("button[data-write-filter]")];
  const count = document.querySelector("#opportunityCount");
  const empty = document.querySelector("#opportunityEmpty");
  const navLinks = [...document.querySelectorAll("#primaryNav a[href^='#']")];
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let activeView = page.dataset.opportunityView === "proof" ? "proof" : "all";
  let activeFilter = "all";

  function initTabs(buttonSelector, panelSelector, keyName) {
    const buttons = [...document.querySelectorAll(buttonSelector)];
    const panels = [...document.querySelectorAll(panelSelector)];
    if (!buttons.length || !panels.length) return;
    const tablist = buttons[0].parentElement;
    const mobileTabs = window.matchMedia("(max-width: 620px)");
    let activeValue = buttons.find(button => button.classList.contains("active"))?.dataset[keyName] || buttons[0].dataset[keyName];
    const activate = value => {
      activeValue = value;
      buttons.forEach(button => {
        const active = button.dataset[keyName] === value;
        button.classList.toggle("active", active);
        if (mobileTabs.matches) {
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
        }
      });
      panels.forEach(panel => {
        const active = panel.dataset[`${keyName.replace("Tab", "")}Panel`] === value;
        panel.classList.toggle("active", active);
        panel.hidden = mobileTabs.matches && !active;
      });
    };
    const syncSemantics = () => {
      if (mobileTabs.matches) {
        tablist.setAttribute("role", "tablist");
        buttons.forEach(button => {
          button.setAttribute("role", "tab");
          button.setAttribute("aria-controls", button.id.replace("tab", "panel"));
        });
        panels.forEach(panel => {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", panel.id.replace("panel", "tab"));
        });
      } else {
        tablist.removeAttribute("role");
        buttons.forEach(button => {
          button.removeAttribute("role");
          button.removeAttribute("aria-selected");
          button.removeAttribute("aria-controls");
          button.removeAttribute("tabindex");
        });
        panels.forEach(panel => {
          panel.hidden = false;
          panel.removeAttribute("role");
          panel.removeAttribute("aria-labelledby");
        });
      }
      activate(activeValue);
    };
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(button.dataset[keyName]));
      button.addEventListener("keydown", event => {
        let next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        activate(buttons[next].dataset[keyName]);
        buttons[next].focus();
      });
    });
    mobileTabs.addEventListener?.("change", syncSemantics);
    syncSemantics();
  }

  initTabs("[data-selection-tab]", "[data-selection-panel]", "selectionTab");
  initTabs("[data-assurance-tab]", "[data-assurance-panel]", "assuranceTab");

  function render() {
    let visible = 0;
    records.forEach(record => {
      const evidenceMatch = activeView === "all" || record.dataset.evidence === "proof";
      const writeMatch = activeFilter === "all" || record.dataset.write === activeFilter;
      const show = evidenceMatch && writeMatch;
      record.hidden = !show;
      if (show) visible += 1;
    });

    page.dataset.opportunityView = activeView;
    viewButtons.forEach(button => {
      const active = button.dataset.opportunityView === activeView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    filterButtons.forEach(button => {
      const active = button.dataset.writeFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (count) count.textContent = String(visible).padStart(2, "0");
    if (empty) empty.hidden = visible !== 0;
  }

  function localizeControls() {
    const zh = page.dataset.language !== "en";
    document.querySelector(".view-switch")?.setAttribute("aria-label", zh ? "證據顯示範圍" : "Opportunity evidence view");
    document.querySelector(".write-filters")?.setAttribute("aria-label", zh ? "持久狀態寫入類型" : "Persistent-state write profile");
    document.querySelector(".map-planes")?.setAttribute("aria-label", zh ? "持久狀態契約平面" : "Persistent-state contract planes");
    document.querySelector(".photonics-state-model")?.setAttribute("aria-label", zh ? "光引擎持久基線與揮發控制狀態契約" : "Optical-engine persistent-baseline and volatile-control state contract");
    document.querySelector(".selection-matrix")?.setAttribute("aria-label", zh ? "依狀態更新頻率與斷電保存需求選擇儲存層" : "Storage-layer selection by state cadence and power-off retention");
    document.querySelector(".node-transition")?.setAttribute("aria-label", zh ? "依公開產品與 foundry roadmap 整理的先進節點 embedded NVM 轉換路徑" : "Advanced-node embedded-NVM transition across public products and foundry roadmaps");
    document.querySelector(".read-domain-diagram")?.setAttribute("aria-label", zh ? "TSMC N5 OTP 的 core-supply read plane 與受控 programming domain 分離" : "TSMC N5 OTP core-supply read plane separated from the controlled programming domain");
    document.querySelector(".sharepoint-extension")?.setAttribute("aria-label", zh ? "公司 SharePoint 內部產品契約補充區" : "Internal product-contract completion area for SharePoint");
    document.querySelector(".abstraction-system")?.setAttribute("aria-label", zh ? "受保護狀態轉移與四個 Assurance Plane" : "Protected state transition with four assurance planes");
    document.querySelector(".selection-tabs")?.setAttribute("aria-label", zh ? "NVM Selection Layer" : "NVM selection layers");
    document.querySelector(".assurance-tabs")?.setAttribute("aria-label", zh ? "Secure Storage Assurance Plane" : "Secure Storage assurance planes");
  }

  function setActiveNav(sectionId) {
    navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${sectionId}`;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if (navSections.length) {
    let navFrame = 0;
    const updateActiveNav = () => {
      navFrame = 0;
      const marker = window.scrollY + Math.min(window.innerHeight * .32, 320);
      let current = navSections[0];
      navSections.forEach(section => {
        if (section.offsetTop <= marker) current = section;
      });
      setActiveNav(current.id);
    };
    const requestNavUpdate = () => {
      if (!navFrame) navFrame = requestAnimationFrame(updateActiveNav);
    };
    navLinks.forEach(link => link.addEventListener("click", () => setActiveNav(link.hash.slice(1))));
    window.addEventListener("scroll", requestNavUpdate, { passive: true });
    window.addEventListener("resize", requestNavUpdate);
    setActiveNav(location.hash.slice(1) || navSections[0].id);
    requestNavUpdate();
  }

  viewButtons.forEach(button => button.addEventListener("click", () => {
    activeView = button.dataset.opportunityView === "proof" ? "proof" : "all";
    render();
  }));
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.writeFilter || "all";
    render();
  }));

  new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === "data-language")) localizeControls();
  }).observe(page, { attributes: true });

  localizeControls();
  render();
})();
