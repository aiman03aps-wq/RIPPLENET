/**
 * Community Resilience Index (CRI) Engine
 * 
 * Transparent, rule-based 8-dimension assessment methodology:
 * - All dimensions consistently oriented: higher score = greater resilience (0.0 - 10.0)
 * - Fixed reference thresholds (no dynamic min-max stretching across DB)
 * - Weight renormalization for missing/unassessed dimensions
 * - Evidence gating: Requires >= 4 verified dimensions to produce a composite CRI
 * - Data Confidence Score (DCS) separated from CRI score
 * - Simulation detection: Any simulated dimension disqualifies from OFFICIAL_CRI
 */

import {
  CriDimensionBreakdown,
  CriEvidenceStatus,
  DataProvenance,
  DimensionEvidence,
} from './types';

export interface CriDimensionWeight {
  key: keyof CriDimensionBreakdown;
  label: string;
  weight: number;
  description: string;
  referenceThreshold: string;
}

export const CRI_DIMENSION_WEIGHTS: CriDimensionWeight[] = [
  {
    key: 'housingResilience',
    label: 'Housing Resilience (D1)',
    weight: 0.15,
    description: 'Structural integrity: ratio of pukka/reinforced concrete dwellings to total housing stock.',
    referenceThreshold: '10 = 100% reinforced pukka dwellings; 0 = 100% katcha mud/thatch.',
  },
  {
    key: 'waterAccessScore',
    label: 'Safe Water Access (D2)',
    weight: 0.15,
    description: 'Potable water security: fraction of community with elevated, protected tube-wells or piped supply.',
    referenceThreshold: '10 = 100% access to flood-protected safe drinking source; 0 = 0% protected.',
  },
  {
    key: 'healthcareAccessScore',
    label: 'Healthcare Access (D3)',
    weight: 0.15,
    description: 'Emergency medical access: physical proximity to nearest functional emergency medical facility.',
    referenceThreshold: '10 = facility <= 2km (or <=15 min); 0 = facility >= 20km.',
  },
  {
    key: 'sanitationScore',
    label: 'Covered Sanitation (D4)',
    weight: 0.10,
    description: 'Sanitary safety: proportion of population with covered drainage and flood-proof pour-flush latrines.',
    referenceThreshold: '10 = 100% covered drainage / sealed latrines; 0 = open defecation / uncovered gutters.',
  },
  {
    key: 'earlyWarningScore',
    label: 'Early Warning Dissemination (D5)',
    weight: 0.15,
    description: 'Early warning reach: percent of community receiving SMS, siren, or mosque-broadcast flood alerts.',
    referenceThreshold: '10 = 100% multi-channel alert coverage with tested drills; 0 = no alert mechanism.',
  },
  {
    key: 'evacuationCapacity',
    label: 'Evacuation Shelter Capacity (D6)',
    weight: 0.15,
    description: 'Shelter readiness: designated emergency shelter beds per 1,000 residents in flood-safe buildings.',
    referenceThreshold: '10 = >= 250 verified shelter beds per 1k population; 0 = 0 designated beds.',
  },
  {
    key: 'disasterPreparedness',
    label: 'Disaster Preparedness (D7)',
    weight: 0.08,
    description: 'Institutional readiness: trained Village Disaster Management Committee (VDMC) + emergency stock stockpile.',
    referenceThreshold: '10 = Active VDMC, documented SOPs, trained rescue volunteers, sandbag stock.',
  },
  {
    key: 'socialSupportIndex',
    label: 'Social Support & Volunteer Density (D8)',
    weight: 0.07,
    description: 'Social capital: active registered humanitarian volunteers per 1,000 residents.',
    referenceThreshold: '10 = >= 15 trained community volunteers per 1,000 residents; 0 = 0 volunteers.',
  },
];

export interface CriCalculationResult {
  compositeScore: number | null; // 0.0 - 100.0 scale
  confidenceScore: number;       // Data Confidence Score (DCS): 0.0 - 100.0%
  evidenceStatus: CriEvidenceStatus;
  hasSimulatedData: boolean;
  availableDimensionsCount: number;
  totalDimensionsCount: number;
  normalizedWeights: Record<string, number>;
  dimensionScores: Record<string, number | null>;
  gatingReason?: string;
}

/**
 * Calculates Community Resilience Index (CRI) with rigorous evidence gating
 */
