import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const dataDir = path.join(root, "data");
const failures = [];
const policy = JSON.parse(fs.readFileSync(path.join(dataDir, "public-release-policy.json"), "utf8"));
const pov = JSON.parse(fs.readFileSync(path.join(dataDir, "institutional-pov-contract.json"), "utf8"));
const ai = JSON.parse(fs.readFileSync(path.join(dataDir, "ai-nvm-opportunities-knowledge.json"), "utf8"));

const normalize = value => value.replace(/\s+/gu, " ").trim();
const stripMarkup = value => normalize(value.replace(/<script\b[\s\S]*?<\/script>/giu, " ").replace(/<style\b[\s\S]*?<\/style>/giu, " ").replace(/<[^>]+>/gu, " ").replace(/&[^;]+;/gu, " "));
const hash = value => crypto.createHash("sha256").update(value, "utf8").digest("hex");

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  if ([".git", "node_modules", "qa", ".loop-engineering"].includes(entry.name)) return [];
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

const files = walk(root);
for (const file of files) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const extension = path.extname(file).toLowerCase();
  if (policy.blockedAttachmentExtensions.includes(extension) && !policy.allowedAttachmentExceptions.includes(relative)) {
    failures.push(`blocked public attachment: ${relative}`);
  }
}

const inspectClassification = (value, locator) => {
  if (Array.isArray(value)) return value.forEach((item, index) => inspectClassification(item, `${locator}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "classification" && typeof child === "string" && policy.blockedClassifications.includes(child)) {
      failures.push(`${locator}.${key}: public data contains ${child}`);
    }
    inspectClassification(child, `${locator}.${key}`);
  }
};

for (const file of files.filter(file => file.startsWith(dataDir) && file.endsWith(".json"))) {
  inspectClassification(JSON.parse(fs.readFileSync(file, "utf8")), path.relative(root, file));
}

if (policy.failMode !== "closed") failures.push("public release policy must fail closed");
if (pov.povContractId !== policy.requiredPovContractId) failures.push("POV contract and release policy are not bound");
if (pov.schemaVersion !== "2.0") failures.push("POV contract package must use schemaVersion 2.0");
if (pov.defaultScopeId !== pov.contracts?.knowledgeHub?.contractId) failures.push("POV default scope must resolve to the neutral Hub contract");
const validArtifactModes = new Set(["neutral-editorial", "neutral-comparison", "first-party-paper", "first-party-sales"]);
const contractIds = new Set();
for (const [name, contract] of Object.entries(pov.contracts ?? {})) {
  for (const key of ["contractId", "scope", "authorOrganization", "sponsorOrganization", "artifactMode", "audience", "institutionalStance", "sponsorActorLabel", "allowedSpeakerConstructions", "externalActorLabels", "evidenceTaxonomyLabels", "responsibilityOwners", "closingOwner", "flagPatterns", "allowedContexts", "domBinding"]) {
    if (contract[key] === undefined || contract[key] === "") failures.push(`POV contract ${name} lacks ${key}`);
  }
  if (contractIds.has(contract.contractId)) failures.push(`duplicate POV contract ID: ${contract.contractId}`);
  contractIds.add(contract.contractId);
  if (!validArtifactModes.has(contract.artifactMode)) failures.push(`POV contract ${name} uses unsupported artifact mode ${contract.artifactMode}`);
}
if (pov.sharePointOwnerMapping?.ContentOwnerKey?.type !== "Single line text") failures.push("ContentOwnerKey must remain a text key");
if (pov.sharePointOwnerMapping?.ContentOwnerUPN?.type !== "Person" || pov.sharePointOwnerMapping.ContentOwnerUPN.publicValue !== null) {
  failures.push("ContentOwnerUPN must remain an unresolved corporate Person field in the public package");
}

const htmlFiles = files.filter(file => file.endsWith(".html"));
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const html = fs.readFileSync(file, "utf8");
  const body = html.match(/<body\b[^>]*>/iu)?.[0] ?? "";
  if (!body.includes(`data-pov-contract-id="${pov.povContractId}"`)) failures.push(`${relative}: body lacks POV contract binding`);
  if (!body.includes(`data-pov-scope-id="${pov.defaultScopeId}"`)) failures.push(`${relative}: body lacks neutral POV scope binding`);
  if (!body.includes('data-artifact-mode="neutral-editorial"')) failures.push(`${relative}: undeclared artifact mode`);
  if (!body.includes('data-accountable-owner-key="sam-huang"')) failures.push(`${relative}: accountable owner key missing`);

  for (const match of html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/giu)) {
    const headingAttributes = match[2];
    const headingMarkup = match[3];
    if (/[。.!?！？]\s*(?:<br\b|<\/(?:span|em)>)/iu.test(headingMarkup)) failures.push(`${relative}: split display heading contains sentence punctuation`);
    const localizedRuns = [...headingMarkup.matchAll(/<span\b[^>]*data-lang=["'][^"']+["'][^>]*>([\s\S]*?)<\/span>/giu)];
    const runs = localizedRuns.length ? localizedRuns.map(run => stripMarkup(run[1])) : [stripMarkup(headingMarkup)];
    for (const heading of runs) {
      if (/[。.!?！？]$/u.test(heading)) failures.push(`${relative}: display heading ends with sentence punctuation: ${heading}`);
    }
    for (const localizedAttribute of headingAttributes.matchAll(/\bdata-(?:zh|en)="([^"]+)"/gu)) {
      if (/[。.!?！？]$/u.test(localizedAttribute[1].trim())) failures.push(`${relative}: localized display heading ends with sentence punctuation: ${localizedAttribute[1]}`);
    }
  }
}

const publicSource = files
  .filter(file => [".html", ".js", ".json", ".csv", ".md"].includes(path.extname(file).toLowerCase()))
  .map(file => fs.readFileSync(file, "utf8"))
  .join("\n");

for (const sourceFile of files.filter(file => [".js", ".mjs"].includes(path.extname(file).toLowerCase()))) {
  const relative = path.relative(root, sourceFile).replaceAll("\\", "/");
  const sourceText = fs.readFileSync(sourceFile, "utf8");
  for (const match of sourceText.matchAll(/\btitle\s*:\s*(?:localized|L)\(\s*"([^"]*)"\s*,\s*"([^"]*)"/gu)) {
    for (const runtimeTitle of match.slice(1)) {
      if (/[。.!?！？]$/u.test(runtimeTitle.trim())) failures.push(`${relative}: runtime display title ends with sentence punctuation: ${runtimeTitle}`);
    }
  }
  for (const match of sourceText.matchAll(/\b(?:zh|en)\s*:\s*\[\s*"[^"]*"\s*,\s*"([^"]*)"/gu)) {
    if (/[。.!?！？]$/u.test(match[1].trim())) failures.push(`${relative}: runtime display heading ends with sentence punctuation: ${match[1]}`);
  }
}
for (const [label, pattern] of [
  ["absolute power-off key claim", /(?:ROOT:\s*ABSENT|No root key is present\.|Root key 不存在。|root key is absent at power-off|斷電時 root key 不存在)/iu],
  ["unconditional protected-data result", /PROTECTED DATA ONLY/u],
  ["incorrect disappearance of startup physics", /SRAM startup state 與衍生根金鑰皆不存在/u],
  ["unsupported 28nm commercialization label", /PUBLIC VOLUME PLATEAU|28nm is a public volume plateau/u],
  ["overstated BMC deployment wording", /BMC-integrated silicon deploys OTP and PUF|OTP\/PUF deployment proven|部署已確證|PUF Is Productized|PUF 已產品化/u],
  ["unconditional protected-data result", /Protected data only|CIPHERTEXT ONLY/u],
  ["unbounded reconstructed-root state", /SRAM PUF ROOT[\s\S]{0,80}NOT PRESENT|Root key 不存在|root 不存在/u]
]) {
  if (pattern.test(publicSource)) failures.push(label);
}

const source = ai.sourceDocument ?? {};
for (const field of ["publicationStatus", "officialListingUrl", "documentUrl", "contributor", "custodian", "authorityScope"]) {
  if (!source[field]) failures.push(`sourceDocument.${field} is required`);
}
if (!/not an adopted OCP specification/iu.test(source.publicationStatus ?? "")) failures.push("OCP contribution status is not bounded");
for (const record of ai.records.filter(record => /^AI-NVM-OCP-00[1-4]$/u.test(record.recordId))) {
  if (record.evidenceClass === "DIRECT_REQUIREMENT" || record.claimStatus === "Public Requirement") failures.push(`${record.recordId}: workgroup contribution is mislabeled as a requirement`);
  if (!record.sourceUrl || !/drive\.google\.com/u.test(record.sourceUrl)) failures.push(`${record.recordId}: official document locator missing`);
  if (!/Lightmatter/iu.test(record.sourceOwner)) failures.push(`${record.recordId}: contributor attribution missing`);
}

const aiHtml = fs.readFileSync(path.join(root, "ai-nvm-opportunities.html"), "utf8");
const aiJs = fs.readFileSync(path.join(root, "ai-nvm.js"), "utf8");
const opportunityCards = [...aiHtml.matchAll(/<article\b[^>]*class="[^"]*opportunity-record[^"]*"[^>]*>/giu)].map(match => match[0]);
if (opportunityCards.length !== 12) failures.push(`expected 12 governed opportunity cards; found ${opportunityCards.length}`);
for (const [index, card] of opportunityCards.entries()) {
  if (!/data-fit-record-ids="[^"]+"/u.test(card)) failures.push(`opportunity card ${index + 1}: candidate-fit lineage is missing`);
  if (!/data-copy-revision="AI-OPPORTUNITY-VIEW-R24"/u.test(card)) failures.push(`opportunity card ${index + 1}: copy revision is missing`);
}
for (const label of ["SOURCE ESTABLISHES", "CANDIDATE NVM FIT", "DESIGN CONSEQUENCE / BOUNDED INFERENCE", "OPEN IMPLEMENTATION QUESTION"]) {
  if (!aiJs.includes(label)) failures.push(`canonical opportunity renderer lacks ${label}`);
}
const ddr5Pmic = ai.records.find(record => record.recordId === "AI-NVM-DDR5-001");
const ddr5Spd = ai.records.find(record => record.recordId === "AI-NVM-DDR5-002");
const spdCandidateBasis = new Map((ddr5Spd?.storageCandidateProvenance ?? []).map(item => [item.candidate, item.basis]));
if (!ddr5Pmic?.storageCandidate?.includes("MTP / Managed NVM") || ddr5Pmic.isInference) failures.push("DDR5 PMIC MTP source requirement regressed");
if (spdCandidateBasis.get("EEPROM / Managed NVM") !== "SOURCE_DEFINED_FUNCTION") failures.push("SPD Hub EEPROM function lacks source-defined provenance");
if (spdCandidateBasis.get("MTP / Managed NVM") !== "BOUNDED_IMPLEMENTATION_CANDIDATE") failures.push("SPD Hub MTP is not bounded as an implementation candidate");
if (/direct MTP\/EEPROM-class socket|SOURCE-DISCLOSED FIT[^\n]*MTP \/ Managed NVM/iu.test(`${aiHtml}\n${aiJs}`)) failures.push("SPD Hub MTP is overstated as JEDEC-disclosed physical technology");
if (!aiJs.includes('fetch("data/ai-nvm-opportunities-knowledge.json"')) failures.push("opportunity renderer is not bound to canonical JSON");
if (!aiJs.includes('page.dataset.knowledgeState = "error"') || !aiJs.includes("record.hidden = true")) failures.push("opportunity renderer does not fail closed when canonical JSON is unavailable");
for (const csvName of ["ai-nvm-sharepoint-import.csv", "oip-sharepoint-import.csv"]) {
  const header = fs.readFileSync(path.join(dataDir, csvName), "utf8").split(/\r?\n/u, 1)[0];
  for (const forbiddenColumn of ["CanonicalCommit", "GeneratedAt", "ContentOwnerUPN"]) {
    if (header.split(",").includes(forbiddenColumn)) failures.push(`${csvName}: source-controlled export must omit ${forbiddenColumn}`);
  }
  for (const requiredColumn of ["PackageRevision", "CanonicalContentSHA256", "RecordRevision", "RecordSHA256", "POVScopeID", "AccountableOwnerPersonKey", "EditorialPublisherKey"]) {
    if (!header.split(",").includes(requiredColumn)) failures.push(`${csvName}: missing deterministic lineage column ${requiredColumn}`);
  }
}
if (!aiHtml.includes("OCP-LISTED LIGHTMATTER CONTRIBUTION · NOT AN ADOPTED OCP SPECIFICATION")) failures.push("OCP authority label is not bounded to an OCP-listed Lightmatter contribution");
for (const note of pov.ownerProvidedPublicNotes ?? []) {
  if (!aiHtml.includes(`data-note-id="${note.noteId}"`)) failures.push(`${note.noteId}: DOM note binding missing`);
  if (!aiHtml.includes(`data-pov-scope-id="${note.povScopeId}"`)) failures.push(`${note.noteId}: scoped POV binding missing`);
  if (!aiHtml.includes(note.label)) failures.push(`${note.noteId}: visible owner-note label missing`);
}
if ((aiHtml.match(/data-source-role="owner-provided"/gu) ?? []).length !== 2) failures.push("expected exactly two owner-provided public notes");
if ((aiHtml.match(/data-release-approval="user-authorized-2026-08-29"/gu) ?? []).length !== 2) failures.push("owner-provided notes lack release approval bindings");
if (!aiHtml.includes("PUBLISHED IMPLEMENTATION EXAMPLE")) failures.push("28nm evidence wording is not bounded to an implementation example");
const lifecycleSource = ["secure-storage.html", "app.js", "assurance.js", "security-assurance.html"]
  .map(name => fs.readFileSync(path.join(root, name), "utf8"))
  .join("\n");
for (const requiredBoundary of ["validated shutdown", "helper data", "device mismatch", "remanence", "zeroization", "composed controls hold", "NOT POWERED"]) {
  if (!lifecycleSource.toLowerCase().includes(requiredBoundary.toLowerCase())) failures.push(`secure-storage lifecycle boundary is missing ${requiredBoundary}`);
}

if (failures.length) {
  console.error("Release gate failed:\n" + failures.map(item => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`PASS: public release is fail-closed; ${htmlFiles.length} HTML surfaces bind ${pov.povContractId}; OCP contribution authority, owner notes, heading grammar and claim boundaries pass. Policy SHA-256 ${hash(JSON.stringify(policy)).slice(0, 16)}.`);
