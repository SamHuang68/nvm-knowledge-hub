import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg", ".jpeg":"image/jpeg" };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404, { "content-type":"text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control":"no-store" });
  fs.createReadStream(file).pipe(response);
}).listen(8765, "127.0.0.1", () => console.log("NVM Knowledge Hub: http://127.0.0.1:8765/"));