export function calculateCommunityResilienceIndex(
  dimensions: CriDimensionBreakdown,
  overallProvenance: DataProvenance
): CriCalculationResult {
  let hasSimulated = overallProvenance === 'SIMULATED_DEMONSTRATION';
  let availableWeightSum = 0;
  let weightedScoreSum = 0;
  let availableCount = 0;
  const normalizedWeights: Record<string, number> = {};
  const dimensionScores: Record<string, number | null> = {};

  let freshnessScoreSum = 0;

  for (const def of CRI_DIMENSION_WEIGHTS) {
    const dimEvidence: DimensionEvidence | undefined = dimensions[def.key];
    const isAvail = dimEvidence && dimEvidence.available && dimEvidence.score !== null && dimEvidence.score !== undefined;

    if (dimEvidence?.isSimulated) {
      hasSimulated = true;
    }

    if (isAvail) {
      const score = Math.max(0, Math.min(10, dimEvidence.score!));
      dimensionScores[def.key] = score;
      availableWeightSum += def.weight;
      weightedScoreSum += score * def.weight;
      availableCount += 1;

      // Freshness factor for Data Confidence Score (DCS)
      // 0-6 months = 1.0, 7-18 months = 0.8, 19-36 months = 0.6, >36 months = 0.4
      const months = dimEvidence.freshnessMonths ?? 12;
      let freshness = 1.0;
      if (months > 36) freshness = 0.4;
      else if (months > 18) freshness = 0.6;
      else if (months > 6) freshness = 0.8;

      // Source credibility factor:
      // VERIFIED_FIELD_OBSERVATION = 1.0, EXTERNAL_SENSOR = 0.9, ADMINISTRATOR = 0.85, COMMUNITY = 0.7, SIMULATED = 0.3
      let cred = 0.7;
      if (dimEvidence.provenance === 'VERIFIED_FIELD_OBSERVATION') cred = 1.0;
      else if (dimEvidence.provenance === 'EXTERNAL_SENSOR_FEED') cred = 0.9;
      else if (dimEvidence.provenance === 'ADMINISTRATOR_ENTERED') cred = 0.85;
      else if (dimEvidence.provenance === 'COMMUNITY_REPORTED') cred = 0.75;
      else if (dimEvidence.provenance === 'SIMULATED_DEMONSTRATION') cred = 0.4;

      freshnessScoreSum += (freshness * cred);
    } else {
      dimensionScores[def.key] = null;
    }
  }

  // Calculate Data Confidence Score (DCS) independently
  // Max possible is 8 dimensions * 1.0 = 8.0 -> scaled to 100%
  const confidenceScore = Math.round((freshnessScoreSum / CRI_DIMENSION_WEIGHTS.length) * 1000) / 10;

  // Minimum Evidence Gate: Requires at least 4 available dimensions (50% of framework)
  if (availableCount < 4) {
    return {
      compositeScore: null,
      confidenceScore,
      evidenceStatus: 'INSUFFICIENT_DATA',
      hasSimulatedData: hasSimulated,
      availableDimensionsCount: availableCount,
      totalDimensionsCount: CRI_DIMENSION_WEIGHTS.length,
      normalizedWeights,
      dimensionScores,
      gatingReason: `Minimum evidence requirement not met: Only ${availableCount} of 8 dimensions available (minimum 4 required).`,
    };
  }

  // Renormalize weights across available dimensions
  for (const def of CRI_DIMENSION_WEIGHTS) {
    if (dimensionScores[def.key] !== null) {
      normalizedWeights[def.key] = Math.round((def.weight / availableWeightSum) * 1000) / 1000;
    } else {
      normalizedWeights[def.key] = 0;
    }
  }

  // Calculate composite CRI score on 0 - 100 scale
  const rawScore = (weightedScoreSum / availableWeightSum) * 10;
  const compositeScore = Math.round(rawScore * 10) / 10;

  // Evidence Status Classification
  const evidenceStatus: CriEvidenceStatus = hasSimulated ? 'SIMULATED_CRI' : 'OFFICIAL_CRI';

  return {
    compositeScore,
    confidenceScore,
    evidenceStatus,
    hasSimulatedData: hasSimulated,
    availableDimensionsCount: availableCount,
    totalDimensionsCount: CRI_DIMENSION_WEIGHTS.length,
    normalizedWeights,
    dimensionScores,
  };
}
