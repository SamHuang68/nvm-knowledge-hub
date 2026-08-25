import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const jsonPath = path.join(siteDir, "data", "oip-secure-storage-knowledge.json");
const csvPath = path.join(siteDir, "data", "oip-sharepoint-import.csv");
const knowledge = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const required = [
  "recordId", "title", "contentType", "topic", "asset", "attackClass", "lifecyclePhase",
  "claim", "claimStatus", "evidenceClass", "assuranceMaturity", "scope", "applicability",
  "limitation", "openQuestion", "sourceUrl", "sourceOwner", "reviewedDate", "owner",
  "classification", "audience", "presentationRole", "oipRelevance"
];
const evidenceClasses = new Set(["Direct Observation", "Mechanism Evidence", "Vendor Disclosure", "Bounded Inference", "Unknown"]);
const maturityValues = new Set(["Claimed", "Specified", "Tested", "Independently Evaluated", "Certified", "Field-proven"]);

if (!Array.isArray(knowledge.records) || knowledge.records.length !== 8) {
  throw new Error(`Expected exactly 8 governed records; found ${knowledge.records?.length ?? 0}.`);
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

const columns = [
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
  ...knowledge.records.map(record => columns.map(([, field]) => quote(serialized(record[field]))).join(","))
];
const output = `${rows.join("\r\n")}\r\n`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, "utf8") : "";
  if (current.replaceAll("\r\n", "\n") !== output.replaceAll("\r\n", "\n")) {
    throw new Error("SharePoint CSV is stale. Run: node scripts/build-oip-sharepoint.mjs");
  }
  console.log("PASS: 8 unique public records; CSV matches canonical JSON.");
} else {
  fs.writeFileSync(csvPath, output, "utf8");
  console.log("WROTE: data/oip-sharepoint-import.csv from canonical JSON (8 records)." );
}
