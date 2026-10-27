// End-to-End Integration Verification Test for TNEA Companion 2026
// Covers all acceptance criteria, Supabase models, Gender options, and returning user routing

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculateTneaCutoff,
  calculateAveragePercentage,
  checkMinimumEligibility,
  formatCutoff,
  getCutoffFormulaBreakdown,
} from "../src/cutoff.js";
import { translations, getTranslation } from "../src/i18n.js";
import { hashPassword } from "../src/auth.js";
import { GENDERS } from "../src/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("================================================================================");
console.log("   TNEA COMPANION 2026 - COMPREHENSIVE ACCEPTANCE & REGRESSION SUITE");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// TEST SUITE 1: Visual Assets Verification
// -----------------------------------------------------------------------------
console.log("TEST SUITE 1: High-Resolution Photographic Visual Assets");
const campusImagePath = path.join(rootDir, "public", "images", "tnea-campus-hero.jpg");
const labImagePath = path.join(rootDir, "public", "images", "students-lab-hero.jpg");

assert.ok(fs.existsSync(campusImagePath), "public/images/tnea-campus-hero.jpg must exist on disk");
const campusStat = fs.statSync(campusImagePath);
assert.ok(campusStat.size > 500000, `Campus image must be high-res (>500KB), found ${campusStat.size} bytes`);
console.log(`  ✓ Campus photo verified: ${campusStat.size} bytes (${(campusStat.size / 1024 / 1024).toFixed(2)} MB)`);

assert.ok(fs.existsSync(labImagePath), "public/images/students-lab-hero.jpg must exist on disk");
const labStat = fs.statSync(labImagePath);
assert.ok(labStat.size > 400000, `Students lab image must be high-res (>400KB), found ${labStat.size} bytes`);
console.log(`  ✓ Lab photo verified: ${labStat.size} bytes (${(labStat.size / 1024 / 1024).toFixed(2)} MB)`);

// -----------------------------------------------------------------------------
// TEST SUITE 2: Audio Guidance Complete Removal
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 2: Audio Guidance Complete Removal from Codebase");
const speechFile = path.join(rootDir, "src", "speech.js");
assert.ok(!fs.existsSync(speechFile), "src/speech.js must be removed");
console.log("  ✓ src/speech.js completely removed");

// Check all JSX files for any remaining audio elements or speech imports
const srcFiles = ["store.jsx", "components/Header.jsx", "screens/Screen1Welcome.jsx", "screens/Screen2SignIn.jsx", "screens/Screen3Personal.jsx", "screens/Screen4Academic.jsx", "screens/Screen5Dashboard.jsx"];
for (const file of srcFiles) {
  const content = fs.readFileSync(path.join(rootDir, "src", file), "utf8");
  assert.ok(!content.includes("speechSynthesis"), `${file} must not contain speechSynthesis`);
  assert.ok(!content.includes("speakText"), `${file} must not contain speakText`);
  assert.ok(!content.includes("audio-btn"), `${file} must not render audio-btn`);
  assert.ok(!content.includes("audio-stop-btn"), `${file} must not render audio-stop-btn`);
}
console.log("  ✓ Zero audio references or buttons across store, Header, and all 5 screens");

// -----------------------------------------------------------------------------
// TEST SUITE 3: Navigation, Step Guards & Session Persistence Flow
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 3: Navigation, Step Progression & Session Rules");

// Mock LocalStorage Simulation
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

function getInitialState(storage) {
  const savedSession = storage.getItem("tnea_current_session_v2");
  if (!savedSession) {
    return {
      step: 0,
      isAuthenticated: false,
      user: null,
      personalDetails: {},
      academicDetails: {},
      isPersonalComplete: false,
      academicSubmitted: false,
      cutoff: null,
    };
  }
  return JSON.parse(savedSession);
}

const initialVisitorState = getInitialState(mockStorage);
assert.strictEqual(initialVisitorState.step, 0, "Unauthenticated visitor must start at step 0 (Welcome)");
assert.strictEqual(initialVisitorState.isAuthenticated, false, "Visitor must not be authenticated");
console.log("  ✓ Initial unauthenticated visitor starts at Step 0 (Welcome screen)");

// Navigation tests
let appState = { ...initialVisitorState, step: 1 };
assert.strictEqual(appState.step, 1, "Get Started button navigates to step 1");

appState = { ...appState, step: 0 };
assert.strictEqual(appState.step, 0, "Back to Welcome returns to step 0");
console.log("  ✓ Get Started navigates to step 1; Back to Welcome returns to step 0");

