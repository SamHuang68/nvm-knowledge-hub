import test from 'node:test';
import assert from 'node:assert/strict';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { localizeProfile } from '../src/data/profile-locale.js';
import { phase1KnowledgeBase } from '../src/data/phase1_kb.js';
import { phase2Whitepaper } from '../src/data/phase2_paper.js';
import { serializeCSV, serializeJSON, renderMatrix } from '../src/js/modules/matrix.js';

test('eFlash draft and both exports retain process-specific limits without universal mask or node guarantees', () => {
  const original = nvmIpSpecs.find(profile => profile.id === 'embedded_flash');
  for (const language of ['en', 'zh']) {
    const profile = localizeProfile(original, language);
    assert.equal(profile.evidenceReview.status, 'source-needed');
    assert.deepEqual(profile.evidenceReview.sources, [], 'no technology-family source is promoted to product qualification');
    const json = JSON.parse(serializeJSON([original], language));
    assert.deepEqual(json, [profile]);
    const csv = serializeCSV([original], language);
    for (const field of ['nodeLens', 'boundary', 'bomCost', 'evidenceStatus']) {
      assert.ok(csv.includes(profile[field].replaceAll('"', '""')));
      assert.doesNotMatch(profile[field], /(?:<=|≤)\s*28|10[-–]15|physically constrained|物理限制/u);
    }
    assert.match(profile.nodeLens, language === 'en' ? /macro-dependent/u : /取決於製程與巨集/u);
    assert.ok(csv.includes(profile.evidenceReview.scope));
  }
  const container = { innerHTML: '', querySelector: () => null };
  renderMatrix(container);
  assert.ok(container.innerHTML.includes(original.bomCost));
  assert.ok(container.innerHTML.includes(original.evidenceReview.scope));
  assert.equal(nvmIpSpecs.length, 13);
});

test('overview and whitepaper chapter carry the same conditional process boundary', () => {
  const chapter = phase2Whitepaper.chapters.find(item => item.id === 'node-boundary');
  const paragraph = chapter.paragraphs.find(text => text.includes('28 nm'));
  assert.match(paragraph, /not a universal physical cutoff/u);
  assert.match(paragraph, /named foundry process and memory macro/u);
  assert.ok(JSON.stringify(phase1KnowledgeBase).includes(paragraph));
  assert.doesNotMatch(paragraph, /commercialization high point|10[-–]15/u);
});
