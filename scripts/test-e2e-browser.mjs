import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp"
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

server.listen(8768, "127.0.0.1", async () => {
  console.log("Test Server started on http://127.0.0.1:8768");
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    const errors = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", err => errors.push(err.message));

    // 1. Test memory-physics.html
    console.log("Navigating to memory-physics.html...");
    await page.goto("http://127.0.0.1:8768/memory-physics.html", { waitUntil: "networkidle" });
    
    // Test Arrhenius Calculator
    const initialFit = await page.textContent("#arrheniusFitDisp");
    console.log("Initial Arrhenius FIT:", initialFit);

    await page.fill("#arrheniusStressTemp", "165");
    await page.dispatchEvent("#arrheniusStressTemp", "input");
    const updatedFit = await page.textContent("#arrheniusFitDisp");
    console.log("Updated Arrhenius FIT @ 165°C:", updatedFit);

    // Test PQC Simulator
    await page.click('button[data-pqc-strategy="raw"]');
    const rawFootprint = await page.textContent("#pqcFootprintBytesDisp");
    console.log("PQC Raw Strategy Stored Bytes:", rawFootprint);

    await page.click('button[data-pqc-strategy="hybrid"]');
    const hybridFootprint = await page.textContent("#pqcFootprintBytesDisp");
    console.log("PQC Hybrid Strategy Stored Bytes:", hybridFootprint);

    // Test UCIe Calculator
    await page.click('button[data-ucie-lanes="64"]');
    await page.click('button[data-ucie-rate="48"]');
    const ucieBw = await page.textContent("#ucieRawBwDisp");
    const ucieLatency = await page.textContent("#uciePipeLatencyDisp");
    console.log("UCIe x64 @ 48Gbps Bandwidth:", ucieBw, "MAC Latency:", ucieLatency);

    // 2. Test security-assurance.html
    console.log("Navigating to security-assurance.html...");
    await page.goto("http://127.0.0.1:8768/security-assurance.html", { waitUntil: "networkidle" });
    const assuranceTitle = await page.textContent("#suite-ref-title");
    console.log("Security Assurance suite title:", assuranceTitle.trim().replace(/\s+/g, " "));

    await browser.close();
    server.close();

    if (errors.length > 0) {
      console.error("Browser encountered console errors:", errors);
      process.exit(1);
    } else {
      console.log("\n=======================================================");
      console.log("E2E BROWSER TEST & DOM INTERACTIONS COMPLETED WITH 0 ERRORS!");
      console.log("=======================================================");
      process.exit(0);
    }
  } catch (err) {
    console.error("E2E Test Failed:", err);
    server.close();
    process.exit(1);
  }
});
