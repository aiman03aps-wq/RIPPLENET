/**
 * Community Climate Adaptation Action Tracker Module
 * 
 * Monitors long-term community adaptation initiatives:
 * - 6 Adaptation Sectors (Water, Infrastructure, Early Warning, Shelter, Sanitation, Livelihoods)
 * - Independent verification gating (requires third-party engineering audit)
 * - Dynamic CRI resilience recalculation upon independent verification
 * - Cost-efficiency telemetry integration with Resource Agent models
 * - Audit trail logging
 */

import {
  AdaptationActionAuditDTO,
  AdaptationActionStatus,
  ClimateAdaptationRecordDTO,
} from './types';

export const ADAPTATION_SECTOR_LABELS: Record<string, { label: string; icon: string; impactDimension: string }> = {
  WATER: {
    label: 'Flood-Resilient Potable Water Systems',
    icon: 'droplets',
    impactDimension: 'waterAccessScore (D2)',
  },
  INFRASTRUCTURE: {
    label: 'Elevated Roads, Culverts & Flood Protection Bunds',
    icon: 'hammer',
    impactDimension: 'housingResilience (D1) / evacuationCapacity (D6)',
  },
  EARLY_WARNING: {
    label: 'Community Early Warning & Telemetry Sensors',
    icon: 'radio',
    impactDimension: 'earlyWarningScore (D5)',
  },
  SHELTER: {
    label: 'Permanent Elevated Multipurpose Cyclone/Flood Shelters',
    icon: 'home',
    impactDimension: 'evacuationCapacity (D6)',
  },
  SANITATION: {
    label: 'Elevated Eco-Sanitation & Flood-Proof Latrines',
    icon: 'shield-check',
    impactDimension: 'sanitationScore (D4)',
  },
  LIVELIHOODS: {
    label: 'Climate-Smart Agriculture & Flood-Tolerant Seeds',
    icon: 'sprout',
    impactDimension: 'socialSupportIndex (D8)',
  },
};

/**
 * Validates climate adaptation record verification constraints
 */
export function validateAdaptationRecord(record: Partial<ClimateAdaptationRecordDTO>): void {
  if (record.status === 'INDEPENDENTLY_VERIFIED') {
    if (!record.independentlyVerified) {
      throw new Error("Integrity Violation: Status 'INDEPENDENTLY_VERIFIED' must have independentlyVerified=true.");
    }
    if (!record.verifyingAuditor || record.verifyingAuditor.trim().length === 0) {
      throw new Error("Integrity Violation: Independent verification requires an accredited verifyingAuditor name/agency.");
    }
    if (!record.verifiedAt) {
      throw new Error("Integrity Violation: Independent verification requires a verifiedAt timestamp.");
    }
  } else {
    if (record.independentlyVerified === true) {
      throw new Error(`Integrity Violation: Action cannot be independentlyVerified=true while status is '${record.status}'. Must be INDEPENDENTLY_VERIFIED.`);
    }
    if (record.resilienceRecalculated === true) {
      throw new Error("Integrity Violation: Resilience recalculation is permitted ONLY after independent verification is certified.");
    }
  }
}

/**
 * Calculates economic cost-efficiency per beneficiary (connecting with Resource Agent telemetry)
 */
export function calculateAdaptationEfficiency(
  record: ClimateAdaptationRecordDTO
): {
  costPerBeneficiaryPkr: number | null;
  efficiencyTier: 'High' | 'Moderate' | 'Low' | 'Pending Completion';
  summary: string;
} {
  if (!record.budgetPkr || record.budgetPkr <= 0) {
    return {
      costPerBeneficiaryPkr: null,
      efficiencyTier: 'Pending Completion',
      summary: 'Budget not declared.',
    };
  }

  const beneficiaries = record.independentlyVerified
    ? record.verifiedBeneficiaries
    : record.targetBeneficiaries;

  if (beneficiaries <= 0) {
    return {
      costPerBeneficiaryPkr: null,
      efficiencyTier: 'Pending Completion',
      summary: 'Beneficiaries not established.',
    };
  }

  const costPerBeneficiaryPkr = Math.round(record.budgetPkr / beneficiaries);

  // Benchmarked against Resource Agent standard relief metrics (~PKR 3,500 - 15,000 per person)
  let tier: 'High' | 'Moderate' | 'Low' = 'Moderate';
  if (costPerBeneficiaryPkr <= 5000) tier = 'High';
  else if (costPerBeneficiaryPkr > 25000) tier = 'Low';

  return {
    costPerBeneficiaryPkr,
    efficiencyTier: tier,
    summary: `PKR ${costPerBeneficiaryPkr.toLocaleString()} per beneficiary (${beneficiaries.toLocaleString()} beneficiaries, budget PKR ${record.budgetPkr.toLocaleString()}).`,
  };
}

/**
 * Calculates impact on Community Resilience Index (CRI) when an adaptation project completes and is independently verified.
 * Uses actual demographic coverage and physical capacity formulas, NOT arbitrary fixed score bonuses.
 */
