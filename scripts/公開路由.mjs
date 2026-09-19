import fs from 'node:fs';
import path from 'node:path';

export function loadPublicRoutes(siteRoot) {
  const contract = JSON.parse(fs.readFileSync(path.join(siteRoot, 'data/公開路由.json'), 'utf8'));
  if (contract.schemaVersion !== '1.0' || !Array.isArray(contract.pages) || !Array.isArray(contract.fragments)) {
    throw new Error('公開路由契約格式無效。');
  }
  const pages = new Set(contract.pages);
  const fragments = new Map(contract.fragments.map(fragment => [fragment.path, fragment]));
  const paths = [...contract.pages, ...contract.fragments.map(fragment => fragment.path)];
  if (new Set(paths).size !== paths.length) throw new Error('公開路由契約含重複路徑。');
  for (const relative of paths) {
    if (typeof relative !== 'string' || /[\\:\0]/u.test(relative) || path.posix.isAbsolute(relative) || path.posix.normalize(relative) !== relative || relative.startsWith('../') || !/\.html?$/iu.test(relative)) {
      throw new Error(`公開路由路徑無效：${relative}`);
    }
    const file = path.resolve(siteRoot, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`公開路由不存在：${relative}`);
    const html = fs.readFileSync(file, 'utf8');
    if (pages.has(relative)) {
      if (!/<html\b/iu.test(html) || !/<body\b/iu.test(html)) throw new Error(`完整頁面缺少文件外框：${relative}`);
    } else {
      const fragment = fragments.get(relative);
      if (!pages.has(fragment.ownerPage) || !fragment.description) throw new Error(`HTML 片段缺少有效完整入口或說明：${relative}`);
      if (/<!doctype\b|<\/?(?:html|head|body)\b/iu.test(html)) throw new Error(`HTML 片段不得宣告完整文件外框：${relative}`);
    }
  }
  return { pages, fragments };
}

export function assertDeclaredHtml(routes, relative) {
  if (!routes.pages.has(relative) && !routes.fragments.has(relative)) {
    throw new Error(`HTML 檔案未宣告為完整頁面或片段：${relative}`);
  }
}
