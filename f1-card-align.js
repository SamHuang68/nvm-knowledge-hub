/* Align F1 hub card with memory-physics.html thesis. */
(function alignF1Card() {
  function apply() {
    var card = document.querySelector('a.km-card[href="memory-physics.html"]');
    if (!card) return;
    var title = card.querySelector(".km-card-title");
    var desc = card.querySelector(".km-card-desc");
    var tags = card.querySelector(".km-card-tags");
    if (title) {
      title.innerHTML = '<span data-lang="zh">互補儲存與可驗證差異</span><span data-lang="en">Complementary Storage &amp; Verifiable Difference</span>';
    }
    if (desc) {
      desc.innerHTML = '<span data-lang="zh">電路可行不等於產品可行。差動讀取、SRAM PUF 與加密 OTP 如何把永久 state 變成可讀、但不是永久 secret。</span><span data-lang="en">Circuit feasibility is not product feasibility. How differential read, SRAM PUF and encrypted OTP make persistent state readable without making it a persistent secret.</span>';
    }
    if (tags) {
      tags.innerHTML = "<span>Circuit ≠ Product</span><span>SRAM ↔ OTP</span><span>Evidence Ledger</span>";
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
