import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'data', 'release-lineage.json');
const write = process.argv.includes('--write');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const gitBytes = (...args) => execFileSync('git', args, { cwd: root });
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const manifestPath = 'data/release-lineage.json';

function sourceSet(commit) {
  const output = gitBytes('ls-tree', '-r', '-z', commit).toString('utf8');
  const records = output.split('\0').filter(Boolean).map((line) => {
    const match = line.match(/^[0-7]+\s+blob\s+([0-9a-f]{40})\t(.+)$/u);
    if (!match) throw new Error(`Unexpected git tree entry: ${line}`);
    return { object: match[1], path: match[2] };
  }).filter((entry) => entry.path !== manifestPath).sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
  return {
    trackedPathCount: records.length,
    sourceSetSHA256: sha256(records.map((entry) => `${entry.path}\0${entry.object}\n`).join(''))
  };
}

if (write) {
  const dirty = git('status', '--porcelain');
  if (dirty) throw new Error('Release-lineage generation requires a clean content commit.');
  const commit = git('rev-parse', 'HEAD');
  const tree = git('show', '-s', '--format=%T', commit);
  const commitTime = git('show', '-s', '--format=%cI', commit);
  const snapshot = sourceSet(commit);
  const povPath = 'data/institutional-pov-contract.json';
  const policyPath = 'data/public-release-policy.json';
  const lineage = {
    schemaVersion: '1.0',
    releaseId: `NVM-WEB-${commit.slice(0, 12)}`,
    canonicalCommit: commit,
    canonicalTree: tree,
    canonicalCommitTime: commitTime,
    generatedAt: commitTime,
    povContractId: 'POV-NVM-WEB-2026-08-29',
    artifactMode: 'neutral-editorial',
    authorOrganization: 'NVM Knowledge Hub',
    releaseAuthorization: '使用者已明確授權提交、推送與部署',
    status: 'RELEASED',
    lineageRule: '內容提交後產生本紀錄，綁定確切 Git 提交、檔案樹與治理資料；來源集合雜湊排除本紀錄，避免自我參照。實際上線狀態另以 GitHub Pages 部署結果核對。',
    postCommitManifestRequired: false,
    sourceSnapshot: { ...snapshot, hashContract: 'path<NUL>git-blob-object-id<LF>；UTF-8 路徑依位元組排序；排除 release-lineage.json' },
    governance: {
      povContractPath: povPath,
      povContractSHA256: sha256(gitBytes('show', `${commit}:${povPath}`)),
      publicReleasePolicyPath: policyPath,
      publicReleasePolicySHA256: sha256(gitBytes('show', `${commit}:${policyPath}`))
    }
  };
  fs.writeFileSync(target, `${JSON.stringify(lineage, null, 2)}\n`, 'utf8');
  console.log(`通過：已產生 ${commit.slice(0, 12)} 的發行來源紀錄，共 ${snapshot.trackedPathCount} 個已追蹤路徑。`);
  process.exit(0);
}

const lineage = JSON.parse(fs.readFileSync(target, 'utf8'));
if (lineage.status === 'PREVIEW_UNCOMMITTED') {
  if (lineage.canonicalCommit !== null || lineage.generatedAt !== null || lineage.postCommitManifestRequired !== true) {
    throw new Error('Preview release lineage must remain explicitly uncommitted and require a post-commit manifest.');
  }
  console.log('PASS: release lineage is explicitly PREVIEW_UNCOMMITTED and cannot masquerade as deployed evidence.');
  process.exit(0);
}
if (lineage.status !== 'RELEASED' || !/^[0-9a-f]{40}$/u.test(lineage.canonicalCommit ?? '')) throw new Error('Released lineage lacks a canonical 40-character commit.');
git('cat-file', '-e', `${lineage.canonicalCommit}^{commit}`);
const tree = git('show', '-s', '--format=%T', lineage.canonicalCommit);
if (tree !== lineage.canonicalTree) throw new Error('Release lineage canonical tree does not match its commit.');
const snapshot = sourceSet(lineage.canonicalCommit);
if (snapshot.trackedPathCount !== lineage.sourceSnapshot?.trackedPathCount || snapshot.sourceSetSHA256 !== lineage.sourceSnapshot?.sourceSetSHA256) throw new Error('Release lineage source snapshot hash does not match the canonical commit.');
const currentSnapshot = sourceSet('HEAD');
if (currentSnapshot.sourceSetSHA256 !== snapshot.sourceSetSHA256) throw new Error('目前提交的內容與發行來源紀錄不同。');
for (const [pathKey, hashKey] of [['povContractPath', 'povContractSHA256'], ['publicReleasePolicyPath', 'publicReleasePolicySHA256']]) {
  const sourcePath = lineage.governance?.[pathKey];
  if (!sourcePath || sha256(gitBytes('show', `${lineage.canonicalCommit}:${sourcePath}`)) !== lineage.governance?.[hashKey]) throw new Error(`Release lineage governance hash mismatch for ${sourcePath ?? pathKey}.`);
}
console.log(`通過：發行紀錄綁定 ${lineage.canonicalCommit.slice(0, 12)}、${snapshot.trackedPathCount} 個路徑與治理資料雜湊；目前提交的內容一致。`);
