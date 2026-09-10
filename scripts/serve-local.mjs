import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".pdf": "application/pdf"
};

http.createServer((request, response) => {
  let urlObj;
  let pathname;
  try {
    urlObj = new URL(request.url, "http://127.0.0.1");
    pathname = decodeURIComponent(urlObj.pathname);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("網址格式無效");
    return;
  }

  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let file = path.resolve(root, requested);

  // 目錄尾斜線 301 重定向：若為目錄且 !pathname.endsWith('/')，回應 301 重定向至 pathname + '/'
  if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, {
        "Location": pathname + "/" + (urlObj.search || "")
      });
      response.end();
      return;
    }
    file = path.join(file, "index.html");
  }

  // 支援無副檔名 Clean URL fallback（自動嘗試 file + '.html'）
  if (file.startsWith(root) && !fs.existsSync(file)) {
    if (!path.extname(file) && fs.existsSync(file + ".html") && fs.statSync(file + ".html").isFile()) {
      file = file + ".html";
    }
  }

  // 404 時傳回站內 404.html 檔案
  if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    const notFoundPage = path.resolve(root, "404.html");
    if (fs.existsSync(notFoundPage) && fs.statSync(notFoundPage).isFile()) {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      fs.createReadStream(notFoundPage).pipe(response);
    } else {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("找不到頁面或檔案");
    }
    return;
  }

  response.writeHead(200, {
    "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store"
  });
  fs.createReadStream(file).pipe(response);
}).listen(8765, "127.0.0.1", () => console.log("NVM Knowledge Hub: http://127.0.0.1:8765/"));
