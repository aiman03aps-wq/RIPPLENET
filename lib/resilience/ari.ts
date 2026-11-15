/**
 * Post-Disaster Adaptation Recovery Index (ARI) Engine
 * 
 * Tracks multi-sector recovery trajectory following disaster events:
 * - 7 Essential Sectors with documented weights (Water, Health, Sanitation, Housing, Roads, Education, Livelihoods)
 * - Missing sector metrics are strictly null (never assumed to be 0% recovery)
 * - Transparent weight renormalization for available sectors
 * - Requires verified baseline assessment date and accredited lead agency
 * - Minimum evidence gating: Requires >= 4 sectors for official aggregate score
 * - Simulation gating: Simulated data strictly flagged as SIMULATED_ARI
 */

import {
  AriEvidenceStatus,
  AriSectorBreakdown,
  DataProvenance,
  SectorRecoveryEvidence,
} from './types';

export interface AriSectorDefinition {
  key: keyof AriSectorBreakdown;
  label: string;
  weight: number;
  unit: string;
  description: string;
  verificationEvidenceRequired: string;
}

export const ARI_SECTOR_DEFINITIONS: AriSectorDefinition[] = [
  {
    key: 'waterRestoration',
    label: 'Drinking Water Infrastructure',
    weight: 0.20,
    unit: '% of pre-disaster potable volume restored',
    description: 'Chlorinated, potable water supply network and water filtration plant operations restored.',
    verificationEvidenceRequired: 'Bacteriological lab test clearance + municipal water flow telemetry.',
  },
  {
    key: 'healthcareRestoration',
    label: 'Healthcare Facility Functionality',
    weight: 0.20,
    unit: '% of emergency & primary health centers active',
    description: 'Staffed Rural Health Centers (RHC), Basic Health Units (BHU), and Taluka emergency rooms operational.',
    verificationEvidenceRequired: 'District Health Officer (DHO) physical staffing roster & cold-chain audit.',
  },
  {
    key: 'sanitationRestoration',
    label: 'Sanitation & Drainage Clearance',
    weight: 0.15,
    unit: '% of stagnant inundation drained & sewers cleared',
    description: 'Removal of standing floodwaters in residential zones and desilting of blocked main sewer drains.',
    verificationEvidenceRequired: 'Municipal sludge disposal log + engineering dewatering station telemetry.',
  },
  {
    key: 'housingRestoration',
    label: 'Permanent Housing Rehabilitation',
    weight: 0.15,
    unit: '% of damaged houses rebuilt/repaired to safe standard',
    description: 'Rebuilding of destroyed (pukka) and partially damaged houses meeting flood-resistant resilience codes.',
    verificationEvidenceRequired: 'Third-party engineering structural certificate + geotagged completion proof.',
  },
  {
    key: 'roadsRestoration',
    label: 'Roads & Access Corridor Passability',
    weight: 0.15,
    unit: '% of primary & arterial road km passable by relief vehicles',
    description: 'Restoration of key highways, culverts, causeways, and bridges connecting settlements to markets.',
    verificationEvidenceRequired: 'National Highway Authority (NHA) / C&W Department road passability verification.',
  },
  {
    key: 'educationRestoration',
    label: 'Educational Facilities Resumed',
    weight: 0.08,
    unit: '% of schools cleared of floodwater and de-sheltered',
    description: 'Schools de-requisitioned from emergency shelter use, decontaminated, and reopened for classes.',
    verificationEvidenceRequired: 'District Education Officer (DEO) school attendance resumption report.',
  },
  {
    key: 'livelihoodsRestoration',
    label: 'Agricultural & Small Business Restart',
    weight: 0.07,
    unit: '% of agricultural land recultivated / micro-markets reopened',
    description: 'Drainage of inundated croplands, provision of Rabi/Kharif seed packages, and bazaar reopening.',
    verificationEvidenceRequired: 'Agriculture Extension Department field survey + farmer association verification.',
  },
];

