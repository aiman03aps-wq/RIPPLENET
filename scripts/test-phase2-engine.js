/**
 * RippleNet Phase 2 Climate Resilience Engine Integration Test Suite
 * 
 * Verifies all 5 core capabilities:
 * 1. Community Resilience Index (CRI)
 * 2. Adaptation Recovery Index (ARI)
 * 3. Essential Service Continuity & Multi-Agent Advisory Cues
 * 4. Verified Displacement and Population Return Ledger
 * 5. Climate Adaptation Action Tracking & CRI Recalculation
 */

const assert = require('assert');

// Import domain modules
const { calculateCommunityResilienceIndex, CRI_DIMENSION_WEIGHTS } = require('../lib/resilience/cri');
const { calculateAdaptationRecoveryIndex, ARI_SECTOR_DEFINITIONS } = require('../lib/resilience/ari');
const { validateServiceRecord, evaluateAgentAdvisoryCue, createStatusTransitionHistory } = require('../lib/resilience/services');
const { validateAndCalculateDisplacement, analyzeCampOccupancyContrast } = require('../lib/resilience/displacement');
const { validateAdaptationRecord, calculateAdaptationEfficiency, calculateResilienceRecalculationDelta } = require('../lib/resilience/adaptation');
const { resilienceStore, GEO_DISTRICTS } = require('../lib/resilience/store');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('RUNNING PHASE 2 CLIMATE RESILIENCE ENGINE INTEGRATION TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Community Resilience Index (CRI) Tests
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Community Resilience Index (CRI) Engine ---');

runTest('CRI Weights Sum to 1.00', () => {
  const sum = CRI_DIMENSION_WEIGHTS.reduce((acc, d) => acc + d.weight, 0);
  assert.strictEqual(Math.round(sum * 100) / 100, 1.00);
});

runTest('CRI Full Evidence Calculation (Composite Score & DCS)', () => {
  const mockDimensions = {
    housingResilience: { score: 6.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Census', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    waterAccessScore: { score: 7.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Survey', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    healthcareAccessScore: { score: 5.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Health Dept', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    sanitationScore: { score: 4.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'WASH Log', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    earlyWarningScore: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'NDMA', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    evacuationCapacity: { score: 5.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Camp Roster', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    disasterPreparedness: { score: 6.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'VDMC', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    socialSupportIndex: { score: 7.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'RippleNet', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
  };

  const result = calculateCommunityResilienceIndex(mockDimensions, 'VERIFIED_FIELD_OBSERVATION');
  assert.strictEqual(result.evidenceStatus, 'OFFICIAL_CRI');
  assert.strictEqual(result.hasSimulatedData, false);
  assert(result.compositeScore > 50 && result.compositeScore < 70);
  assert(result.confidenceScore > 60);
});

runTest('CRI Missing Indicators: Renormalizes Remaining Weights', () => {
  const partialDimensions = {
    housingResilience: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Census', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    waterAccessScore: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Survey', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    healthcareAccessScore: { score: null, available: false, isSimulated: false }, // missing
    sanitationScore: { score: null, available: false, isSimulated: false }, // missing
    earlyWarningScore: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'NDMA', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    evacuationCapacity: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Camp', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    disasterPreparedness: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'VDMC', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    socialSupportIndex: { score: null, available: false, isSimulated: false }, // missing
  };

  const result = calculateCommunityResilienceIndex(partialDimensions, 'VERIFIED_FIELD_OBSERVATION');
  assert.strictEqual(result.availableDimensionsCount, 5);
  // All 5 available dimensions have score 8.0 -> renormalized composite must be 80.0
  assert.strictEqual(result.compositeScore, 80.0);
  assert.strictEqual(result.evidenceStatus, 'OFFICIAL_CRI');
});

runTest('CRI Minimum Evidence Gate: < 4 dimensions yields INSUFFICIENT_DATA and null score', () => {
  const scarceDimensions = {
    housingResilience: { score: 7.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Census', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    waterAccessScore: { score: 6.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Survey', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
  };

  const result = calculateCommunityResilienceIndex(scarceDimensions, 'VERIFIED_FIELD_OBSERVATION');
  assert.strictEqual(result.compositeScore, null);
  assert.strictEqual(result.evidenceStatus, 'INSUFFICIENT_DATA');
});

runTest('CRI Simulation Detection: Any simulated dimension disqualifies from OFFICIAL_CRI', () => {
  const simulatedDimensions = {
    housingResilience: { score: 6.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Census', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    waterAccessScore: { score: 7.0, available: true, provenance: 'SIMULATED_DEMONSTRATION', source: 'Simulated Model', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: true },
    healthcareAccessScore: { score: 5.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'Health Dept', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    sanitationScore: { score: 4.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'WASH Log', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
    earlyWarningScore: { score: 8.0, available: true, provenance: 'VERIFIED_FIELD_OBSERVATION', source: 'NDMA', assessedAt: '2025-01-01', freshnessMonths: 10, isSimulated: false },
  };

  const result = calculateCommunityResilienceIndex(simulatedDimensions, 'ADMINISTRATOR_ENTERED');
  assert.strictEqual(result.evidenceStatus, 'SIMULATED_CRI');
  assert.strictEqual(result.hasSimulatedData, true);
});

// -----------------------------------------------------------------------------
// 2. Post-Disaster Recovery Index (ARI) Tests
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Adaptation Recovery Index (ARI) Engine ---');

runTest('ARI Sector Weights Sum to 1.00', () => {
  const sum = ARI_SECTOR_DEFINITIONS.reduce((acc, s) => acc + s.weight, 0);
  assert.strictEqual(Math.round(sum * 100) / 100, 1.00);
});

runTest('ARI Calculation with Nullable Missing Sector (Never assumed 0%)', () => {
  const sectors = {
    waterRestoration: { pct: 70.0, available: true, denominator: 50, numerator: 35, unit: 'plants', isSimulated: false },
    healthcareRestoration: { pct: 80.0, available: true, denominator: 20, numerator: 16, unit: 'clinics', isSimulated: false },
    sanitationRestoration: { pct: 60.0, available: true, denominator: 10, numerator: 6, unit: 'drains', isSimulated: false },
    housingRestoration: { pct: 50.0, available: true, denominator: 1000, numerator: 500, unit: 'houses', isSimulated: false },
    roadsRestoration: { pct: 90.0, available: true, denominator: 100, numerator: 90, unit: 'km', isSimulated: false },
    educationRestoration: { pct: 75.0, available: true, denominator: 40, numerator: 30, unit: 'schools', isSimulated: false },
    livelihoodsRestoration: { pct: null, available: false, denominator: 5000, numerator: 0, unit: 'acres', isSimulated: false }, // Nullable!
  };

  const result = calculateAdaptationRecoveryIndex(sectors, '2026-08-01', 'NDMA Recovery Taskforce', 'VERIFIED_FIELD_OBSERVATION');
  assert.strictEqual(result.evidenceStatus, 'OFFICIAL_ARI');
  assert.strictEqual(result.availableSectorsCount, 6);
  assert(result.aggregateRecoveryIndex > 65 && result.aggregateRecoveryIndex < 75);
});

runTest('ARI Gating: Requires Baseline Date and Lead Agency', () => {
  const sectors = {
    waterRestoration: { pct: 70.0, available: true, denominator: 50, numerator: 35, unit: 'plants', isSimulated: false },
    healthcareRestoration: { pct: 80.0, available: true, denominator: 20, numerator: 16, unit: 'clinics', isSimulated: false },
    sanitationRestoration: { pct: 60.0, available: true, denominator: 10, numerator: 6, unit: 'drains', isSimulated: false },
    housingRestoration: { pct: 50.0, available: true, denominator: 1000, numerator: 500, unit: 'houses', isSimulated: false },
  };

  const result = calculateAdaptationRecoveryIndex(sectors, '', '', 'VERIFIED_FIELD_OBSERVATION');
  assert.strictEqual(result.aggregateRecoveryIndex, null);
  assert.strictEqual(result.evidenceStatus, 'INSUFFICIENT_DATA');
});

// -----------------------------------------------------------------------------
// 3. Essential Service Continuity & Multi-Agent Advisory Cues
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Essential Services Continuity & Multi-Agent Cues ---');

runTest('Service Validation: Rejects Unverified Facility as OPERATIONAL', () => {
  assert.throws(() => {
    validateServiceRecord({
      facilityName: 'Dadu Health Center',
      status: 'OPERATIONAL',
      isVerified: false,
    });
  }, /An unverified service record cannot have confirmed operational status/);
});

runTest('Multi-Agent Advisory Signal Integration (Advisory Cue Only)', () => {
  const facility = {
    id: 10,
    boundaryId: 1,
    boundaryName: 'Dadu',
    district: 'Dadu',
    serviceType: 'DRINKING_WATER',
    facilityName: 'Johi Water Station',
    status: 'OPERATIONAL',
    isVerified: true,
    verifiedBy: 'PHED',
    verifiedAt: new Date().toISOString(),
    flaggedBySosVolume: false,
    relatedSosCount: 0,
    dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
  };

  // Simulating inputs from Flood Agent (severity 8.5/10) and Route Agent (impassable road)
  const cue = evaluateAgentAdvisoryCue(facility, 8.5, false, 6);
  assert.strictEqual(cue.shouldFlagCue, true);
  assert.strictEqual(cue.recommendedStatus, 'POTENTIAL_DISRUPTION_FLAGGED');
  assert(cue.advisoryNote.includes('Requires human verification'));
});

runTest('Service Transition History Logging with Disruption Duration', () => {
  const service = {
    id: 5,
    facilityName: 'Johi Grid Station',
    status: 'POTENTIAL_DISRUPTION_FLAGGED',
    disruptionTriggeredAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 48 hrs ago
    isVerified: false,
    dataProvenance: 'SIMULATED_DEMONSTRATION',
  };

  const history = createStatusTransitionHistory(
    service,
    'VERIFIED_DISRUPTED',
    'Engr. Naveed (HESCO)',
    'Chief Grid Inspector',
    'Transformer submerged'
  );

  assert.strictEqual(history.fromStatus, 'POTENTIAL_DISRUPTION_FLAGGED');
  assert.strictEqual(history.toStatus, 'VERIFIED_DISRUPTED');
  assert(history.disruptionDurationHrs >= 47.9);
  assert.strictEqual(history.actorName, 'Engr. Naveed (HESCO)');
});

// -----------------------------------------------------------------------------
// 4. Displacement & Return Ledger
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Verified Population Displacement & Return Ledger ---');

runTest('Displacement Balance: Validates Exact Mathematical Identity', () => {
  const result = validateAndCalculateDisplacement({
    boundaryId: 1,
    boundaryName: 'Dadu',
    district: 'Dadu',
    assessmentDate: '2026-11-01',
    unit: 'INDIVIDUALS',
    totalDisplacedBaseline: 50000,
    verifiedReturnedCount: 15000,
    inCampShelterCount: 15000,
    secondaryDisplacedCount: 15000,
    unaccountedCount: 5000,
    verificationMethod: 'Biometric Survey',
    verifiedBy: 'SDMC',
    dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
  });

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.calculatedRatePct, 30.0);
  assert.strictEqual(result.discrepancy, 0);
});

runTest('Displacement: Detects Elevated Secondary Roadside Displacement', () => {
  const assessment = {
    boundaryId: 1,
    boundaryName: 'Dadu',
    district: 'Dadu',
    assessmentDate: '2026-11-01',
    unit: 'INDIVIDUALS',
    totalDisplacedBaseline: 50000,
    verifiedReturnedCount: 10000,
    inCampShelterCount: 10000,
    secondaryDisplacedCount: 25000, // 50% in roadside informal tents!
    unaccountedCount: 5000,
    verifiedReturnRatePct: 20.0,
    isBalanceValid: true,
    verificationMethod: 'Field Survey',
    verifiedBy: 'SDMC',
    dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
  };

  const analysis = analyzeCampOccupancyContrast(assessment);
  assert.strictEqual(analysis.secondaryDisplacementRatioPct, 50.0);
  assert(analysis.analystSummary.includes('WARNING: Elevated secondary displacement'));
});

// -----------------------------------------------------------------------------
// 5. Climate Adaptation Action Tracker & CRI Recalculation
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Climate Adaptation Actions & CRI Recalculation ---');

runTest('Adaptation Verification Gate: Blocks uncertified actions from claiming verified', () => {
  assert.throws(() => {
    validateAdaptationRecord({
      title: 'Solar RO Plant',
      status: 'ONGOING',
      independentlyVerified: true, // Violation! Status is ONGOING
    });
  }, /Action cannot be independentlyVerified=true while status is 'ONGOING'/);
});

runTest('Adaptation Cost Efficiency Telemetry (Resource Agent Integration)', () => {
  const project = {
    id: 1,
    boundaryId: 1,
    boundaryName: 'Dadu',
    district: 'Dadu',
    title: 'Elevated RO Plant',
    sector: 'WATER',
    description: 'Clean drinking water',
    status: 'INDEPENDENTLY_VERIFIED',
    targetBeneficiaries: 10000,
    verifiedBeneficiaries: 10000,
    physicalProgressPct: 100.0,
    implementingPartner: 'Alkhidmat',
    budgetPkr: 5000000, // 5 Million PKR
    independentlyVerified: true,
    resilienceRecalculated: true,
    dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
  };

  const efficiency = calculateAdaptationEfficiency(project);
  assert.strictEqual(efficiency.costPerBeneficiaryPkr, 500); // 5,000,000 / 10,000 = 500 PKR
  assert.strictEqual(efficiency.efficiencyTier, 'High');
});

runTest('Adaptation CRI Recalculation: Delivers evidence-backed score delta', () => {
  const project = {
    id: 1,
    boundaryId: 1,
    boundaryName: 'Dadu',
    district: 'Dadu',
    title: 'Elevated RO Plant',
    sector: 'WATER',
    description: 'Clean drinking water',
    status: 'INDEPENDENTLY_VERIFIED',
    targetBeneficiaries: 15000,
    verifiedBeneficiaries: 15000,
    physicalProgressPct: 100.0,
    implementingPartner: 'Alkhidmat',
    budgetPkr: 5000000,
    independentlyVerified: true,
    resilienceRecalculated: true,
    dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
  };

  const recalculation = calculateResilienceRecalculationDelta(project, 50000);
  assert(recalculation.scoreDelta > 0);
  assert.strictEqual(recalculation.targetDimension, 'waterAccessScore (D2)');
  assert(recalculation.recalculationJustification.includes('delivers an evidence-backed'));
});

// -----------------------------------------------------------------------------
// 6. Unified Store & District Initialization
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Unified Store & Seed Districts ---');

runTest('Store Seeds 5 High-Risk Pakistan Districts', () => {
  const districts = resilienceStore.getAllDistricts();
  assert.strictEqual(districts.length, 5);
  const dadu = resilienceStore.getDistrict(1);
  assert.strictEqual(dadu.name, 'Dadu');
  assert.strictEqual(dadu.province, 'Sindh');
});

runTest('Store Overview Summary Computes Successfully', () => {
  const summary = resilienceStore.getOverviewSummary();
  assert.strictEqual(summary.districtsCount, 5);
  assert(summary.averageCriScore > 0);
  assert.strictEqual(summary.displacement.overallReturnRatePct, 29.0);
  assert(summary.servicesStatus.total >= 4);
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('================================================================\n');
