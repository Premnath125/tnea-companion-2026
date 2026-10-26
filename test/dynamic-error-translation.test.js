import assert from "node:assert";
import { createError, formatError } from "../src/validation.js";
import { getTranslation } from "../src/i18n.js";

console.log("=== RUNNING DYNAMIC ERROR TRANSLATION TEST ===\n");

// 1. Simulate invalid mark error created in English context
const errObj = createError("val.marksExceed", { max: 100 });

// When user language is English
const errorEn = formatError(errObj, (k, p) => getTranslation("en", k, p));
console.log("English Error Message:", errorEn);
assert.strictEqual(errorEn, "Marks cannot exceed the maximum (100).");

// User immediately toggles to Tamil without re-validating or re-submitting
const errorTa = formatError(errObj, (k, p) => getTranslation("ta", k, p));
console.log("Tamil Error Message:  ", errorTa);
assert.strictEqual(errorTa, "மதிப்பெண்கள் அதிகபட்ச மதிப்பெண்களை (100) விட அதிகமாக இருக்கக்கூடாது.");

// 2. Test required field error
const reqErr = createError("val.fullNameRequired");
assert.strictEqual(
  formatError(reqErr, (k, p) => getTranslation("en", k, p)),
  "Please enter your full name."
);
assert.strictEqual(
  formatError(reqErr, (k, p) => getTranslation("ta", k, p)),
  "உங்கள் முழுப் பெயரை உள்ளிடவும்."
);

// 3. Test negative marks error
const negErr = createError("val.marksNegative");
assert.strictEqual(
  formatError(negErr, (k, p) => getTranslation("en", k, p)),
  "Marks cannot be negative."
);
assert.strictEqual(
  formatError(negErr, (k, p) => getTranslation("ta", k, p)),
  "மதிப்பெண்கள் எதிர்மறையாக இருக்கக்கூடாது."
);

console.log("\n✓ All dynamic error translation tests passed with 100% immediate language switching!");