export interface AriCalculationResult {
  aggregateRecoveryIndex: number | null; // 0.0 - 100.0%
  evidenceStatus: AriEvidenceStatus;
  availableSectorsCount: number;
  totalSectorsCount: number;
  hasSimulatedData: boolean;
  sectorPercentages: Record<string, number | null>;
  normalizedWeights: Record<string, number>;
  gatingReason?: string;
}

/**
 * Calculates Post-Disaster Adaptation Recovery Index (ARI) with strict evidence gating
 */
export function calculateAdaptationRecoveryIndex(
  sectors: AriSectorBreakdown,
  baselineAssessmentDate: string,
  leadAgency: string,
  overallProvenance: DataProvenance
): AriCalculationResult {
  let hasSimulated = overallProvenance === 'SIMULATED_DEMONSTRATION';
  let availableWeightSum = 0;
  let weightedPctSum = 0;
  let availableCount = 0;
  const sectorPercentages: Record<string, number | null> = {};
  const normalizedWeights: Record<string, number> = {};

  for (const def of ARI_SECTOR_DEFINITIONS) {
    const sectorEv: SectorRecoveryEvidence | undefined = sectors[def.key];
    const isAvail = sectorEv && sectorEv.available && sectorEv.pct !== null && sectorEv.pct !== undefined;

    if (sectorEv?.isSimulated) {
      hasSimulated = true;
    }

    if (isAvail) {
      const pct = Math.max(0, Math.min(100, sectorEv.pct!));
      sectorPercentages[def.key] = pct;
      availableWeightSum += def.weight;
      weightedPctSum += pct * def.weight;
      availableCount += 1;
    } else {
      sectorPercentages[def.key] = null;
    }
  }

  // Baseline and Lead Agency Gating:
  if (!baselineAssessmentDate || !leadAgency || leadAgency.trim().length === 0) {
    return {
      aggregateRecoveryIndex: null,
      evidenceStatus: 'INSUFFICIENT_DATA',
      availableSectorsCount: availableCount,
      totalSectorsCount: ARI_SECTOR_DEFINITIONS.length,
      hasSimulatedData: hasSimulated,
      sectorPercentages,
      normalizedWeights,
      gatingReason: 'Recovery tracking requires a documented baselineAssessmentDate and accredited leadAgency.',
    };
  }

  // Minimum Sector Breadth Gate: Requires at least 4 sectors (minimum 57% coverage)
  if (availableCount < 4) {
    return {
      aggregateRecoveryIndex: null,
      evidenceStatus: 'INSUFFICIENT_DATA',
      availableSectorsCount: availableCount,
      totalSectorsCount: ARI_SECTOR_DEFINITIONS.length,
      hasSimulatedData: hasSimulated,
      sectorPercentages,
      normalizedWeights,
      gatingReason: `Insufficient sector evidence: Only ${availableCount} of 7 recovery sectors reported (minimum 4 required for aggregate ARI).`,
    };
  }

  // Weight Renormalization
  for (const def of ARI_SECTOR_DEFINITIONS) {
    if (sectorPercentages[def.key] !== null) {
      normalizedWeights[def.key] = Math.round((def.weight / availableWeightSum) * 1000) / 1000;
    } else {
      normalizedWeights[def.key] = 0;
    }
  }

  // Calculate aggregate recovery index on 0 - 100 scale
  const rawAri = weightedPctSum / availableWeightSum;
  const aggregateRecoveryIndex = Math.round(rawAri * 10) / 10;

  const evidenceStatus: AriEvidenceStatus = hasSimulated ? 'SIMULATED_ARI' : 'OFFICIAL_ARI';

  return {
    aggregateRecoveryIndex,
    evidenceStatus,
    availableSectorsCount: availableCount,
    totalSectorsCount: ARI_SECTOR_DEFINITIONS.length,
    hasSimulatedData: hasSimulated,
    sectorPercentages,
    normalizedWeights,
  };
}
