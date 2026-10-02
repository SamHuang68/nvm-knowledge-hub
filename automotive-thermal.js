import { accelerationFactor } from "./automotive-model.js";

    /**
     * Flagship Lab 01: 175°C Arrhenius Thermal Aging Canvas
     */
    (function () {
      const canvas = document.getElementById("thermalCanvas");
      if (!canvas) return;
      let ctx = null;
      const T = (en, zh) => (window.HubLanguage?.get() || document.documentElement.lang).startsWith("zh") ? zh : en;

      const tempSlider = document.getElementById("tempSlider");
      const tempValElem = document.getElementById("tempVal");
      const yearSlider = document.getElementById("yearSlider");
      const yearValElem = document.getElementById("yearVal");
      const afValElem = document.getElementById("afVal");

      function setupHiDPI() {
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const cssW = canvas.parentElement.clientWidth;
        const cssH = 280;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.width = cssW + "px";
        canvas.style.height = cssH + "px";
        ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      function renderThermal() {
        if (!ctx) return;
        const w = canvas.parentElement.clientWidth;
        const h = 280;

        const tempC = parseFloat(tempSlider.value);
        const years = parseFloat(yearSlider.value);

        tempValElem.textContent = `${tempC} °C`;
        yearValElem.textContent = T(`${years} Yrs`, `${years} 年`);
        tempSlider.setAttribute("aria-valuetext", `${tempC} °C`);
        yearSlider.setAttribute("aria-valuetext", T(`${years} Yrs`, `${years} 年`));

        const af = accelerationFactor(tempC);
        afValElem.textContent = af.toLocaleString(T("en-US", "zh-TW"), { maximumFractionDigits: 2 }) + "×";
        afValElem.dataset.value = String(af);
        document.getElementById("thermalSummary").textContent = T(`Assumed Ea = 0.84 eV; reference = 55°C. AF = ${afValElem.textContent} at ${tempC}°C. The ${years}-year marker does not change AF. Curves A/B are arbitrary illustrations, not an AF-derived retention forecast.`, `假設 Ea = 0.84 eV；基準 55°C。在 ${tempC}°C 下，AF = ${afValElem.textContent}。${years} 年標記不改變 AF。A／B 曲線是任意示意，並非由 AF 推導的保存壽命預測。`);

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = "rgba(196, 165, 116, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        const plotX = 45;
        const plotY = 35;
        const plotW = w - 75;
        const plotH = h - 70;

        // Axes
        ctx.strokeStyle = "rgba(196, 165, 116, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plotX, plotY);
        ctx.lineTo(plotX, plotY + plotH);
        ctx.lineTo(plotX + plotW, plotY + plotH);
        ctx.stroke();

        const isNarrow = w < 360;
        ctx.font = "700 11px 'IBM Plex Mono'";
        ctx.fillStyle = "#334155";
        ctx.fillText(
          isNarrow ? T(`ILLUSTRATIVE CURVES (${tempC}°C)`, `示意曲線（${tempC}°C）`) : T(`ILLUSTRATIVE CURVES VS TIME (Tj = ${tempC}°C)`, `示意曲線與時間（Tj = ${tempC}°C）`),
          plotX + (isNarrow ? 4 : 10),
          22
        );

        // Arbitrary illustration A; unrelated to calibrated device reliability.
        ctx.strokeStyle = "#c4a574";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(plotX, plotY + 20);
        const afDrop = (tempC / 175) * 8;
        ctx.lineTo(plotX + plotW, plotY + 20 + afDrop);
        ctx.stroke();

        ctx.fillStyle = "#c4a574";
        ctx.fillText(
          isNarrow ? T("● Curve A (illustrative)", "● 曲線 A（示意）") : T("● Curve A: arbitrary trend (not measured)", "● 曲線 A：任意趨勢（非量測）"),
          plotX + (isNarrow ? 8 : 16),
          plotY + 42
        );

        // Arbitrary illustration B; not a measured memory-family comparison.
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const fgTFactor = Math.pow(tempC / 100, 2.5);
        for (let t = 0; t <= 25; t += 0.5) {
          const px = plotX + (t / 25) * plotW;
          const decay = Math.exp(-0.06 * fgTFactor * t);
          const py = plotY + 20 + (1 - decay) * (plotH - 28);
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = "#f87171";
        ctx.fillText(
          isNarrow ? T("● Curve B (illustrative)", "● 曲線 B（示意）") : T("● Curve B: arbitrary decay (not measured)", "● 曲線 B：任意衰減（非量測）"),
          plotX + (isNarrow ? 8 : 16),
          plotY + 64
        );

        // Failure threshold line
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(plotX, plotY + plotH * 0.65);
        ctx.lineTo(plotX + plotW, plotY + plotH * 0.65);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f87171";
        ctx.fillText(
          isNarrow ? T("REFERENCE LINE", "示意參考線") : T("ILLUSTRATIVE REFERENCE LINE", "示意參考線"),
          isNarrow ? plotX + 10 : plotX + plotW - 210,
          plotY + plotH * 0.65 - 6
        );

        // Current Operating Year Marker
        const curPx = plotX + (years / 25) * plotW;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curPx, plotY);
        ctx.lineTo(curPx, plotY + plotH);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.fillText(T(`▲ Marker: ${years} Yrs`, `▲ 標記：${years} 年`), curPx - 26, plotY + plotH + 16);
      }

      tempSlider.addEventListener("input", renderThermal);
      yearSlider.addEventListener("input", renderThermal);
      window.addEventListener("hub:language-change", renderThermal);
      window.addEventListener("resize", () => { setupHiDPI(); renderThermal(); });
      setupHiDPI(); renderThermal();
    })();
