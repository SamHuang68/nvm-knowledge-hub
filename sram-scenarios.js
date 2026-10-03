import { MODEL_VERSION, UNITS, estimate } from './sram-repair-model.js';

export const SCENARIO_FORMAT = 'nvm-hub-sram-scenarios';
export const SCHEMA_VERSION = 1;
export const MAX_FILE_BYTES = 65536;
export const STORAGE_KEY = 'nvm-hub:sram-scenarios:v1';
export const SLOT_IDS = ['A', 'B'];
const inputKeys = ['capacity', 'unit', 'repair', 'compression', 'mode', 'otp', 'efuse'];
const allocationKeys = ['overhead', 'reserve', 'block'];
export class ScenarioError extends Error {
  constructor(code, field = '') { super(code); this.name = 'ScenarioError'; this.code = code; this.field = field; }
}
const fail = (code, field) => { throw new ScenarioError(code, field); };
function record(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('structure');
  const own = Object.keys(value);
  if (own.length !== keys.length || own.some(key => !keys.includes(key))) fail('structure');
}
function inputText(value, field) {
  if (typeof value !== 'string' || value.length > 80) fail('inputs', field);
  return value;
}
export function validateInputs(value) {
  record(value, inputKeys);
  const result = {};
  for (const key of inputKeys.slice(0, 5)) result[key] = inputText(value[key], key);
  if (!Object.hasOwn(UNITS, result.unit) || !['ratio', 'retained', 'reduction'].includes(result.mode)) fail('inputs');
  for (const tech of ['otp', 'efuse']) {
    record(value[tech], allocationKeys);
    result[tech] = {};
    for (const key of allocationKeys) result[tech][key] = inputText(value[tech][key], `${tech}-${key}`);
  }
  try { estimate(result); } catch (error) { fail('inputs', error.field); }
  return result;
}
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail('structure');
  return value;
}
export function validateSource(value) {
  if (value === null) return null;
  record(value, ['releaseId', 'canonicalCommit']);
  if (typeof value.releaseId !== 'string' || !/^NVM-WEB-[a-f0-9]{12}$/.test(value.releaseId)
    || typeof value.canonicalCommit !== 'string' || !/^[a-f0-9]{40}$/.test(value.canonicalCommit)
    || value.releaseId !== `NVM-WEB-${value.canonicalCommit.slice(0, 12)}`) fail('source');
  return { releaseId: value.releaseId, canonicalCommit: value.canonicalCommit };
}
export function createSnapshot(inputs, source = null, savedAt = new Date().toISOString()) {
  return { inputs: validateInputs(inputs), savedAt: isoDate(savedAt), source: validateSource(source) };
}
function validateSnapshot(value) {
  record(value, ['inputs', 'savedAt', 'source']);
  return createSnapshot(value.inputs, value.source, value.savedAt);
}
export function createScenarioFile(scenarios, exportedAt = new Date().toISOString()) {
  return validateScenarioFile({ format: SCENARIO_FORMAT, schemaVersion: SCHEMA_VERSION, modelVersion: MODEL_VERSION, exportedAt, scenarios });
}
export function validateScenarioFile(value) {
  record(value, ['format', 'schemaVersion', 'modelVersion', 'exportedAt', 'scenarios']);
  if (value.format !== SCENARIO_FORMAT) fail('format');
  if (value.schemaVersion !== SCHEMA_VERSION) fail('schema');
  if (value.modelVersion !== MODEL_VERSION) fail('model');
  record(value.scenarios, SLOT_IDS);
  const scenarios = {};
  for (const id of SLOT_IDS) scenarios[id] = value.scenarios[id] === null ? null : validateSnapshot(value.scenarios[id]);
  if (!SLOT_IDS.some(id => scenarios[id])) fail('empty');
  return { format: SCENARIO_FORMAT, schemaVersion: SCHEMA_VERSION, modelVersion: MODEL_VERSION, exportedAt: isoDate(value.exportedAt), scenarios };
}
export function parseScenarioFile(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_FILE_BYTES) fail('size');
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { fail('json'); }
  return validateScenarioFile(data);
}
