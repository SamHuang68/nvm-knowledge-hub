import test from 'node:test';
import assert from 'node:assert/strict';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { selectProfiles, serializeCSV, renderMatrix } from '../src/js/modules/matrix.js';
import { inspectProfile, inspectVisibleContent } from './check-public.mjs';

test('12 筆紀錄保留唯一識別，篩選結果保留相同資料', () => {
  assert.equal(nvmIpSpecs.length, 12);
  assert.equal(new Set(nvmIpSpecs.map(item => item.id)).size, 12);
  for (const family of new Set(nvmIpSpecs.map(item => item.family))) {
    assert.deepEqual(selectProfiles(family), nvmIpSpecs.filter(item => item.family === family));
  }
  assert.deepEqual(selectProfiles('不存在的家族'), []);
});

test('CSV 保留 Unicode、引號、換行、逗號與井字，並中和試算表公式', () => {
  const original = { ...nvmIpSpecs[0], profile: '=HYPERLINK("https://example.org/#片段", "測試")', family: '  +SUM(1,2)', contract: '中文,"引號"\n換行#保留' };
  const csv = serializeCSV([original]);
  assert.ok(csv.startsWith('\uFEFFID,'));
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.org/#片段"", ""測試"")"'));
  assert.ok(csv.includes('"\'  +SUM(1,2)"'));
  assert.ok(csv.includes('"中文,""引號""\n換行#保留"'));
  assert.equal(original.profile[0], '=');
});

test('已知 NeoMTP 必須對應來源與欄位；捏造產品與缺少限制仍然失敗', () => {
  const profile = nvmIpSpecs.find(item => item.id === 'bcd_power_pmic_trim');
  assert.deepEqual(inspectProfile(profile), []);
  assert.ok(inspectProfile({ ...profile, evidenceReview: { ...profile.evidenceReview, sources: [] } }).length);
  assert.ok(inspectProfile({ ...profile, family: 'NeoOTP' }).length);
  assert.ok(inspectProfile({ ...profile, evidenceReview: { ...profile.evidenceReview, scope: '' } }).length);
});

test('URL、版本參數與程式內容不誤判為公開產品聲稱', () => {
  assert.deepEqual(inspectVisibleContent('<script src="x.js?v=NeoMTP">const fake="NeoOTP";</script><a href="https://example.org/NeoMTP">參考連結</a>'), []);
  assert.ok(inspectVisibleContent('<p>NeoOTP silicon-proven</p>').length);
});

test('畫面呈現所有原稿聲稱與證據範圍，沒有隱藏紀錄', () => {
  const container = { innerHTML: '', querySelector: () => null };
  renderMatrix(container);
  for (const profile of nvmIpSpecs) {
    assert.ok(container.innerHTML.includes(`data-profile-id="${profile.id}"`));
    assert.ok(container.innerHTML.includes(profile.evidenceStatus));
    assert.ok(container.innerHTML.includes(profile.evidenceReview.scope));
  }
});
