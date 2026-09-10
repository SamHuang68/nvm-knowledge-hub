import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".md":"text/markdown; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg", ".jpeg":"image/jpeg" };

http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname); }
  catch { response.writeHead(400, {"content-type":"text/plain; charset=utf-8"}); response.end("網址格式無效"); return; }
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let file = path.resolve(root, requested);
  if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { "content-type":"text/plain; charset=utf-8" });
    response.end("找不到頁面或檔案");
    return;
  }
  response.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control":"no-store" });
  fs.createReadStream(file).pipe(response);
}).listen(8765, "127.0.0.1", () => console.log("NVM Knowledge Hub: http://127.0.0.1:8765/"));
