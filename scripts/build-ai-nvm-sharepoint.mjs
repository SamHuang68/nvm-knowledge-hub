import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const schemaPath = path.join(siteDir, "data", "ai-nvm-opportunities-schema.json");
const jsonPath = path.join(siteDir, "data", "ai-nvm-opportunities-knowledge.json");
const csvPath = path.join(siteDir, "data", "ai-nvm-sharepoint-import.csv");
const researchCsvPath = path.join(siteDir, "data", "ai-nvm-research-intake.csv");

const args = new Set(process.argv.slice(2));
const supportedArgs = new Set(["--check"]);
const unknownArgs = [...args].filter(arg => !supportedArgs.has(arg));
if (unknownArgs.length) {
  throw new Error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const knowledge = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const expectedIds = [
  "AI-NVM-OCP-001",
  "AI-NVM-OCP-002",
  "AI-NVM-OCP-003",
  "AI-NVM-OCP-004",
  "AI-NVM-RAS-001",
  "AI-NVM-OIF-001",
  "AI-NVM-SPDM-001",
  "AI-NVM-CXL-001",
  "AI-NVM-GPU-001",
  "AI-NVM-GPU-002",
  "AI-NVM-GPU-003",
  "AI-NVM-BISR-001",
  "AI-NVM-EFUSE-001",
  "AI-NVM-DRAM-001",
  "AI-NVM-DRAM-002",
  "AI-NVM-HBM-001",
  "AI-NVM-PMIC-001",
  "AI-NVM-PMIC-002",
  "AI-NVM-UCIe-001",
  "AI-NVM-VENDOR-001",
  "AI-NVM-VENDOR-002",
  "AI-NVM-INF-001",
  "AI-NVM-INF-002",
  "AI-NVM-INF-003",
  "AI-NVM-INF-004",
  "AI-NVM-ADV-001",
  "AI-NVM-ADV-002",
  "AI-NVM-ADV-003",
  "AI-NVM-ADV-004",
  "AI-NVM-ADV-005",
  "AI-NVM-ADV-006",
  "AI-NVM-ADV-007",
  "AI-NVM-DDR5-001",
  "AI-NVM-DDR5-002",
  "AI-NVM-BMC-001",
  "AI-NVM-BMC-002"
];

const expectedEvidenceClasses = new Map([
  ["AI-NVM-OCP-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-OCP-002", "DIRECT_REQUIREMENT"],
  ["AI-NVM-OCP-003", "DIRECT_REQUIREMENT"],
  ["AI-NVM-OCP-004", "DIRECT_REQUIREMENT"],
  ["AI-NVM-RAS-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-OIF-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-SPDM-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-CXL-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-GPU-001", "FIRST_PARTY_CASE"],
  ["AI-NVM-GPU-002", "FIRST_PARTY_CASE"],
  ["AI-NVM-GPU-003", "FIRST_PARTY_CASE"],
  ["AI-NVM-BISR-001", "FIRST_PARTY_CASE"],
  ["AI-NVM-EFUSE-001", "TECHNICAL_EVIDENCE"],
  ["AI-NVM-DRAM-001", "TECHNICAL_EVIDENCE"],
  ["AI-NVM-DRAM-002", "TECHNICAL_EVIDENCE"],
  ["AI-NVM-HBM-001", "FIRST_PARTY_CASE"],
  ["AI-NVM-PMIC-001", "FIRST_PARTY_CASE"],
  ["AI-NVM-PMIC-002", "FIRST_PARTY_CASE"],
  ["AI-NVM-UCIe-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-VENDOR-001", "VENDOR_CAPABILITY"],
  ["AI-NVM-VENDOR-002", "VENDOR_CAPABILITY"],
  ["AI-NVM-INF-001", "INFERRED_OPPORTUNITY"],
  ["AI-NVM-INF-002", "INFERRED_OPPORTUNITY"],
  ["AI-NVM-INF-003", "VALIDATION_NEEDED"],
  ["AI-NVM-INF-004", "INFERRED_OPPORTUNITY"],
  ["AI-NVM-ADV-001", "VENDOR_CAPABILITY"],
  ["AI-NVM-ADV-002", "VENDOR_CAPABILITY"],
  ["AI-NVM-ADV-003", "FIRST_PARTY_CASE"],
  ["AI-NVM-ADV-004", "VENDOR_CAPABILITY"],
  ["AI-NVM-ADV-005", "VENDOR_CAPABILITY"],
  ["AI-NVM-ADV-006", "INFERRED_OPPORTUNITY"],
  ["AI-NVM-ADV-007", "VALIDATION_NEEDED"],
  ["AI-NVM-DDR5-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-DDR5-002", "DIRECT_REQUIREMENT"],
  ["AI-NVM-BMC-001", "DIRECT_REQUIREMENT"],
  ["AI-NVM-BMC-002", "FIRST_PARTY_CASE"]
]);

const expectedPdfLocators = new Map([
  ["AI-NVM-OCP-001", "PDF p75"],
  ["AI-NVM-OCP-002", "PDF p188"],
  ["AI-NVM-OCP-003", "PDF pp199-200, 213, 216"],
  ["AI-NVM-OCP-004", "PDF p236"]
]);

const expectedResearchInput = {
  inputId: "AI-NVM-INPUT-NBLM-001",
  sha256: "897284470142A69DCB1E4F849A534D12C5C6494C5325FBA38B1D1D54F81EF41A",
  pageCount: 13,
  hypothesisIds: [
    "AI-NVM-HYP-NBLM-001",
    "AI-NVM-HYP-NBLM-002",
    "AI-NVM-HYP-NBLM-003",
    "AI-NVM-HYP-NBLM-004",
    "AI-NVM-HYP-NBLM-005"
  ]
};

const packageRequired = schema.required ?? [];
for (const field of packageRequired) {
  if (!(field in knowledge)) throw new Error(`Knowledge package: missing ${field}`);
}
if (knowledge.schemaVersion !== schema.properties.schemaVersion.const) {
  throw new Error(`Knowledge package: schemaVersion must be ${schema.properties.schemaVersion.const}`);
}
if (knowledge.packageId !== schema.properties.packageId.const) {
  throw new Error(`Knowledge package: packageId must be ${schema.properties.packageId.const}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(knowledge.researchFreeze)) {
  throw new Error("Knowledge package: researchFreeze must use YYYY-MM-DD.");
}
if (!/^[A-F0-9]{64}$/.test(knowledge.sourceDocument?.sha256 ?? "")) {
  throw new Error("Knowledge package: sourceDocument.sha256 must be 64 uppercase hex characters.");
}
if (!Array.isArray(knowledge.researchInputs) || knowledge.researchInputs.length !== 1) {
  throw new Error("Knowledge package: expected exactly one governed supplemental research input.");
}
const [researchInput] = knowledge.researchInputs;
if (researchInput.inputId !== expectedResearchInput.inputId) {
  throw new Error(`Research input identity drift: expected ${expectedResearchInput.inputId}.`);
}
if (researchInput.sha256 !== expectedResearchInput.sha256 || researchInput.pageCount !== expectedResearchInput.pageCount) {
  throw new Error(`${researchInput.inputId}: source hash or page count does not match the inspected PDF.`);
}
if (
  researchInput.status !== "UNVERIFIED_SYNTHESIS" ||
  researchInput.classification !== "Public" ||
  researchInput.citationStatus !== "PRIMARY_SOURCES_NOT_DISCLOSED" ||
  researchInput.publicationStatus !== "RESEARCH_INTAKE_ONLY" ||
  researchInput.canonicalRecordEligible !== false
) {
  throw new Error(`${researchInput.inputId}: must remain a non-canonical RESEARCH_INTAKE_ONLY synthesis with undisclosed primary sources.`);
}
if (!Array.isArray(researchInput.hypotheses) || researchInput.hypotheses.length !== expectedResearchInput.hypothesisIds.length) {
  throw new Error(`${researchInput.inputId}: expected ${expectedResearchInput.hypothesisIds.length} governed hypotheses.`);
}
for (const [index, hypothesis] of researchInput.hypotheses.entries()) {
  const expectedId = expectedResearchInput.hypothesisIds[index];
  if (hypothesis.hypothesisId !== expectedId) {
    throw new Error(`Research hypothesis order/identity drift at row ${index + 1}: expected ${expectedId}.`);
  }
  if (
    hypothesis.status !== "VALIDATION_NEEDED" ||
    hypothesis.evidenceClass !== "VALIDATION_NEEDED" ||
    hypothesis.assuranceMaturity !== "Open" ||
    hypothesis.isInference !== true ||
    hypothesis.canonicalRecordEligible !== false ||
    hypothesis.proofModeEligible !== false
  ) {
    throw new Error(`${hypothesis.hypothesisId}: must remain an open, non-canonical inference excluded from Proof mode.`);
  }
  for (const field of ["titleEn", "statementEn", "excludedClaimEn", "validationNeededEn"]) {
    if (typeof hypothesis[field] !== "string" || !hypothesis[field].trim() || /[\u3400-\u9FFF]/u.test(hypothesis[field])) {
      throw new Error(`${hypothesis.hypothesisId}: ${field} must be non-empty English text.`);
    }
  }
  for (const field of ["titleZh", "statementZh", "excludedClaimZh", "validationNeededZh"]) {
    if (typeof hypothesis[field] !== "string" || !/[\u3400-\u9FFF]/u.test(hypothesis[field])) {
      throw new Error(`${hypothesis.hypothesisId}: ${field} must contain Traditional Chinese text.`);
    }
  }
  if (!Array.isArray(hypothesis.relatedRecordIds) || hypothesis.relatedRecordIds.some(id => !expectedIds.includes(id))) {
    throw new Error(`${hypothesis.hypothesisId}: relatedRecordIds must reference governed evidence records.`);
  }
}
if (!Array.isArray(knowledge.records) || knowledge.records.length !== expectedIds.length) {
  throw new Error(`Expected exactly ${expectedIds.length} governed records; found ${knowledge.records?.length ?? 0}.`);
}

const recordSchema = schema.$defs?.record;
if (!recordSchema || !Array.isArray(recordSchema.required)) {
  throw new Error("Schema: missing $defs.record.required.");
}
const recordProperties = recordSchema.properties ?? {};
const englishFields = [
  "titleEn",
  "claimEn",
  "applicabilityEn",
  "limitationEn",
  "openQuestionEn",
  "oipRelevanceEn",
  "evidenceBoundaryEn"
];
const chineseFields = [
  "titleZh",
  "claimZh",
  "applicabilityZh",
  "limitationZh",
  "openQuestionZh",
  "oipRelevanceZh",
  "evidenceBoundaryZh"
];
const cjkPattern = /[\u3400-\u9FFF]/u;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const selfCitationHosts = new Set(["samhuang68.github.io", "localhost", "127.0.0.1"]);

const validateEnum = (record, field, spec) => {
  if (spec?.enum && !spec.enum.includes(record[field])) {
    throw new Error(`${record.recordId}: invalid ${field}: ${record[field]}`);
  }
};

const ids = new Set();
for (const [index, record] of knowledge.records.entries()) {
  const expectedId = expectedIds[index];
  if (record.recordId !== expectedId) {
    throw new Error(`Record order/identity drift at row ${index + 1}: expected ${expectedId}, found ${record.recordId ?? "<missing>"}.`);
  }
  if (ids.has(record.recordId)) throw new Error(`Duplicate recordId: ${record.recordId}`);
  ids.add(record.recordId);

  for (const field of recordSchema.required) {
    if (!(field in record)) throw new Error(`${record.recordId}: missing ${field}`);
    if (record[field] === "") throw new Error(`${record.recordId}: empty ${field}`);
  }

  for (const [field, spec] of Object.entries(recordProperties)) {
    if (!(field in record)) continue;
    validateEnum(record, field, spec);
    if (spec?.const !== undefined && record[field] !== spec.const) {
      throw new Error(`${record.recordId}: ${field} must equal ${spec.const}`);
    }
    if (spec?.type === "array") {
      if (!Array.isArray(record[field])) throw new Error(`${record.recordId}: ${field} must be an array.`);
      if (spec.minItems && record[field].length < spec.minItems) {
        throw new Error(`${record.recordId}: ${field} requires at least ${spec.minItems} value(s).`);
      }
      if (new Set(record[field]).size !== record[field].length) {
        throw new Error(`${record.recordId}: ${field} contains duplicate values.`);
      }
      if (spec.items?.enum) {
        const invalid = record[field].filter(value => !spec.items.enum.includes(value));
        if (invalid.length) throw new Error(`${record.recordId}: invalid ${field}: ${invalid.join(", ")}`);
      }
    }
  }

  for (const field of englishFields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      throw new Error(`${record.recordId}: ${field} must be non-empty English text.`);
    }
    if (cjkPattern.test(record[field])) {
      throw new Error(`${record.recordId}: ${field} contains unintended CJK text.`);
    }
  }
  for (const field of chineseFields) {
    if (typeof record[field] !== "string" || !cjkPattern.test(record[field])) {
      throw new Error(`${record.recordId}: ${field} must contain Traditional Chinese text.`);
    }
  }

  const expectedEvidenceClass = expectedEvidenceClasses.get(record.recordId);
  if (record.evidenceClass !== expectedEvidenceClass) {
    throw new Error(`${record.recordId}: expected evidenceClass ${expectedEvidenceClass}, found ${record.evidenceClass}.`);
  }
  const expectedInference = ["INFERRED_OPPORTUNITY", "VALIDATION_NEEDED"].includes(record.evidenceClass);
  if (record.isInference !== expectedInference) {
    throw new Error(`${record.recordId}: isInference must be ${expectedInference}.`);
  }
  if (record.proofModeEligible === expectedInference) {
    throw new Error(`${record.recordId}: proofModeEligible must be ${!expectedInference}.`);
  }
  if (record.classification !== "Public") {
    throw new Error(`${record.recordId}: public export contains ${record.classification} content.`);
  }
  if (!isoDatePattern.test(record.reviewedDate)) {
    throw new Error(`${record.recordId}: reviewedDate must use YYYY-MM-DD.`);
  }
  if (record.publishedDate !== null && !isoDatePattern.test(record.publishedDate)) {
    throw new Error(`${record.recordId}: publishedDate must be null or YYYY-MM-DD.`);
  }
  let parsedSourceUrl = null;
  if (record.sourceUrl !== null) {
    parsedSourceUrl = new URL(record.sourceUrl);
    if (parsedSourceUrl.protocol !== "https:") throw new Error(`${record.recordId}: sourceUrl must use HTTPS.`);
  }
  if (record.proofModeEligible) {
    const exactSuppliedDocumentLocator = expectedPdfLocators.has(record.recordId);
    if (!parsedSourceUrl && !exactSuppliedDocumentLocator) {
      throw new Error(`${record.recordId}: Proof mode requires an external HTTPS source or an exact governed supplied-document locator.`);
    }
    if (parsedSourceUrl && selfCitationHosts.has(parsedSourceUrl.hostname.toLowerCase())) {
      throw new Error(`${record.recordId}: Proof mode cannot use the Knowledge Hub itself as evidence.`);
    }
    if (/NVM Knowledge Hub/iu.test(record.sourceOwner)) {
      throw new Error(`${record.recordId}: Proof mode sourceOwner must be independent of the Knowledge Hub.`);
    }
  }
  if (record.storageCandidate.includes("Not Specified") && record.storageCandidate.length !== 1) {
    throw new Error(`${record.recordId}: Not Specified cannot be combined with another storage candidate.`);
  }

  const requiredLocator = expectedPdfLocators.get(record.recordId);
  if (requiredLocator && record.sourceLocator !== requiredLocator) {
    throw new Error(`${record.recordId}: SourceLocator must remain exactly "${requiredLocator}".`);
  }
}

const columns = [
  ["RecordID", "recordId"],
  ["Title", "titleEn"],
  ["ContentType", "contentType"],
  ["Topic", "topic"],
  ["SecurityAsset", "asset"],
  ["AttackClass", "attackClass"],
  ["LifecyclePhase", "lifecyclePhase"],
  ["SecurityClaim", "claimEn"],
  ["ClaimStatus", "claimStatus"],
  ["EvidenceClass", "evidenceClass"],
  ["AssuranceMaturity", "assuranceMaturity"],
  ["AssuranceScope", "scope"],
  ["Applicability", "applicabilityEn"],
  ["Limitation", "limitationEn"],
  ["OpenQuestion", "openQuestionEn"],
  ["SourceURL", "sourceUrl"],
  ["SourceOwner", "sourceOwner"],
  ["PublishedDate", "publishedDate"],
  ["ReviewedDate", "reviewedDate"],
  ["ContentOwnerKey", "owner"],
  ["Classification", "classification"],
  ["Audience", "audience"],
  ["PresentationRole", "presentationRole"],
  ["OIPRelevance", "oipRelevanceEn"],
  ["TitleZH", "titleZh"],
  ["SecurityClaimZH", "claimZh"],
  ["ApplicabilityZH", "applicabilityZh"],
  ["LimitationZH", "limitationZh"],
  ["OpenQuestionZH", "openQuestionZh"],
  ["OIPRelevanceZH", "oipRelevanceZh"],
  ["SystemLayer", "systemLayer"],
  ["PersistenceClass", "persistenceClass"],
  ["StorageCandidate", "storageCandidate"],
  ["OpportunityStatus", "opportunityStatus"],
  ["SourceLocator", "sourceLocator"],
  ["EvidenceBoundary", "evidenceBoundaryEn"],
  ["EvidenceBoundaryZH", "evidenceBoundaryZh"],
  ["ChapterRefs", "chapterRefs"],
  ["IsInference", "isInference"],
  ["ProofModeEligible", "proofModeEligible"],
  ["ResearchFreeze", () => knowledge.researchFreeze],
  ["SourceDocumentSHA256", () => knowledge.sourceDocument.sha256]
];

const serialize = value => {
  if (Array.isArray(value)) return value.join(";");
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return value ?? "";
};
const spreadsheetSafe = value => {
  const text = String(serialize(value));
  return /^[=+@]/u.test(text) || /^-(?!\d)/u.test(text) ? `'${text}` : text;
};
const quote = value => `"${spreadsheetSafe(value).replaceAll('"', '""')}"`;
const rows = [
  columns.map(([label]) => label).join(","),
  ...knowledge.records.map(record => columns.map(([, accessor]) => {
    const value = typeof accessor === "function" ? accessor(record) : record[accessor];
    return quote(value);
  }).join(","))
];
const output = `${rows.join("\r\n")}\r\n`;

const researchColumns = [
  ["InputID", (_input, hypothesis) => researchInput.inputId],
  ["HypothesisID", (_input, hypothesis) => hypothesis.hypothesisId],
  ["SourceTitle", input => input.title],
  ["Origin", input => input.origin],
  ["Format", input => input.format],
  ["PageCount", input => input.pageCount],
  ["SourceSHA256", input => input.sha256],
  ["SuppliedDate", input => input.suppliedDate],
  ["Classification", input => input.classification],
  ["IntakeStatus", input => input.status],
  ["CitationStatus", input => input.citationStatus],
  ["PublicationStatus", input => input.publicationStatus],
  ["CanonicalRecordEligible", input => input.canonicalRecordEligible],
  ["SourceLocator", (_input, hypothesis) => hypothesis.sourceLocator],
  ["EvidenceDisposition", input => input.evidenceDispositionEn],
  ["PermittedUse", input => input.permittedUseEn],
  ["ExcludedUse", input => input.excludedUseEn],
  ["HypothesisTitle", (_input, hypothesis) => hypothesis.titleEn],
  ["EvidenceClass", (_input, hypothesis) => hypothesis.evidenceClass],
  ["AssuranceMaturity", (_input, hypothesis) => hypothesis.assuranceMaturity],
  ["HypothesisStatement", (_input, hypothesis) => hypothesis.statementEn],
  ["ExcludedClaim", (_input, hypothesis) => hypothesis.excludedClaimEn],
  ["ValidationNeeded", (_input, hypothesis) => hypothesis.validationNeededEn],
  ["RelatedRecordIDs", (_input, hypothesis) => hypothesis.relatedRecordIds],
  ["IsInference", (_input, hypothesis) => hypothesis.isInference],
  ["HypothesisCanonicalRecordEligible", (_input, hypothesis) => hypothesis.canonicalRecordEligible],
  ["ProofModeEligible", (_input, hypothesis) => hypothesis.proofModeEligible],
  ["EvidenceDispositionZH", input => input.evidenceDispositionZh],
  ["PermittedUseZH", input => input.permittedUseZh],
  ["ExcludedUseZH", input => input.excludedUseZh],
  ["HypothesisTitleZH", (_input, hypothesis) => hypothesis.titleZh],
  ["HypothesisStatementZH", (_input, hypothesis) => hypothesis.statementZh],
  ["ExcludedClaimZH", (_input, hypothesis) => hypothesis.excludedClaimZh],
  ["ValidationNeededZH", (_input, hypothesis) => hypothesis.validationNeededZh]
];
const researchRows = [
  researchColumns.map(([label]) => label).join(","),
  ...knowledge.researchInputs.flatMap(input => input.hypotheses.map(hypothesis =>
    researchColumns.map(([, accessor]) => quote(accessor(input, hypothesis))).join(",")
  ))
];
const researchOutput = `${researchRows.join("\r\n")}\r\n`;

const normalizeLineEndings = text => text.replaceAll("\r\n", "\n");
if (args.has("--check")) {
  const current = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, "utf8") : "";
  const researchCurrent = fs.existsSync(researchCsvPath) ? fs.readFileSync(researchCsvPath, "utf8") : "";
  if (normalizeLineEndings(current) !== normalizeLineEndings(output) || normalizeLineEndings(researchCurrent) !== normalizeLineEndings(researchOutput)) {
    throw new Error("SharePoint CSV exports are stale. Run: node scripts/build-ai-nvm-sharepoint.mjs");
  }
  console.log(`PASS: ${expectedIds.length} governed records plus ${expectedResearchInput.hypothesisIds.length} quarantined research hypotheses; both CSV exports match canonical JSON.`);
} else {
  fs.writeFileSync(csvPath, output, "utf8");
  fs.writeFileSync(researchCsvPath, researchOutput, "utf8");
  console.log(`WROTE: primary evidence and research-intake CSV exports from canonical JSON (${expectedIds.length} records + ${expectedResearchInput.hypothesisIds.length} hypotheses).`);
}