export function calculateResilienceRecalculationDelta(
  record: ClimateAdaptationRecordDTO,
  boundaryPopulation: number,
  currentDimensionScore?: number | null,
  incrementalBeneficiaries?: number
): {
  dimensionKey: string;
  targetDimension: string;
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  recalculationJustification: string;
} {
  if (!record.independentlyVerified || record.status !== 'INDEPENDENTLY_VERIFIED') {
    throw new Error('Resilience recalculation can only be evaluated for independently verified projects.');
  }

  const population = boundaryPopulation > 0 ? boundaryPopulation : 100000;
  const beneficiaries = incrementalBeneficiaries !== undefined
    ? Math.max(0, incrementalBeneficiaries)
    : Math.max(0, record.verifiedBeneficiaries);

  let dimensionKey = 'waterAccessScore';
  let targetDimension = 'waterAccessScore (D2)';
  let prevScore = currentDimensionScore !== null && currentDimensionScore !== undefined ? currentDimensionScore : 5.8;
  let newScore = prevScore;

  if (beneficiaries === 0) {
    // Repeated update or zero incremental beneficiaries: prevent artificial inflation
    return {
      dimensionKey,
      targetDimension,
      previousScore: prevScore,
      newScore: prevScore,
      scoreDelta: 0,
      recalculationJustification: `Repeated audit update: No incremental beneficiaries (previously verified: ${record.verifiedBeneficiaries.toLocaleString()}). Resilience score maintained at ${prevScore.toFixed(1)} without duplicate beneficiary counting.`,
    };
  }

  switch (record.sector) {
    case 'WATER': {
      dimensionKey = 'waterAccessScore';
      targetDimension = 'waterAccessScore (D2)';
      // Reference formula: (Protected Population / Total Population) * 10
      const prevProtectedPop = (prevScore / 10) * population;
      const newProtectedPop = Math.min(population, prevProtectedPop + beneficiaries);
      newScore = Math.round((newProtectedPop / population) * 100) / 10;
      break;
    }
    case 'SHELTER':
    case 'INFRASTRUCTURE': {
      dimensionKey = 'evacuationCapacity';
      targetDimension = 'Evacuation Shelter Capacity (D6)';
      // Reference formula: Shelter beds per 1,000 residents, where 10.0 = >=250 beds/1k (i.e. 25% of population)
      const benchmarkCapacity = population * 0.25;
      const prevCapacity = (prevScore / 10) * benchmarkCapacity;
      const newCapacity = Math.min(benchmarkCapacity, prevCapacity + beneficiaries);
      newScore = Math.round((newCapacity / benchmarkCapacity) * 100) / 10;
      break;
    }
    case 'EARLY_WARNING': {
      dimensionKey = 'earlyWarningScore';
      targetDimension = 'Early Warning Dissemination (D5)';
      // Reference formula: (Population Covered by Verified Warning Telemetry / Total Population) * 10
      const prevCovered = (prevScore / 10) * population;
      const newCovered = Math.min(population, prevCovered + beneficiaries);
      newScore = Math.round((newCovered / population) * 100) / 10;
      break;
    }
    case 'SANITATION': {
      dimensionKey = 'sanitationScore';
      targetDimension = 'Covered Sanitation & Drainage (D4)';
      // Reference formula: (Population with Flood-Proof Sanitation / Total Population) * 10
      const prevSanitized = (prevScore / 10) * population;
      const newSanitized = Math.min(population, prevSanitized + beneficiaries);
      newScore = Math.round((newSanitized / population) * 100) / 10;
      break;
    }
    default: {
      dimensionKey = 'disasterPreparedness';
      targetDimension = 'Disaster Preparedness (D7)';
      // Reference formula: (Community Members with Flood-Resilient Assets / 10% target) * 10
      const benchmarkTarget = population * 0.10;
      const prevPrepared = (prevScore / 10) * benchmarkTarget;
      const newPrepared = Math.min(benchmarkTarget, prevPrepared + beneficiaries);
      newScore = Math.round((newPrepared / benchmarkTarget) * 100) / 10;
      break;
    }
  }

  // Ensure score stays in 0.0 - 10.0 range
  newScore = Math.max(prevScore, Math.min(10.0, newScore));
  const scoreDelta = Math.round((newScore - prevScore) * 10) / 10;

  const coveragePercent = Math.round((beneficiaries / population) * 1000) / 10;
  const justification = `Verified completion of '${record.title}' serving ${beneficiaries.toLocaleString()} residents (${coveragePercent}% of ${population.toLocaleString()} population) delivers an evidence-backed recalculation that recalculates Safe Water Access (D2) from ${prevScore.toFixed(1)} to ${newScore.toFixed(1)} (Δ +${scoreDelta.toFixed(1)} on 0-10 scale), verified by ${record.verifyingAuditor || 'Accredited Inspection'}.`;

  return {
    dimensionKey,
    targetDimension,
    previousScore: prevScore,
    newScore,
    scoreDelta,
    recalculationJustification: justification,
  };
}