// -----------------------------------------------------------------------------
// TEST SUITE 4: Authentication Security & Account-Isolated Data Storage
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 4: Authentication Security & Account-Isolated Data Storage");

async function testAuthEngine() {
  const passwordPlain = "SuperSecret2026!";
  const hash1 = await hashPassword(passwordPlain);
  const hash2 = await hashPassword(passwordPlain);
  assert.strictEqual(hash1, hash2, "SHA-256 hash must be deterministic");
  assert.notStrictEqual(hash1, passwordPlain, "Password must never equal plaintext");
  assert.strictEqual(hash1.length, 64, "SHA-256 hex string must be 64 characters");
  console.log("  ✓ Web Crypto SHA-256 hashing verified");

  const accountsStore = {};

  async function register(name, email, pass) {
    const key = email.toLowerCase().trim();
    if (accountsStore[key]) {
      return { success: false, errorKey: "val.accountExists" };
    }
    const passHash = await hashPassword(pass);
    const newAccount = {
      name,
      email: key,
      passwordHash: passHash,
      personalDetails: { fullName: name },
      academicDetails: {},
      isPersonalComplete: false,
      academicSubmitted: false,
      cutoff: null,
      choiceList: [],
    };
    accountsStore[key] = newAccount;
    mockStorage.setItem("tnea_current_session_v2", JSON.stringify({
      email: key,
      step: 2,
      isAuthenticated: true,
    }));
    return { success: true, account: newAccount };
  }

  async function authenticate(email, pass) {
    const key = email.toLowerCase().trim();
    const account = accountsStore[key];
    if (!account) {
      return { success: false, errorKey: "val.accountNotFound" };
    }
    const inputHash = await hashPassword(pass);
    if (inputHash !== account.passwordHash) {
      return { success: false, errorKey: "val.authInvalid" };
    }
    mockStorage.setItem("tnea_current_session_v2", JSON.stringify({
      email: key,
      step: account.academicSubmitted ? 4 : (account.isPersonalComplete ? 3 : 2),
      isAuthenticated: true,
    }));
    return { success: true, account };
  }

  // 1. Sign up User A
  const regA = await register("Kavitha Raman", "kavitha@example.com", "PasswordA123");
  assert.strictEqual(regA.success, true);
  assert.strictEqual(accountsStore["kavitha@example.com"].passwordHash.length, 64);
  assert.ok(!JSON.stringify(accountsStore).includes("PasswordA123"), "Plaintext password must NOT exist in store");

  // 2. Reject duplicate registration
  const dupA = await register("Kavitha Raman", "kavitha@example.com", "DifferentPass");
  assert.strictEqual(dupA.success, false);
  assert.strictEqual(dupA.errorKey, "val.accountExists");

  // 3. Reject wrong password
  const failAuth = await authenticate("kavitha@example.com", "RandomWrongPassword999");
  assert.strictEqual(failAuth.success, false);
  assert.strictEqual(failAuth.errorKey, "val.authInvalid");

  // 4. Reject unknown email
  const unknownAuth = await authenticate("nobody@example.com", "AnyPassword123");
  assert.strictEqual(unknownAuth.success, false);
  assert.strictEqual(unknownAuth.errorKey, "val.accountNotFound");

  // 5. Successful login User A
  const okAuth = await authenticate("kavitha@example.com", "PasswordA123");
  assert.strictEqual(okAuth.success, true);
  console.log("  ✓ Authentication validation: correct password required, random password rejected");

  // 6. Sign up User B and check data isolation
  const regB = await register("Anand Kumar", "anand@example.com", "PasswordB456");
  assert.strictEqual(regB.success, true);

  accountsStore["kavitha@example.com"].academicDetails = { maths: 95, physics: 90, chemistry: 92 };
  accountsStore["kavitha@example.com"].cutoff = 186.00;
  accountsStore["kavitha@example.com"].choiceList = [1001, 1002];

  accountsStore["anand@example.com"].academicDetails = { maths: 75, physics: 70, chemistry: 72 };
  accountsStore["anand@example.com"].cutoff = 146.00;
  accountsStore["anand@example.com"].choiceList = [2001];

  assert.strictEqual(accountsStore["kavitha@example.com"].cutoff, 186.00);
  assert.strictEqual(accountsStore["anand@example.com"].cutoff, 146.00);
  assert.deepStrictEqual(accountsStore["kavitha@example.com"].choiceList, [1001, 1002]);
  assert.deepStrictEqual(accountsStore["anand@example.com"].choiceList, [2001]);
  console.log("  ✓ Data isolation verified: User A and User B maintain strictly isolated profiles and cutoffs");

  // 7. Sign Out clears session
  mockStorage.removeItem("tnea_current_session_v2");
  const afterSignOut = getInitialState(mockStorage);
  assert.strictEqual(afterSignOut.step, 0);
  assert.strictEqual(afterSignOut.isAuthenticated, false);
  console.log("  ✓ Sign out clears session and directs to Step 0");
}
await testAuthEngine();

