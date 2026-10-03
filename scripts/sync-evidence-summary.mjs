import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHtml } from './check-site-ia.mjs';

export const evidenceTypes = ['paper', 'patent', 'vendor', 'case'];

// The ledger cards are the source of truth, shared with the site's DOM-based search.
export function countEvidence(source) {
  const cards = parseHtml(source).nodes.filter(node => (node.attributes.class || '').split(/\s+/u).includes('source-card'));
  const counts = Object.fromEntries(evidenceTypes.map(type => [type, 0]));
  const ids = new Set();
  for (const { attributes } of cards) {
    const id = attributes.id;
    const type = attributes['data-type'];
    if (!id?.startsWith('evidence-') || ids.has(id)) throw new Error(`Missing or duplicate evidence ID: ${id}`);
    if (!evidenceTypes.includes(type)) throw new Error(`Unknown evidence type on ${id}: ${type}`);
    ids.add(id);
    counts[type] += 1;
  }
  if (!cards.length) throw new Error('Evidence ledger has no source cards');
  return { total: cards.length, ...counts };
}

export function syncEvidenceSummary(source) {
  const counts = countEvidence(source);
  const seen = new Set();
  const html = source.replace(/(<([a-z][\w:-]*)\b[^>]*\bdata-evidence-count="(total|paper|patent|vendor|case)"[^>]*>)([^<]*)(<\/\2>)/giu,
    (match, opening, tag, type, old, closing) => {
      seen.add(type);
      return `${opening}${counts[type]}${closing}`;
    });
  for (const type of ['total', ...evidenceTypes]) {
    if (!seen.has(type)) throw new Error(`Missing evidence summary marker: ${type}`);
  }
  const initialCount = /(<b\b[^>]*\bid="evidenceCount"[^>]*>)[^<]*(<\/b>)/u;
  if (!initialCount.test(html)) throw new Error('Missing initial filtered evidence count');
  return { html: html.replace(initialCount, `$1${String(counts.total).padStart(2, '0')}$2`), counts };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) throw new Error('Usage: node scripts/sync-evidence-summary.mjs --write|--check');
  const target = fileURLToPath(new URL('../memory-evidence.html', import.meta.url));
  const before = fs.readFileSync(target, 'utf8');
  const { html, counts } = syncEvidenceSummary(before);
  if (args[0] === '--write') fs.writeFileSync(target, html, 'utf8');
  else if (html !== before) throw new Error('Evidence summary is stale. Run node scripts/sync-evidence-summary.mjs --write');
  console.log(`Evidence summary ${args[0]}: ${JSON.stringify(counts)}`);
}
