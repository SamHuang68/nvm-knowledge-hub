import { nvmIpSpecs } from './nvm_specs.js';
import { profileZh } from './設定檔繁中.js';

export const profileTextFields = ['profile', 'family', 'contract', 'nodeLens', 'updateModel', 'strongestFit', 'boundary', 'evidenceStatus', 'latency', 'busExposure', 'bomCost'];

// 數學代號、標準與產品名稱可沿用；一般敘述必須具備繁中，不得以英文靜默回退。
const sharedTerms = new Set([
  'SRAM PUF + 1T OTP + AES-256', // 技術組合代號。
  'Common Criteria EAL6+ · FIPS 140-3', 'FIPS 140-2 Level 4 · PCI-PTS', // 標準及等級正式名稱。
  '80nm-55nm HV、40nm-28nm eHV、16nm FinFET eHV（TSMC、UMC、VIS、Nexchip）', // 製程節點與代工廠名稱。
]);
export function validateProfileLocales(profiles = nvmIpSpecs, translations = profileZh) {
  const failures = [];
  const requireText = (value, key) => {
    if (typeof value !== 'string' || !value.trim()) failures.push(`${key}：缺少繁中翻譯`);
    else if (!/[\u3400-\u9fff]/u.test(value) && !sharedTerms.has(value)) failures.push(`${key}：一般敘述未提供繁中`);
  };
  for (const profile of profiles) {
    const localized = translations[profile.id];
    const actualFields = Object.keys(profile).filter(field => field !== 'id' && typeof profile[field] === 'string');
    for (const field of actualFields) {
      if (!profileTextFields.includes(field)) failures.push(`${profile.id}.${field}：新增欄位尚未加入語系契約`);
      requireText(localized?.[field], `${profile.id}.${field}`);
    }
    for (const field of profileTextFields) if (!actualFields.includes(field)) failures.push(`${profile.id}.${field}：原稿欄位遺失`);
    requireText(localized?.evidenceReview?.scope, `${profile.id}.evidenceReview.scope`);
    if (localized?.evidenceReview?.sources?.length !== profile.evidenceReview.sources.length) failures.push(`${profile.id}.evidenceReview.sources：來源翻譯數量不符`);
    profile.evidenceReview.sources.forEach((source, index) => {
      for (const field of ['claim', 'limitation']) requireText(localized?.evidenceReview?.sources?.[index]?.[field], `${profile.id}.evidenceReview.sources.${index}.${field}`);
    });
  }
  for (const id of Object.keys(translations)) if (!profiles.some(profile => profile.id === id)) failures.push(`${id}：語系資料沒有對應原稿`);
  if (failures.length) throw new Error(`設定檔語系驗證失敗：\n${failures.join('\n')}`);
  return { profiles: profiles.length, fields: profiles.length * profileTextFields.length };
}

export function localizeProfile(profile, language = 'en') {
  if (language !== 'zh') return profile;
  const localized = profileZh[profile.id];
  if (!localized) throw new Error(`缺少設定檔語系：${profile.id}`);
  return {
    ...profile,
    ...Object.fromEntries(profileTextFields.map(field => [field, localized[field]])),
    evidenceReview: {
      ...profile.evidenceReview,
      scope: localized.evidenceReview.scope,
      sources: profile.evidenceReview.sources.map((source, index) => ({ ...source, ...localized.evidenceReview.sources[index] })),
    },
  };
}

// 所有正式建置與資料使用者均先驗證完整性。
validateProfileLocales();
