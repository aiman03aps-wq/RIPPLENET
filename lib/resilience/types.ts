/**
 * RippleNet Climate Resilience, Services Continuity, Recovery & Adaptation Engine
 * TypeScript Data Models, Enums & Interfaces
 */

export type DataProvenance =
  | 'VERIFIED_FIELD_OBSERVATION'
  | 'COMMUNITY_REPORTED'
  | 'ADMINISTRATOR_ENTERED'
  | 'EXTERNAL_SENSOR_FEED'
  | 'SIMULATED_DEMONSTRATION';

export type AdminLevel = 'DISTRICT' | 'TEHSIL' | 'UNION_COUNCIL' | 'COMMUNITY';

export type CriEvidenceStatus = 'OFFICIAL_CRI' | 'SIMULATED_CRI' | 'INSUFFICIENT_DATA';

export type AriEvidenceStatus = 'OFFICIAL_ARI' | 'SIMULATED_ARI' | 'INSUFFICIENT_DATA';

export type ServiceOperationalStatus =
  | 'UNVERIFIED_REPORT'
  | 'OPERATIONAL'
  | 'POTENTIAL_DISRUPTION_FLAGGED'
  | 'VERIFIED_DISRUPTED'
  | 'PARTIALLY_RESTORED'
  | 'FULLY_RESTORED';

export type EssentialServiceType =
  | 'DRINKING_WATER'
  | 'HEALTHCARE_FACILITY'
  | 'SANITATION_SEWERAGE'
  | 'ELECTRICITY_GRID'
  | 'TELECOMMUNICATIONS'
  | 'ROADS_ACCESS_CORRIDOR'
  | 'EVACUATION_SHELTER';

export type AdaptationActionStatus =
  | 'PLANNED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'INDEPENDENTLY_VERIFIED';

export type AdaptationSector =
  | 'WATER'
  | 'INFRASTRUCTURE'
  | 'EARLY_WARNING'
  | 'SHELTER'
  | 'SANITATION'
  | 'LIVELIHOODS';

export interface DimensionEvidence {
  score: number | null; // 0.0 - 10.0 scale (higher = more resilient)
  available: boolean;
  provenance: DataProvenance;
  source: string;
  assessedAt: string;
  freshnessMonths: number;
  isSimulated: boolean;
  notes?: string;
}

export interface CriDimensionBreakdown {
  housingResilience: DimensionEvidence;       // D1
  waterAccessScore: DimensionEvidence;        // D2
  healthcareAccessScore: DimensionEvidence;   // D3
  sanitationScore: DimensionEvidence;         // D4
  earlyWarningScore: DimensionEvidence;       // D5
  evacuationCapacity: DimensionEvidence;      // D6
  disasterPreparedness: DimensionEvidence;    // D7
  socialSupportIndex: DimensionEvidence;      // D8
}

export interface ResilienceAssessmentDTO {
  id?: number;
  boundaryId: number;
  boundaryName: string;
  district: string;
  province: string;
  compositeScore: number | null; // 0.0 - 100.0 (null if insufficient evidence)
  confidenceScore: number;       // DCS: 0.0 - 100.0 (separate metric)
  evidenceStatus: CriEvidenceStatus;
  dimensionEvidence: CriDimensionBreakdown;
  hasSimulatedData: boolean;
  overallProvenance: DataProvenance;
  sourceAttribution: string;
  assessedBy: string;
  assessmentDate: string;
  notes?: string;
}

export interface SectorRecoveryEvidence {
  pct: number | null; // 0.0 - 100.0%
  available: boolean;
  denominator: number;
  numerator: number;
  unit: string;
  labReportOrInspectionUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isSimulated: boolean;
}

export interface AriSectorBreakdown {
  waterRestoration: SectorRecoveryEvidence;
  healthcareRestoration: SectorRecoveryEvidence;
  sanitationRestoration: SectorRecoveryEvidence;
  housingRestoration: SectorRecoveryEvidence;
  roadsRestoration: SectorRecoveryEvidence;
  educationRestoration: SectorRecoveryEvidence;
  livelihoodsRestoration: SectorRecoveryEvidence;
}

export interface RecoveryTrackingRecordDTO {
  id?: number;
  boundaryId: number;
  boundaryName: string;
  district: string;
  disasterEventLabel: string;
  baselineAssessmentDate: string;
  daysPostDisaster: number;
  aggregateRecoveryIndex: number | null; // 0.0 - 100.0%
  evidenceStatus: AriEvidenceStatus;
  sectorEvidence: AriSectorBreakdown;
  leadAgency: string;
  dataProvenance: DataProvenance;
  monitoredDate: string;
  fieldNotes?: string;
}

export interface EssentialServiceRecordDTO {
  id?: number;
  boundaryId: number;
  boundaryName: string;
  district: string;
  serviceType: EssentialServiceType;
  facilityName: string;
  status: ServiceOperationalStatus;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  initialVerificationDate?: string | null;
  flaggedBySosVolume: boolean;
  relatedSosCount: number;
  disruptionTriggeredAt?: string | null;
  verifiedDisruptedAt?: string | null;
  restoredAt?: string | null;
  disruptionDurationHrs?: number | null;
  affectedPopulationEstimate?: number | null;
  alternativeServicesInUse?: string | null;
  verificationNotes?: string | null;
  sourceEvidenceUrl?: string | null;
  dataProvenance: DataProvenance;
}

export interface EssentialServiceHistoryDTO {
  id?: number;
  serviceRecordId: number;
  fromStatus: ServiceOperationalStatus | null;
  toStatus: ServiceOperationalStatus;
  isVerified: boolean;
  disruptionDurationHrs?: number | null;
  alternativeServicesInUse?: string | null;
  actorName: string;
  actorRole: string;
  notes?: string | null;
  sourceEvidenceUrl?: string | null;
  dataProvenance: DataProvenance;
  timestamp: string;
}

export interface DisplacementAssessmentDTO {
  id?: number;
  boundaryId: number;
  boundaryName: string;
  district: string;
  assessmentDate: string;
  unit: 'INDIVIDUALS' | 'HOUSEHOLDS';
  totalDisplacedBaseline: number;
  verifiedReturnedCount: number;
  inCampShelterCount: number;
  secondaryDisplacedCount: number;
  unaccountedCount: number;
  verifiedReturnRatePct: number;
  isBalanceValid: boolean;
  verificationMethod: string;
  verifiedBy: string;
  dataProvenance: DataProvenance;
  notes?: string;
}

export interface ClimateAdaptationRecordDTO {
  id?: number;
  boundaryId: number;
  boundaryName: string;
  district: string;
  title: string;
  sector: AdaptationSector;
  description: string;
  status: AdaptationActionStatus;
  targetBeneficiaries: number;
  verifiedBeneficiaries: number;
  physicalProgressPct: number;
  implementingPartner: string;
  leadEngineer?: string | null;
  budgetPkr?: number | null;
  commencedAt?: string | null;
  completedAt?: string | null;
  independentlyVerified: boolean;
  verifiedAt?: string | null;
  verifyingAuditor?: string | null;
  outcomeMetricsJson?: Record<string, any> | null;
  evidenceAttachmentUrl?: string | null;
  resilienceRecalculated: boolean;
  dataProvenance: DataProvenance;
}

export interface AdaptationActionAuditDTO {
  id?: number;
  actionId: number;
  fromStatus: AdaptationActionStatus;
  toStatus: AdaptationActionStatus;
  actorName: string;
  actorRole: string;
  auditNotes?: string | null;
  timestamp: string;
}
