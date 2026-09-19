import path from 'node:path';
import {spawn} from 'node:child_process';
import {startTestServer} from './驗證伺服器.mjs';

const root = path.resolve(import.meta.dirname,'..');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const scripts = [
  'scripts/驗證雙語門禁.mjs',
  'scripts/驗證公開頁面語系.mjs',
  'scripts/驗證頁面語系.mjs',
  'scripts/驗證模擬雙語.mjs',
  'tools/whitepaper-studio/scripts/驗證白皮書雙語.mjs',
  'scripts/驗證安全保證語系.mjs',
];
try {
  for (const script of scripts) {
    console.log(`雙語發布驗收：${script}`);
    const env = {...process.env,NVM_QA_BASE:process.env.NVM_QA_BASE || server.base};
    await new Promise((resolve,reject) => {
      const child = spawn(process.execPath,[path.join(root,script)],{cwd:root,env,stdio:'inherit'});
      child.once('error',reject);
      child.once('exit',code => code === 0 ? resolve() : reject(new Error(`${script} 未通過（${code}）`)));
    });
  }
} finally {if (server) await server.close();}