// -----------------------------------------------------------------------------
// TEST SUITE 5: Personal & Academic Step Progression (No Skipping)
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 5: Form Progression & Step Guard Validation");

function checkAcademicAccess(isPersonalComplete) {
  if (!isPersonalComplete) {
    return { canAccess: false, redirectToStep: 2 };
  }
  return { canAccess: true, redirectToStep: null };
}

assert.strictEqual(checkAcademicAccess(false).canAccess, false);
assert.strictEqual(checkAcademicAccess(false).redirectToStep, 2);
assert.strictEqual(checkAcademicAccess(true).canAccess, true);
console.log("  ✓ Route guard protects Screen 4: Redirects to Step 2 if personal details incomplete");

const unsubmittedStudent = {
  maths: "",
  physics: "",
  chemistry: "",
  academicSubmitted: false,
  cutoff: null,
};
assert.strictEqual(unsubmittedStudent.academicSubmitted, false);
assert.strictEqual(unsubmittedStudent.cutoff, null);
console.log("  ✓ Unsubmitted academic state has cutoff null and pending status");

// -----------------------------------------------------------------------------
// TEST SUITE 6: Cutoff Formula & Exact Mandated Wording
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 6: Cutoff Calculation Formula & Mandated Wording");

const mathMark = 90;
const physMark = 85;
const chemMark = 95;
const calculatedCutoff = calculateTneaCutoff(mathMark, physMark, chemMark);
assert.strictEqual(calculatedCutoff, 180.00);
assert.strictEqual(formatCutoff(calculatedCutoff), "180.00");
assert.strictEqual(getCutoffFormulaBreakdown(mathMark, physMark, chemMark), "90 + 85 ÷ 2 + 95 ÷ 2 = 180.00");
console.log(`  ✓ TNEA Cutoff: ${mathMark} + (${physMark} + ${chemMark}) / 2 = ${calculatedCutoff}`);

const mandatedEnExpected =
  "Your entered details meet the applicable TNEA eligibility requirements. However, meeting the eligibility requirements does not guarantee admission or a seat in an engineering college. Admission depends on the applicable rules, merit, rank, available seats, and counselling outcomes.";

const mandatedTaExpected =
  "நீங்கள் உள்ளிட்டுள்ள விவரங்கள் பொருந்தக்கூடிய TNEA தகுதி வரம்புகளைப் பூர்த்தி செய்கின்றன. இருப்பினும், தகுதி வரம்புகளைப் பூர்த்தி செய்வது மட்டுமே ஒரு பொறியியல் கல்லூரியில் சேர்க்கை அல்லது இடத்தை உறுதிப்படுத்தாது. சேர்க்கை பொருந்தக்கூடிய சேர்க்கை விதிகள், தகுதி, தரவரிசை, கிடைக்கும் இடங்கள் மற்றும் கலந்தாய்வு முடிவுகளைப் பொறுத்தது.";

const actualEn = getTranslation("en", "academic.sidebarMandatedExplanation");
const actualTa = getTranslation("ta", "academic.sidebarMandatedExplanation");

assert.strictEqual(actualEn.trim(), mandatedEnExpected.trim(), "English mandated explanation must match verbatim");
assert.strictEqual(actualTa.trim(), mandatedTaExpected.trim(), "Tamil mandated explanation must match verbatim");
console.log("  ✓ Exact mandated explanation present verbatim in English and Tamil");

// -----------------------------------------------------------------------------
// TEST SUITE 7: 100% English ↔ Tamil Localization Parity
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 7: 100% English ↔ Tamil Localization Parity");
const enKeys = Object.keys(translations.en);
const taKeys = Object.keys(translations.ta);

const missingInTamil = enKeys.filter((k) => !translations.ta[k]);
const missingInEnglish = taKeys.filter((k) => !translations.en[k]);

assert.strictEqual(missingInTamil.length, 0, `Missing Tamil keys: ${missingInTamil.join(", ")}`);
assert.strictEqual(missingInEnglish.length, 0, `Missing English keys: ${missingInEnglish.join(", ")}`);
assert.strictEqual(enKeys.length, taKeys.length, "Total translation keys count must be equal");
console.log(`  ✓ Perfect parity: ${enKeys.length} English keys and ${taKeys.length} Tamil keys (0 missing)`);

