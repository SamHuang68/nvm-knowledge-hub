import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';

export async function startTestServer(root) {
  const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.webmanifest':'application/manifest+json'};
  const server = createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      let file = path.resolve(root, '.' + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) throw new Error('路徑超出驗證範圍');
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.statSync(file).isFile()) throw new Error('找不到資源');
      response.writeHead(200, {'content-type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'cache-control':'no-store'});
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
      response.end('找不到資源');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {base: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise(resolve => server.close(resolve))};
}
