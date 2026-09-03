// specialty-nvm.js · Interactive Features & Language Sync for Specialty eNVM
// Supports: BCD Power, Array Redundancy Repair, High-Voltage Display Drivers

document.addEventListener('DOMContentLoaded', () => {
  // 1. 監聽全域最上層語言變更事件
  function handleLanguageChange(lang) {
    // 若有動態 Canvas 或圖表需依語系重繪，在此觸發
  }

  window.addEventListener('hub:language-change', (e) => {
    handleLanguageChange(e.detail.language);
  });

  if (window.HubLanguage) {
    handleLanguageChange(window.HubLanguage.get());
  }

  // 2. 錨點平滑滾動與微距補償（避免被固定導覽列遮蔽）
  document.querySelectorAll('.nav-pill').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const offset = 80; // Header height offset
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetEl.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 3. 卡片進入視窗的平滑淡入效果 (Intersection Observer)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tech-card, .pipeline-step, .evo-card, .foundry-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(el);
    });
  }
});
