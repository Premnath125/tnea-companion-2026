// Comprehensive verification test for TNEA Cutoff & Bilingual Localization

import assert from "node:assert";
import {
  calculateTneaCutoff,
  calculateAveragePercentage,
  checkMinimumEligibility,
  formatCutoff,
  getCutoffFormulaBreakdown,
} from "../src/cutoff.js";
import { translations, getTranslation } from "../src/i18n.js";

console.log("=== RUNNING TNEA COMPANION UNIT TESTS ===\n");

// 1. Cutoff calculation tests
console.log("1. Testing Cutoff Calculation Engine...");

// Test Case 1: Reference image example (Screen 4: 90, 85, 95)
const cutoff1 = calculateTneaCutoff(90, 85, 95);
assert.strictEqual(cutoff1, 180.00, `Expected 180.00, got ${cutoff1}`);
assert.strictEqual(formatCutoff(cutoff1), "180.00");
console.log("  ✓ Screen 4 Reference: 90 + (85 + 95)/2 = 180.00 PASS");

// Test Case 2: Master prompt example (90, 80, 70 -> 165)
const cutoff2 = calculateTneaCutoff(90, 80, 70);
assert.strictEqual(cutoff2, 165.00, `Expected 165.00, got ${cutoff2}`);
console.log("  ✓ Master prompt example: 90 + (80 + 70)/2 = 165.00 PASS");

// Test Case 3: Maximum score (100, 100, 100 -> 200)
const cutoffMax = calculateTneaCutoff(100, 100, 100);
assert.strictEqual(cutoffMax, 200.00, `Expected 200.00, got ${cutoffMax}`);
console.log("  ✓ Perfect score 200.00 PASS");

// Test Case 4: Zero score
const cutoffZero = calculateTneaCutoff(0, 0, 0);
assert.strictEqual(cutoffZero, 0.00);
console.log("  ✓ Zero score 0.00 PASS");

// Test Case 5: Decimal marks
const cutoffDec = calculateTneaCutoff(95.5, 87.5, 91.5);
assert.strictEqual(cutoffDec, 95.5 + (87.5 + 91.5) / 2);
console.log("  ✓ Decimal precision PASS");

// Test Case 6: Invalid inputs
assert.strictEqual(calculateTneaCutoff(-5, 80, 70), null, "Negative marks should return null");
assert.strictEqual(calculateTneaCutoff("abc", 80, 70), null, "Non-numeric marks should return null");
assert.strictEqual(calculateTneaCutoff("", 80, 70), null, "Empty marks should return null");
console.log("  ✓ Invalid/negative marks handling PASS");

// Test Case 7: Formula string breakdown
const formulaStr = getCutoffFormulaBreakdown(90, 85, 95);
assert.strictEqual(formulaStr, "90 + 85 ÷ 2 + 95 ÷ 2 = 180.00");
console.log(`  ✓ Formula breakdown text: "${formulaStr}" PASS`);

// 2. Minimum Eligibility Checks
console.log("\n2. Testing Minimum Marks Eligibility (OC 45%, BC 40%)...");
const avg1 = calculateAveragePercentage(90, 85, 95); // 90%
assert.strictEqual(avg1, 90.00);
const eligBC = checkMinimumEligibility(avg1, "BC");
assert.strictEqual(eligBC.eligible, true);
assert.strictEqual(eligBC.minRequired, 40);

const avgLow = calculateAveragePercentage(42, 42, 42); // 42%
const eligOC = checkMinimumEligibility(avgLow, "OC");
assert.strictEqual(eligOC.eligible, false, "42% should fail for OC (requires 45%)");
const eligBC2 = checkMinimumEligibility(avgLow, "BC");
assert.strictEqual(eligBC2.eligible, true, "42% should pass for BC (requires 40%)");
console.log("  ✓ Minimum marks thresholds for OC (45%) and BC (40%) PASS");

// 3. Complete Bilingual Localization Coverage Test
console.log("\n3. Testing Complete English <-> Tamil Localization Parity...");
const enKeys = Object.keys(translations.en);
const taKeys = Object.keys(translations.ta);

console.log(`  English keys count: ${enKeys.length}`);
console.log(`  Tamil keys count:   ${taKeys.length}`);

const missingInTamil = enKeys.filter((k) => !translations.ta[k]);
const missingInEnglish = taKeys.filter((k) => !translations.en[k]);

assert.strictEqual(missingInTamil.length, 0, `Missing Tamil translations for: ${missingInTamil.join(", ")}`);
assert.strictEqual(missingInEnglish.length, 0, `Missing English translations for: ${missingInEnglish.join(", ")}`);
console.log("  ✓ 100% translation key parity between English and Tamil PASS");

// Test parameterized translation
const dynamicEn = getTranslation("en", "dash.cardCollegesCount", { count: 5 });
const dynamicTa = getTranslation("ta", "dash.cardCollegesCount", { count: 5 });
assert.strictEqual(dynamicEn, "5 Colleges Saved");
assert.strictEqual(dynamicTa, "5 கல்லூரிகள் சேமிக்கப்பட்டுள்ளன");
console.log(`  ✓ Parameterized string En: "${dynamicEn}" | Ta: "${dynamicTa}" PASS`);

console.log("\nALL TESTS PASSED SUCCESSFULLY! (100% PASS)\n");