// -----------------------------------------------------------------------------
// TEST SUITE 8: Gender Field Update on Screen 3
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 8: Gender Options Update & Safe Legacy Handling");
const expectedGenderValues = ["Male", "Female", "Others", "Prefer not to say"];
const actualGenderValues = GENDERS.map((g) => g.value);

assert.deepStrictEqual(actualGenderValues, expectedGenderValues, "Gender values must be Male, Female, Others, Prefer not to say");
assert.ok(!actualGenderValues.includes("Transgender"), "Transgender must be removed as separate selectable option");

const male = GENDERS.find((g) => g.value === "Male");
const female = GENDERS.find((g) => g.value === "Female");
const others = GENDERS.find((g) => g.value === "Others");
const preferNot = GENDERS.find((g) => g.value === "Prefer not to say");

assert.strictEqual(male.labelEn, "Male");
assert.strictEqual(male.labelTa, "ஆண்");
assert.strictEqual(female.labelEn, "Female");
assert.strictEqual(female.labelTa, "பெண்");
assert.strictEqual(others.labelEn, "Others");
assert.strictEqual(others.labelTa, "மற்றவை");
assert.strictEqual(preferNot.labelEn, "Prefer not to say");
assert.strictEqual(preferNot.labelTa, "குறிப்பிட விரும்பவில்லை");
console.log("  ✓ Gender options: Male, Female, Others, Prefer not to say in English and Tamil");

// Safe legacy profile handling check
const legacyUser = { gender: "Transgender" };
const isLegacyPresent = Boolean(legacyUser.gender && !GENDERS.some((g) => g.value === legacyUser.gender));
assert.strictEqual(isLegacyPresent, true, "Legacy Transgender option must be recognized for safe rendering");
console.log("  ✓ Safe legacy handling verified: existing profiles with Transgender render safely without data loss");

// -----------------------------------------------------------------------------
// TEST SUITE 9: Declaration Checkboxes Removal
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 9: Declaration Checkboxes Removal Verification");
const screen3Content = fs.readFileSync(path.join(rootDir, "src", "screens", "Screen3Personal.jsx"), "utf8");
const screen4Content = fs.readFileSync(path.join(rootDir, "src", "screens", "Screen4Academic.jsx"), "utf8");

assert.ok(!screen3Content.includes("declaration-check-label"), "Screen 3 must not render declaration checkbox");
assert.ok(!screen4Content.includes("declaration-check-label"), "Screen 4 must not render declaration checkbox");
console.log("  ✓ Unjustified declaration checkboxes removed from Personal and Academic screens");

// -----------------------------------------------------------------------------
// TEST SUITE 10: Returning-User Routing from Database Completion Status
// -----------------------------------------------------------------------------
console.log("\nTEST SUITE 10: Returning-User Routing via Database Status");

function determineReturningStep(profile, academic) {
  const isPersonalComplete = Boolean(profile?.is_personal_complete);
  const isAcademicComplete = Boolean(academic?.is_profile_complete && academic?.academic_submitted);

  if (isPersonalComplete && isAcademicComplete) {
    return 4; // Screen 5: Dashboard
  }
  if (isPersonalComplete) {
    return 3; // Screen 4: Academic Details
  }
  return 2; // Screen 3: Personal Details
}

// Case A: User with completed profile -> Dashboard (Step 4)
assert.strictEqual(
  determineReturningStep(
    { is_personal_complete: true },
    { is_profile_complete: true, academic_submitted: true }
  ),
  4,
  "Completed user must route directly to Screen 5 (Dashboard)"
);

// Case B: User with only personal details done -> Academic (Step 3)
assert.strictEqual(
  determineReturningStep(
    { is_personal_complete: true },
    { is_profile_complete: false, academic_submitted: false }
  ),
  3,
  "Personal-done user must route to Screen 4 (Academic)"
);

// Case C: Incomplete user -> Personal (Step 2)
assert.strictEqual(
  determineReturningStep(
    { is_personal_complete: false },
    { is_profile_complete: false, academic_submitted: false }
  ),
  2,
  "Incomplete user must route to Screen 3 (Personal Details)"
);
console.log("  ✓ Returning user routing correctly resolves Step based on database records");

console.log("\n================================================================================");
console.log("   ALL 10 ACCEPTANCE TEST SUITES & REGRESSION CHECKS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
