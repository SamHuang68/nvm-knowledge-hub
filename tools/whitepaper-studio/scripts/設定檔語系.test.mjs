import test from 'node:test';
import assert from 'node:assert/strict';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { profileZh } from '../src/data/設定檔繁中.js';
import { profileTextFields, validateProfileLocales, localizeProfile } from '../src/data/設定檔語系.js';
import { serializeCSV, serializeJSON, selectProfiles, renderMatrix } from '../src/js/modules/matrix.js';

test('12 筆設定檔全部 132 個文字欄位與證據限制具備繁中', () => {
  assert.deepEqual(validateProfileLocales(), { profiles: 12, fields: 132 });
  for (const original of nvmIpSpecs) {
    const localized = localizeProfile(original, 'zh');
    for (const field of profileTextFields) assert.equal(localized[field], profileZh[original.id][field]);
    assert.equal(localized.id, original.id);
    assert.equal(localized.evidenceReview.status, original.evidenceReview.status);
    localized.evidenceReview.sources.forEach((source, index) => {
      assert.equal(source.url, original.evidenceReview.sources[index].url);
      assert.deepEqual(source.fields, original.evidenceReview.sources[index].fields);
      assert.equal(source.checkedAt, original.evidenceReview.sources[index].checkedAt);
    });
    assert.deepEqual(localizeProfile(original, 'en'), original);
  }
});

test('缺欄位、英文回退、新增資料與遺失證據限制均拒絕通過', () => {
  const missing = structuredClone(profileZh);
  delete missing.hv_display_ddic_demura.updateModel;
  assert.throws(() => validateProfileLocales(nvmIpSpecs, missing), /hv_display_ddic_demura\.updateModel/);
  const english = structuredClone(profileZh);
  english.eink_ultra_hv_mtp_otp.busExposure = nvmIpSpecs.at(-1).busExposure;
  assert.throws(() => validateProfileLocales(nvmIpSpecs, english), /一般敘述未提供繁中/);
  const absentSource = structuredClone(profileZh);
  delete absentSource.bcd_power_pmic_trim.evidenceReview.sources[0].limitation;
  assert.throws(() => validateProfileLocales(nvmIpSpecs, absentSource), /limitation/);
  assert.throws(() => validateProfileLocales([...nvmIpSpecs, { ...nvmIpSpecs[0], id: 'new_profile' }]), /new_profile/);
  assert.throws(() => validateProfileLocales(nvmIpSpecs.map((profile, index) => index ? profile : { ...profile, newField: 'Untranslated field' })), /尚未加入語系契約/);
});

test('兩語系完整與篩選匯出使用相同資料，並保留可追溯識別碼', () => {
  for (const language of ['zh', 'en']) {
    for (const family of ['ALL', ...new Set(nvmIpSpecs.map(item => item.family))]) {
      const originals = selectProfiles(family);
      const expected = originals.map(profile => localizeProfile(profile, language));
      assert.deepEqual(JSON.parse(serializeJSON(originals, language)), expected);
      const csv = serializeCSV(originals, language);
      for (const profile of expected) {
        for (const field of profileTextFields) assert.ok(csv.includes(profile[field].replace(/"/g, '""')), `${profile.id}.${field}`);
        assert.ok(csv.includes(profile.evidenceReview.scope));
      }
      assert.ok(csv.startsWith(language === 'zh' ? '\uFEFF識別碼,' : '\uFEFFID,'));
    }
  }
});

test('畫面雙語欄位以 HTML 文字安全輸出，保留小於符號與完整數值', () => {
  const container = { innerHTML: '', querySelector: () => null };
  renderMatrix(container);
  assert.ok(container.innerHTML.includes('OTP (&lt;250µm height)'));
  assert.ok(container.innerHTML.includes('總晶粒面積 &lt;0.5%'));
  for (const profile of nvmIpSpecs) assert.ok(container.innerHTML.includes(`data-profile-id="${profile.id}"`));
});
