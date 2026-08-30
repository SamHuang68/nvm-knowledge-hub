import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const jsonPath = path.join(siteDir, "data", "oip-secure-storage-knowledge.json");
const csvPath = path.join(siteDir, "data", "oip-sharepoint-import.csv");
const povPath = path.join(siteDir, "data", "institutional-pov-contract.json");
const knowledge = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const pov = JSON.parse(fs.readFileSync(povPath, "utf8"));
const sha256 = value => crypto.createHash("sha256").update(value, "utf8").digest("hex").toUpperCase();
const canonicalContentSha256 = sha256(fs.readFileSync(jsonPath, "utf8"));

const required = [
  "recordId", "title", "contentType", "topic", "asset", "attackClass", "lifecyclePhase",
  "claim", "claimStatus", "evidenceClass", "assuranceMaturity", "scope", "applicability",
  "limitation", "openQuestion", "sourceUrl", "sourceOwner", "reviewedDate", "owner",
  "classification", "audience", "presentationRole", "oipRelevance"
];
const evidenceClasses = new Set(["Direct Observation", "Mechanism Evidence", "Vendor Disclosure", "Bounded Inference", "Unknown"]);
const maturityValues = new Set(["Claimed", "Specified", "Tested", "Independently Evaluated", "Certified", "Field-proven"]);

if (!Array.isArray(knowledge.records) || knowledge.records.length < 8) {
  throw new Error(`Expected at least 8 governed records; found ${knowledge.records?.length ?? 0}.`);
}

const ids = new Set();
for (const record of knowledge.records) {
  const missing = required.filter(field => record[field] === undefined || record[field] === null || record[field] === "");
  if (missing.length) throw new Error(`${record.recordId || "<missing id>"}: missing ${missing.join(", ")}`);
  if (ids.has(record.recordId)) throw new Error(`Duplicate recordId: ${record.recordId}`);
  ids.add(record.recordId);
  if (!evidenceClasses.has(record.evidenceClass)) throw new Error(`${record.recordId}: invalid evidenceClass`);
  if (!maturityValues.has(record.assuranceMaturity)) throw new Error(`${record.recordId}: invalid assuranceMaturity`);
  if (record.classification !== "Public") throw new Error(`${record.recordId}: public export contains ${record.classification} content`);
  new URL(record.sourceUrl);
}

const governedPages = ["secure-storage.html", "oip-secure-storage.html"];
for (const pageName of governedPages) {
  const html = fs.readFileSync(path.join(siteDir, pageName), "utf8");
  const referenced = [...html.matchAll(/data-record-ids?="([^"]+)"/g)]
    .flatMap(match => match[1].trim().split(/\s+/))
    .filter(Boolean);
  const missing = [...new Set(referenced.filter(recordId => !ids.has(recordId)))];
  if (missing.length) throw new Error(`${pageName}: unknown governed record references: ${missing.join(", ")}`);
}

const secureStorageHtml = fs.readFileSync(path.join(siteDir, "secure-storage.html"), "utf8");
const evidenceNumberBlock = secureStorageHtml.match(/<div class="evidence-numbers">([\s\S]*?)<\/div>/)?.[1] ?? "";
const evidenceNumberArticles = [...evidenceNumberBlock.matchAll(/<article\b([^>]*)>/g)];
if (evidenceNumberArticles.length !== 3 || evidenceNumberArticles.some(([, attrs]) => !/data-record-id="[^"]+"/.test(attrs))) {
  throw new Error("secure-storage.html: each portfolio metric must have its own claim-specific data-record-id.");
}

const columns = [
  ["SchemaVersion", () => knowledge.schemaVersion], ["PackageID", () => "OIP-SECURE-STORAGE-PUBLIC"],
  ["PackageRevision", () => knowledge.reviewedDate], ["CanonicalContentSHA256", () => canonicalContentSha256],
  ["RecordRevision", record => `${record.reviewedDate}-${sha256(JSON.stringify(record)).slice(0, 12)}`], ["RecordSHA256", record => sha256(JSON.stringify(record))],
  ["POVContractID", () => pov.povContractId], ["POVScopeID", () => pov.defaultScopeId],
  ["AuthorOrganization", () => pov.contracts.knowledgeHub.authorOrganization], ["SponsorOrganization", () => pov.contracts.knowledgeHub.sponsorOrganization],
  ["ArtifactMode", () => pov.contracts.knowledgeHub.artifactMode], ["AccountableOwnerPersonKey", () => "sam-huang"],
  ["EditorialPublisherKey", () => "nvm-hub"], ["ReleaseApprover", () => "Sam Huang"],
  ["RecordID", "recordId"], ["Title", "title"], ["ContentType", "contentType"], ["Topic", "topic"],
  ["SecurityAsset", "asset"], ["AttackClass", "attackClass"], ["LifecyclePhase", "lifecyclePhase"],
  ["SecurityClaim", "claim"], ["ClaimStatus", "claimStatus"], ["EvidenceClass", "evidenceClass"],
  ["AssuranceMaturity", "assuranceMaturity"], ["AssuranceScope", "scope"], ["Applicability", "applicability"],
  ["Limitation", "limitation"], ["OpenQuestion", "openQuestion"], ["SourceURL", "sourceUrl"],
  ["SourceOwner", "sourceOwner"], ["PublishedDate", "publishedDate"], ["ReviewedDate", "reviewedDate"],
  ["ContentOwnerKey", "owner"], ["Classification", "classification"], ["Audience", "audience"],
  ["PresentationRole", "presentationRole"], ["OIPRelevance", "oipRelevance"]
];
const quote = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
const serialized = value => Array.isArray(value) ? value.join(";") : value;
const rows = [
  columns.map(([label]) => label).join(","),
  ...knowledge.records.map(record => columns.map(([, accessor]) => quote(serialized(typeof accessor === "function" ? accessor(record) : record[accessor]))).join(","))
];
const output = `${rows.join("\r\n")}\r\n`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, "utf8") : "";
  if (current.replaceAll("\r\n", "\n") !== output.replaceAll("\r\n", "\n")) {
    throw new Error("SharePoint CSV is stale. Run: node scripts/build-oip-sharepoint.mjs");
  }
  console.log(`PASS: ${knowledge.records.length} unique public records; governed page references resolve; CSV matches canonical JSON.`);
} else {
  fs.writeFileSync(csvPath, output, "utf8");
  console.log(`WROTE: data/oip-sharepoint-import.csv from canonical JSON (${knowledge.records.length} records).`);
}
