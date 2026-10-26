// TNEA Engineering Cutoff Calculation Engine

/**
 * Standard TNEA Cutoff Formula:
 * Cutoff = Maths + (Physics + Chemistry) / 2
 * Scaled to 200 marks maximum.
 * 
 * If mark sheet maximum differs from 100 (e.g. 200 each in legacy systems),
 * each subject is normalized to 100 before computing cutoff.
 */
export function normalizeMark(obtained, max = 100) {
  const obt = parseFloat(obtained);
  const m = parseFloat(max);
  if (isNaN(obt) || isNaN(m) || m <= 0) return 0;
  return (obt / m) * 100;
}

export function calculateTneaCutoff(maths, physics, chemistry, maxMaths = 100, maxPhysics = 100, maxChemistry = 100) {
  const mNum = parseFloat(maths);
  const pNum = parseFloat(physics);
  const cNum = parseFloat(chemistry);

  if (isNaN(mNum) || isNaN(pNum) || isNaN(cNum)) {
    return null;
  }
  if (mNum < 0 || pNum < 0 || cNum < 0) {
    return null;
  }

  const mNorm = normalizeMark(mNum, maxMaths);
  const pNorm = normalizeMark(pNum, maxPhysics);
  const cNorm = normalizeMark(cNum, maxChemistry);

  const cutoff = mNorm + ((pNorm + cNorm) / 2);
  return Math.min(200, Math.max(0, cutoff));
}

export function calculateAveragePercentage(maths, physics, chemistry, maxMaths = 100, maxPhysics = 100, maxChemistry = 100) {
  const mNum = parseFloat(maths);
  const pNum = parseFloat(physics);
  const cNum = parseFloat(chemistry);

  if (isNaN(mNum) || isNaN(pNum) || isNaN(cNum)) {
    return null;
  }

  const mNorm = normalizeMark(mNum, maxMaths);
  const pNorm = normalizeMark(pNum, maxPhysics);
  const cNorm = normalizeMark(cNum, maxChemistry);

  const avg = (mNorm + pNorm + cNorm) / 3;
  return Math.min(100, Math.max(0, avg));
}

/**
 * Minimum marks eligibility check:
 * - OC: Minimum 45% aggregate in PCM
 * - BC / BCM / MBC & DNC / SC / SCA / ST: Minimum 40% aggregate in PCM
 */
export function checkMinimumEligibility(average, community = "BC") {
  if (average === null || isNaN(average)) {
    return { eligible: false, minRequired: 40, average: 0 };
  }
  const isOC = community && community.startsWith("OC");
  const minRequired = isOC ? 45.0 : 40.0;
  return {
    eligible: average >= minRequired,
    minRequired,
    average
  };
}

export function formatCutoff(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "___";
  }
  return Number(value).toFixed(2);
}

export function getCutoffFormulaBreakdown(maths, physics, chemistry) {
  const m = parseFloat(maths) || 0;
  const p = parseFloat(physics) || 0;
  const c = parseFloat(chemistry) || 0;
  const cutoff = m + ((p + c) / 2);
  return `${m} + ${p} ÷ 2 + ${c} ÷ 2 = ${cutoff.toFixed(2)}`;
}
