import assert from "node:assert";
import {
  generateChoiceRecommendations,
  extractCommunityCode,
} from "../src/choiceEngine.js";
import { TNEA_COLLEGE_CATALOG, BRANCH_PREFERENCES } from "../src/data.js";
import { translations, getTranslation } from "../src/i18n.js";
import { calculateTneaCutoff } from "../src/cutoff.js";

console.log("================================================================================");
console.log("   TNEA COMPANION 2026 - SCREEN 4 & CHOICE LIST ENGINE VERIFICATION SUITE");
console.log("================================================================================");

// 1. Community Extraction
console.log("\nTEST 1: Community Code Extraction");
assert.strictEqual(extractCommunityCode("BC – Backward Class"), "BC");
assert.strictEqual(extractCommunityCode("OC – Open Competition"), "OC");
assert.strictEqual(extractCommunityCode("BCM – Backward Class Muslim"), "BCM");
assert.strictEqual(extractCommunityCode("MBC & DNC – Most Backward Class"), "MBC");
assert.strictEqual(extractCommunityCode("SC – Scheduled Caste"), "SC");
assert.strictEqual(extractCommunityCode("SCA – Scheduled Caste (Arunthathiyar)"), "SCA");
assert.strictEqual(extractCommunityCode("ST – Scheduled Tribe"), "ST");
assert.strictEqual(extractCommunityCode(null), "OC");
console.log("  ✓ Community code extraction works correctly for all 7 categories");

// 2. Choice Recommendation Engine
console.log("\nTEST 2: AI-Assisted Recommendation Generation");
const highRecommendations = generateChoiceRecommendations({
  cutoff: 198.0,
  community: "BC",
  studiedGovtSchool: "no",
  selectedBranches: ["CSE", "IT", "ECE"],
});

assert(highRecommendations.length > 0, "Recommendations should not be empty");
console.log(`  ✓ Generated ${highRecommendations.length} recommendations for cutoff 198.0`);

// Check categorization
const ambitious = highRecommendations.filter((c) => c.category === "Ambitious");
const moderate = highRecommendations.filter((c) => c.category === "Moderate");
const safer = highRecommendations.filter((c) => c.category === "Safer");

console.log(`    - Ambitious choices: ${ambitious.length}`);
console.log(`    - Moderate choices:  ${moderate.length}`);
console.log(`    - Safer choices:     ${safer.length}`);

assert(moderate.length > 0, "Should have moderate matches");
assert(highRecommendations[0].order === 1, "First choice should have order 1");

// Verify authentic 4-digit college codes
for (const item of highRecommendations) {
  assert(/^\d{4}$/.test(item.code), `College code ${item.code} must be a 4-digit string`);
  assert(typeof item.name === "string" && item.name.length > 0, "College name must be present");
  assert(typeof item.branch === "string" && item.branch.length > 0, "Branch must be present");
  assert(typeof item.prevCutoff === "number", "Previous cutoff must be a valid number");
}
console.log("  ✓ All recommendations have valid 4-digit codes, genuine names, branches, and past cutoffs");

// 3. 7.5% Government School Reservation Logic
console.log("\nTEST 3: 7.5% Government School Quota Handling");
const govtStudentRecs = generateChoiceRecommendations({
  cutoff: 182.0,
  community: "BC",
  studiedGovtSchool: "yes",
  selectedBranches: ["CSE"],
});

assert(govtStudentRecs.length > 0, "Should generate recommendations for 7.5% quota student");
// Under 7.5% quota, CEG/MIT (0001, 0004) become accessible at ~182-187
const hasTopGovtCollege = govtStudentRecs.some((c) => c.code === "0001" || c.code === "0004");
assert(hasTopGovtCollege, "Top government college should be accessible under 7.5% quota");
console.log("  ✓ 7.5% Government School Quota correctly adjusts thresholds for candidates");

// 4. Branch Preference Filtering
console.log("\nTEST 4: Branch Preference Filtering");
const mechCivilOnly = generateChoiceRecommendations({
  cutoff: 190.0,
  community: "OC",
  studiedGovtSchool: "no",
  selectedBranches: ["MECH", "CIVIL"],
});

for (const c of mechCivilOnly) {
  assert(c.branchCode === "MECH" || c.branchCode === "CIVIL", `Branch ${c.branchCode} should be MECH or CIVIL`);
}
console.log("  ✓ Multi-branch selection filter strictly honored");

// 5. Screen 4 Independent Calculations
console.log("\nTEST 5: Screen 4 Cutoff Calculation Logic Preservation");
const cutoffVal = calculateTneaCutoff(95, 90, 85, 100, 100, 100);
assert.strictEqual(cutoffVal, 95 + (90 + 85) / 2); // 95 + 87.5 = 182.5
console.log(`  ✓ Screen 4 Cutoff Formula preserved: 95 + (90 + 85)/2 = ${cutoffVal}`);

// 6. Bilingual FAQ and Choice List Translations
console.log("\nTEST 6: Bilingual Queries & Solutions and Choice List Translations");
const requiredKeys = [
  "choice.title",
  "choice.subtitle",
  "choice.candidateSummary",
  "choice.storedCutoff",
  "choice.selectBranches",
  "choice.generateBtn",
  "choice.downloadPdf",
  "choice.thOrder",
  "choice.thCode",
  "choice.thCollege",
  "choice.thBranch",
  "choice.thCutoff",
  "choice.thCategory",
  "choice.catAmbitious",
  "choice.catModerate",
  "choice.catSafer",
  "queries.title",
  "queries.q1",
  "queries.a1",
  "queries.q2",
  "queries.a2",
  "queries.q3",
  "queries.a3",
  "queries.q4",
  "queries.a4",
  "queries.q5",
  "queries.a5",
  "queries.q6",
  "queries.a6",
  "academic.calculateCutoffOnlyBtn",
  "academic.continueBtn",
  "academic.topCutoffTitle",
];

for (const k of requiredKeys) {
  assert(translations.en[k], `Missing EN key: ${k}`);
  assert(translations.ta[k], `Missing TA key: ${k}`);
  assert.notStrictEqual(translations.en[k], translations.ta[k], `Key ${k} should have different translations in EN and TA`);
}
console.log(`  ✓ All ${requiredKeys.length} specialized keys verified in English and Tamil`);

console.log("\n================================================================================");
console.log("   ALL SCREEN 4 & CHOICE LIST ENGINE TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
