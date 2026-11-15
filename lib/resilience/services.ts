/**
 * Essential Services Continuity Monitoring Module
 * 
 * Tracks operational status of critical public facilities during and after disasters:
 * - 7 Essential Service Types
 * - Strict verification check: Unverified records cannot be OPERATIONAL
 * - Advisory cue integration from Flood Agent and Route Agent (never auto-disrupts)
 * - Disruption duration calculation and alternative service tracking
 * - Automatic transition history generation
 */

import {
  EssentialServiceHistoryDTO,
  EssentialServiceRecordDTO,
  EssentialServiceType,
  ServiceOperationalStatus,
} from './types';

export const ESSENTIAL_SERVICE_LABELS: Record<EssentialServiceType, { title: string; icon: string; description: string }> = {
  DRINKING_WATER: {
    title: 'Drinking Water Supply & Filtration',
    icon: 'droplet',
    description: 'Filtration plants, municipal pipelines, tube-wells, and water storage reservoirs.',
  },
  HEALTHCARE_FACILITY: {
    title: 'Healthcare Facilities & Trauma Units',
    icon: 'activity',
    description: 'Taluka headquarters hospitals, Basic Health Units (BHU), and mobile clinics.',
  },
  SANITATION_SEWERAGE: {
    title: 'Sanitation & Flood Drainage Corridors',
    icon: 'wind',
    description: 'Main drainage outfalls, municipal sewer pumping stations, and stormwater canals.',
  },
  ELECTRICITY_GRID: {
    title: 'Electricity Grid & Feeder Stations',
    icon: 'zap',
    description: '132kV / 11kV grid stations, distribution transformers, and solar micro-grids.',
  },
  TELECOMMUNICATIONS: {
    title: 'Telecommunications & Cellular Towers',
    icon: 'radio',
    description: 'Cellular base transceiver stations (BTS), fiber transmission links, and VHF radio.',
  },
  ROADS_ACCESS_CORRIDOR: {
    title: 'Roads & Emergency Relief Corridors',
    icon: 'truck',
    description: 'Critical causeways, arterial highways, and bridges required for humanitarian access.',
  },
  EVACUATION_SHELTER: {
    title: 'Designated Evacuation Shelters',
    icon: 'shield',
    description: 'Pukka schools, college campuses, and community halls equipped for flood displacement.',
  },
};

/**
 * Validates service record state according to database constraint rules
 */
export function validateServiceRecord(record: Partial<EssentialServiceRecordDTO>): void {
  if (record.isVerified === false || !record.isVerified) {
    if (record.status && ['OPERATIONAL', 'FULLY_RESTORED'].includes(record.status)) {
      throw new Error(`Integrity Violation: An unverified service record cannot have confirmed operational status '${record.status}'. Must be UNVERIFIED_REPORT or POTENTIAL_DISRUPTION_FLAGGED.`);
    }
  } else if (record.isVerified === true) {
    if (!record.verifiedBy || record.verifiedBy.trim().length === 0) {
      throw new Error('Integrity Violation: A verified service record requires an accredited verifiedBy entity.');
    }
    if (!record.verifiedAt) {
      throw new Error('Integrity Violation: A verified service record requires a verifiedAt timestamp.');
    }
  }
}

/**
 * Evaluates advisory signal from existing AI agents (Flood Agent, Route Agent, and SOS volume)
 * strictly as an advisory cue requiring human field inspection.
 */
export function evaluateAgentAdvisoryCue(
  facility: EssentialServiceRecordDTO,
  floodSeverity: number, // from Flood Agent (1-10)
  roadPassable: boolean,  // from Route Agent
  sosClusterCount: number // SOS requests within 5km radius
): {
  shouldFlagCue: boolean;
  recommendedStatus: ServiceOperationalStatus;
  advisoryNote: string;
} {
  // If already verified disrupted or restored, don't override human verification
  if (facility.isVerified && facility.status === 'VERIFIED_DISRUPTED') {
    return {
      shouldFlagCue: false,
      recommendedStatus: facility.status,
      advisoryNote: 'Facility is already verified disrupted by field inspector.',
    };
  }

  // Multi-agent advisory criteria:
  // 1. SOS cluster >= 3 in facility catchment area
  // 2. Flood severity >= 7.0 OR Road impassable
  if (sosClusterCount >= 3 || (floodSeverity >= 7.0 && !roadPassable)) {
    return {
      shouldFlagCue: true,
      recommendedStatus: 'POTENTIAL_DISRUPTION_FLAGGED',
      advisoryNote: `Advisory cue: ${sosClusterCount} SOS requests clustered near facility. Flood severity score: ${floodSeverity}/10. Road passable: ${roadPassable ? 'Yes' : 'No'}. Requires human verification.`,
    };
  }

  return {
    shouldFlagCue: false,
    recommendedStatus: facility.status,
    advisoryNote: 'Telemetry indicates normal service operational range.',
  };
}

/**
 * Creates an immutable transition history entry whenever service status changes
 */
export function createStatusTransitionHistory(
  service: EssentialServiceRecordDTO,
  newStatus: ServiceOperationalStatus,
  actorName: string,
  actorRole: string,
  notes?: string
): EssentialServiceHistoryDTO {
  let durationHrs: number | null = null;
  if (service.disruptionTriggeredAt) {
    const start = new Date(service.disruptionTriggeredAt).getTime();
    const end = Date.now();
    durationHrs = Math.max(0, Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10);
  }

  return {
    serviceRecordId: service.id ?? 1,
    fromStatus: service.status,
    toStatus: newStatus,
    isVerified: service.isVerified,
    disruptionDurationHrs: durationHrs,
    alternativeServicesInUse: service.alternativeServicesInUse,
    actorName,
    actorRole,
    notes: notes || `Status updated from ${service.status} to ${newStatus}`,
    sourceEvidenceUrl: service.sourceEvidenceUrl,
    dataProvenance: service.dataProvenance,
    timestamp: new Date().toISOString(),
  };
}
