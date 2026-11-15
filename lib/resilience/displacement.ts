/**
 * Verified Population Displacement & Return Tracking Module
 * 
 * Enforces independent tracking of displacement and verified return:
 * - Emphasizes: Declining camp occupancy is NOT treated as return or recovery!
 * - Strictly enforces mathematical population balance identity:
 *   totalDisplacedBaseline = verifiedReturned + inCampShelter + secondaryDisplaced + unaccounted
 * - Non-negative count validation
 * - Decimal precision return rate calculation with zero-denominator safety
 * - Prevents manual rate tampering
 */

import { DisplacementAssessmentDTO } from './types';

export interface DisplacementValidationResult {
  isValid: boolean;
  calculatedRatePct: number;
  expectedSum: number;
  discrepancy: number;
  errorMessage?: string;
}

/**
 * Validates displacement assessment figures and calculates verified return rate
 */
export function validateAndCalculateDisplacement(
  assessment: Omit<DisplacementAssessmentDTO, 'id' | 'verifiedReturnRatePct' | 'isBalanceValid'>
): DisplacementValidationResult {
  const {
    totalDisplacedBaseline,
    verifiedReturnedCount,
    inCampShelterCount,
    secondaryDisplacedCount,
    unaccountedCount,
  } = assessment;

  // 1. Non-negative integer checks
  const figures = [
    { label: 'totalDisplacedBaseline', val: totalDisplacedBaseline },
    { label: 'verifiedReturnedCount', val: verifiedReturnedCount },
    { label: 'inCampShelterCount', val: inCampShelterCount },
    { label: 'secondaryDisplacedCount', val: secondaryDisplacedCount },
    { label: 'unaccountedCount', val: unaccountedCount },
  ];

  for (const f of figures) {
    if (f.val < 0 || !Number.isInteger(f.val)) {
      return {
        isValid: false,
        calculatedRatePct: 0.0,
        expectedSum: 0,
        discrepancy: 0,
        errorMessage: `Validation Error: '${f.label}' must be a non-negative integer (found ${f.val}).`,
      };
    }
  }

  // 2. Population Balance Equation
  const expectedSum = verifiedReturnedCount + inCampShelterCount + secondaryDisplacedCount + unaccountedCount;
  const discrepancy = totalDisplacedBaseline - expectedSum;
  const isBalanceValid = (discrepancy === 0);

  if (!isBalanceValid) {
    return {
      isValid: false,
      calculatedRatePct: 0.0,
      expectedSum,
      discrepancy,
      errorMessage: `Population Balance Mismatch: Sum of components (${expectedSum.toLocaleString()}) does not equal total baseline (${totalDisplacedBaseline.toLocaleString()}). Discrepancy: ${discrepancy.toLocaleString()}.`,
    };
  }

  // 3. Decimal Precision Return Rate (Safe division)
  let calculatedRatePct = 0.0;
  if (totalDisplacedBaseline > 0) {
    const rawRate = (verifiedReturnedCount / totalDisplacedBaseline) * 100;
    calculatedRatePct = Math.round(rawRate * 100) / 100;
  }

  return {
    isValid: true,
    calculatedRatePct,
    expectedSum,
    discrepancy: 0,
  };
}

/**
 * Analyzes camp occupancy vs. return rate to detect secondary displacement risks
 */
export function analyzeCampOccupancyContrast(
  assessment: DisplacementAssessmentDTO,
  historicalCampOccupancy?: number
): {
  campToBaselineRatioPct: number;
  secondaryDisplacementRatioPct: number;
  unaccountedRatioPct: number;
  analystSummary: string;
} {
  const base = assessment.totalDisplacedBaseline > 0 ? assessment.totalDisplacedBaseline : 1;
  const campPct = Math.round((assessment.inCampShelterCount / base) * 1000) / 10;
  const secondaryPct = Math.round((assessment.secondaryDisplacedCount / base) * 1000) / 10;
  const unaccountedPct = Math.round((assessment.unaccountedCount / base) * 1000) / 10;

  let summary = `Verified Return Rate: ${assessment.verifiedReturnRatePct}% (${assessment.verifiedReturnedCount.toLocaleString()} returned). Formal camps hold ${campPct}% of baseline displaced population.`;

  if (secondaryPct >= 15.0) {
    summary += ` WARNING: Elevated secondary displacement (${secondaryPct}%, ${assessment.secondaryDisplacedCount.toLocaleString()} persons in informal roadside settlements). Do not mistake empty camp tents for community return.`;
  }

  return {
    campToBaselineRatioPct: campPct,
    secondaryDisplacementRatioPct: secondaryPct,
    unaccountedRatioPct: unaccountedPct,
    analystSummary: summary,
  };
}
