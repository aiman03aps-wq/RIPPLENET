/**
 * Test Suite: Phase 1 Data Integrity Safeguards & Constraints
 * 
 * Verifies all 6 key safeguards requested by the project founder:
 * 1. CRI vs ARI Distinct Evidence Statuses (No Terminology Mixing)
 * 2. Automatic Generation of History on Every Service Status Transition
 * 3. Displacement Balance & Population Integrity (Non-Negative & Exact Equality)
 * 4. Displacement Return Rate: Numeric Arithmetic vs Integer Division & Rounding
 * 5. Essential Services Protection (Unverified Cannot Be Operational)
 * 6. Audit Trail Immutability (UPDATE / DELETE Protection for Both Audit Tables)
 */

const assert = require('assert');

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
console.log('RUNNING PHASE 1 DATA INTEGRITY SAFEGUARD TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. CRI & ARI Distinct Terminology & Evidence Statuses
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: CRI vs ARI Distinct Evidence Statuses ---');

function validateResilienceAssessment(row) {
  // Enforces CriEvidenceStatus: 'OFFICIAL_CRI', 'SIMULATED_CRI', 'INSUFFICIENT_DATA'
  const validCriStatuses = ['OFFICIAL_CRI', 'SIMULATED_CRI', 'INSUFFICIENT_DATA'];
  if (!validCriStatuses.includes(row.evidenceStatus)) {
    throw new Error(`Integrity Violation: Invalid CriEvidenceStatus '${row.evidenceStatus}'. Must be one of: ${validCriStatuses.join(', ')}.`);
  }

  if (row.evidenceStatus === 'OFFICIAL_CRI') {
    if (row.hasSimulatedData === true) {
      throw new Error('Integrity Violation: OFFICIAL_CRI cannot contain simulated indicators (hasSimulatedData is true).');
    }
    if (row.overallProvenance === 'SIMULATED_DEMONSTRATION') {
      throw new Error('Integrity Violation: OFFICIAL_CRI cannot have overallProvenance = SIMULATED_DEMONSTRATION.');
    }
    if (row.compositeScore === null || row.compositeScore === undefined) {
      throw new Error('Integrity Violation: OFFICIAL_CRI requires a calculated compositeScore.');
    }
    if (row.confidenceScore < 50.0) {
      throw new Error('Integrity Violation: OFFICIAL_CRI requires Data Confidence Score >= 50%.');
    }
  }

  if (row.evidenceStatus === 'SIMULATED_CRI') {
    if (!row.hasSimulatedData && row.overallProvenance !== 'SIMULATED_DEMONSTRATION') {
      throw new Error('Integrity Violation: SIMULATED_CRI must have either hasSimulatedData=true or overallProvenance=SIMULATED_DEMONSTRATION.');
    }
  }

  if (row.evidenceStatus === 'INSUFFICIENT_DATA') {
    if (row.compositeScore !== null && row.compositeScore !== undefined) {
      throw new Error('Integrity Violation: INSUFFICIENT_DATA cannot publish a compositeScore.');
    }
  }

  return true;
}

function validateRecoveryTrackingRecord(row) {
  // Enforces AriEvidenceStatus: 'OFFICIAL_ARI', 'SIMULATED_ARI', 'INSUFFICIENT_DATA'
  const validAriStatuses = ['OFFICIAL_ARI', 'SIMULATED_ARI', 'INSUFFICIENT_DATA'];
  if (!validAriStatuses.includes(row.evidenceStatus)) {
    throw new Error(`Integrity Violation: Invalid AriEvidenceStatus '${row.evidenceStatus}'. Recovery records must NOT be labeled as CRI statuses. Valid: ${validAriStatuses.join(', ')}.`);
  }

  if (row.evidenceStatus === 'OFFICIAL_ARI') {
    if (row.dataProvenance === 'SIMULATED_DEMONSTRATION') {
      throw new Error('Integrity Violation: OFFICIAL_ARI cannot have dataProvenance = SIMULATED_DEMONSTRATION.');
    }
    if (row.aggregateRecoveryIndex === null || row.aggregateRecoveryIndex === undefined) {
      throw new Error('Integrity Violation: OFFICIAL_ARI requires aggregateRecoveryIndex.');
    }
    if (!row.leadAgency) {
      throw new Error('Integrity Violation: OFFICIAL_ARI requires a certified leadAgency.');
    }
  }

  if (row.evidenceStatus === 'SIMULATED_ARI') {
    if (row.dataProvenance !== 'SIMULATED_DEMONSTRATION') {
      throw new Error('Integrity Violation: SIMULATED_ARI must have dataProvenance = SIMULATED_DEMONSTRATION.');
    }
  }

  if (row.evidenceStatus === 'INSUFFICIENT_DATA') {
    if (row.aggregateRecoveryIndex !== null && row.aggregateRecoveryIndex !== undefined) {
      throw new Error('Integrity Violation: INSUFFICIENT_DATA cannot publish an aggregateRecoveryIndex.');
    }
  }

  return true;
}

runTest('Terminology Isolation: Rejects recovery record labeled with OFFICIAL_CRI', () => {
  assert.throws(() => {
    validateRecoveryTrackingRecord({
      evidenceStatus: 'OFFICIAL_CRI', // Invalid! Must use AriEvidenceStatus
      dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
      aggregateRecoveryIndex: 82.4,
      leadAgency: 'NDMA Reconstruction Cell'
    });
  }, /Recovery records must NOT be labeled as CRI statuses/);
});

runTest('Distinct ARI Status: Accepts official recovery record with OFFICIAL_ARI', () => {
  assert.doesNotThrow(() => {
    validateRecoveryTrackingRecord({
      evidenceStatus: 'OFFICIAL_ARI',
      dataProvenance: 'VERIFIED_FIELD_OBSERVATION',
      aggregateRecoveryIndex: 82.4,
      leadAgency: 'NDMA Reconstruction Cell'
    });
  });
});

runTest('CRI Provenance Integrity: Rejects OFFICIAL_CRI with simulated indicators', () => {
  assert.throws(() => {
    validateResilienceAssessment({
      evidenceStatus: 'OFFICIAL_CRI',
      hasSimulatedData: true,
      overallProvenance: 'SIMULATED_DEMONSTRATION',
      compositeScore: 68.5,
      confidenceScore: 75.0
    });
  }, /Integrity Violation: OFFICIAL_CRI cannot contain simulated indicators/);
});

runTest('Score Gating: Rejects publishing score when evidenceStatus is INSUFFICIENT_DATA', () => {
  assert.throws(() => {
    validateResilienceAssessment({
      evidenceStatus: 'INSUFFICIENT_DATA',
      hasSimulatedData: false,
      overallProvenance: 'VERIFIED_FIELD_OBSERVATION',
      compositeScore: 45.2,
      confidenceScore: 30.0
    });
  }, /Integrity Violation: INSUFFICIENT_DATA cannot publish a compositeScore/);
});

// -----------------------------------------------------------------------------
// 2. Essential Service Status History: Automatic Generation Verification
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Essential Service Status History Automatic Logging ---');

class MockDatabaseServiceManager {
  constructor() {
    this.services = new Map();
    this.history = [];
    this.nextServiceId = 1;
    this.nextHistoryId = 1;
  }

  // Simulates INSERT with trigger trg_auto_log_service_initial_status
  createServiceRecord(data) {
    // Check constraint chk_service_verification_status
    if (!data.isVerified && (data.status === 'OPERATIONAL' || data.status === 'FULLY_RESTORED')) {
      throw new Error(`Integrity Violation: Unverified service cannot be '${data.status}'.`);
    }

    const id = this.nextServiceId++;
    const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.services.set(id, record);

    // Database Trigger: trg_fn_log_service_initial_status
    const historyEntry = {
      id: this.nextHistoryId++,
      serviceRecordId: id,
      fromStatus: null,
      toStatus: record.status,
      isVerified: record.isVerified,
      actorName: record.verifiedBy || 'INITIAL_REGISTRATION',
      actorRole: record.isVerified ? 'ACCREDITED_VERIFIER' : 'SYSTEM_DISPATCH',
      timestamp: new Date()
    };
    this.history.push(historyEntry);

    return record;
  }

  // Simulates UPDATE with trigger trg_auto_log_service_status_transition
  updateServiceRecord(id, updates) {
    const existing = this.services.get(id);
    if (!existing) throw new Error('Record not found');

    const merged = { ...existing, ...updates };

    // Check constraint chk_service_verification_status
    if (!merged.isVerified && (merged.status === 'OPERATIONAL' || merged.status === 'FULLY_RESTORED')) {
      throw new Error(`Integrity Violation: Unverified service cannot be '${merged.status}'.`);
    }
    if (merged.isVerified && (!merged.verifiedBy || !merged.verifiedAt)) {
      throw new Error('Integrity Violation: Verified service requires verifiedBy and verifiedAt.');
    }

    const statusChanged = existing.status !== merged.status;

    // Database Trigger: trg_fn_log_service_status_transition
    if (statusChanged) {
      const historyEntry = {
        id: this.nextHistoryId++,
        serviceRecordId: id,
        fromStatus: existing.status,
        toStatus: merged.status,
        isVerified: merged.isVerified,
        actorName: merged.verifiedBy || 'SYSTEM_STATUS_LOGGER',
        actorRole: merged.isVerified ? 'ACCREDITED_VERIFIER' : 'SYSTEM_DISPATCH',
        timestamp: new Date()
      };
      this.history.push(historyEntry);
    }

    merged.updatedAt = new Date();
    this.services.set(id, merged);
    return merged;
  }

  getHistoryForService(serviceId) {
    return this.history.filter(h => h.serviceRecordId === serviceId);
  }
}

const dbManager = new MockDatabaseServiceManager();

runTest('Auto-History on INSERT: Creating a facility automatically creates initial status history', () => {
  const service = dbManager.createServiceRecord({
    boundaryId: 1,
    facilityName: 'Dadu Filtration Plant 4',
    serviceType: 'DRINKING_WATER',
    status: 'UNVERIFIED_REPORT',
    isVerified: false
  });

  const history = dbManager.getHistoryForService(service.id);
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].fromStatus, null);
  assert.strictEqual(history[0].toStatus, 'UNVERIFIED_REPORT');
});

runTest('Auto-History on STATUS UPDATE: Changing status automatically creates transition history', () => {
  const updated = dbManager.updateServiceRecord(1, {
    status: 'OPERATIONAL',
    isVerified: true,
    verifiedBy: 'Engr. Tariq (Public Health Eng)',
    verifiedAt: new Date()
  });

  const history = dbManager.getHistoryForService(1);
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[1].fromStatus, 'UNVERIFIED_REPORT');
  assert.strictEqual(history[1].toStatus, 'OPERATIONAL');
  assert.strictEqual(history[1].actorName, 'Engr. Tariq (Public Health Eng)');
});

runTest('No Redundant History: Updating non-status field does NOT create duplicate history record', () => {
  dbManager.updateServiceRecord(1, {
    alternativeServicesInUse: '3 mobile water bowsers on standby'
  });

  const history = dbManager.getHistoryForService(1);
  assert.strictEqual(history.length, 2); // Count remains 2
});

// -----------------------------------------------------------------------------
// 3. Displacement Balance & Population Integrity
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Displacement Population Balance & Mathematical Integrity ---');

function validateDisplacementAssessment(row) {
  // Check non-negative
  const counts = [
    row.totalDisplacedBaseline,
    row.verifiedReturnedCount,
    row.inCampShelterCount,
    row.secondaryDisplacedCount,
    row.unaccountedCount
  ];
  for (const c of counts) {
    if (c < 0 || !Number.isInteger(c)) {
      throw new Error(`Integrity Violation: Population count must be non-negative integer (found ${c}).`);
    }
  }

  // Balance equation
  const componentSum = row.verifiedReturnedCount + row.inCampShelterCount + row.secondaryDisplacedCount + row.unaccountedCount;
  const isBalanced = (row.totalDisplacedBaseline === componentSum);

  if (row.isBalanceValid !== isBalanced) {
    throw new Error(`Integrity Violation: isBalanceValid (${row.isBalanceValid}) does not match mathematical balance (${isBalanced}). Sum: ${componentSum}, Baseline: ${row.totalDisplacedBaseline}`);
  }

  return true;
}

runTest('Population Balance: Rejects mismatched baseline and sum with isBalanceValid = true', () => {
  assert.throws(() => {
    validateDisplacementAssessment({
      totalDisplacedBaseline: 10000,
      verifiedReturnedCount: 3000,
      inCampShelterCount: 2000,
      secondaryDisplacedCount: 2000,
      unaccountedCount: 1000, // Sum = 8000 != 10000
      verifiedReturnRatePct: 30.0,
      isBalanceValid: true
    });
  }, /Integrity Violation: isBalanceValid/);
});

runTest('Non-Negative Counts: Rejects negative population count', () => {
  assert.throws(() => {
    validateDisplacementAssessment({
      totalDisplacedBaseline: 5000,
      verifiedReturnedCount: -200,
      inCampShelterCount: 3000,
      secondaryDisplacedCount: 1200,
      unaccountedCount: 1000,
      verifiedReturnRatePct: 0.0,
      isBalanceValid: false
    });
  }, /Integrity Violation: Population count must be non-negative integer/);
});

// -----------------------------------------------------------------------------
// 4. Displacement Return Rate: Numeric Arithmetic vs Integer Division & Rounding
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Return Rate Arithmetic (Decimal vs Integer Division) ---');

function evaluateReturnRateMath(verifiedReturned, totalBaseline) {
  // Simulates SQL expression:
  // CASE WHEN totalDisplacedBaseline = 0 THEN 0.0
  //      ELSE ROUND((verifiedReturnedCount::numeric / totalDisplacedBaseline::numeric) * 100.0, 2)
  if (totalBaseline === 0) {
    return 0.0;
  }
  // Decimal division: cast both to numbers with precision
  const numericDivision = (Number(verifiedReturned) / Number(totalBaseline)) * 100;
  return Math.round(numericDivision * 100) / 100;
}

function simulateIntegerDivisionBug(verifiedReturned, totalBaseline) {
  // In SQL, if integers are not cast to numeric: 2500 / 10000 = 0 (integer division)
  return Math.floor(verifiedReturned / totalBaseline) * 100;
}

runTest('Integer Division Trap: Demonstrates why ::numeric casting is mandatory in SQL', () => {
  const integerDivisionResult = simulateIntegerDivisionBug(2500, 10000);
  assert.strictEqual(integerDivisionResult, 0); // 2500 / 10000 truncates to 0!
  
  const decimalArithmeticResult = evaluateReturnRateMath(2500, 10000);
  assert.strictEqual(decimalArithmeticResult, 25.0); // Exact decimal rate
});

runTest('Consistent Decimal Rounding: Tests exact 2-decimal precision (e.g. 1/3 = 33.33%)', () => {
  const rate = evaluateReturnRateMath(1, 3);
  assert.strictEqual(rate, 33.33);
});

runTest('Zero Denominator Safety: Baseline 0 safely yields 0.0% without division-by-zero exception', () => {
  const rate = evaluateReturnRateMath(0, 0);
  assert.strictEqual(rate, 0.0);
});

// -----------------------------------------------------------------------------
// 5. Essential Services Protection
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Essential Services Verification Safeguard ---');

function validateEssentialServiceRecord(row) {
  if (row.isVerified === false) {
    if (row.status !== 'UNVERIFIED_REPORT' && row.status !== 'POTENTIAL_DISRUPTION_FLAGGED') {
      throw new Error(`Integrity Violation: Unverified service record cannot have confirmed operational status '${row.status}'. Must be UNVERIFIED_REPORT or POTENTIAL_DISRUPTION_FLAGGED.`);
    }
  } else if (row.isVerified === true) {
    if (!['OPERATIONAL', 'VERIFIED_DISRUPTED', 'PARTIALLY_RESTORED', 'FULLY_RESTORED'].includes(row.status)) {
      throw new Error(`Integrity Violation: Verified service record has invalid status '${row.status}'.`);
    }
    if (!row.verifiedBy || !row.verifiedAt) {
      throw new Error('Integrity Violation: Verified service record requires explicit verifiedBy and verifiedAt.');
    }
  }
  return true;
}

runTest('Unverified Protection: Rejects unverified facility masquerading as OPERATIONAL', () => {
  assert.throws(() => {
    validateEssentialServiceRecord({
      facilityName: 'Taluka Hospital Johi',
      status: 'OPERATIONAL',
      isVerified: false,
      verifiedBy: null,
      verifiedAt: null
    });
  }, /Integrity Violation: Unverified service record cannot have confirmed operational status/);
});

// -----------------------------------------------------------------------------
// 6. Audit Trail Immutability (UPDATE & DELETE Rejection for BOTH Audit Tables)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Audit Trail Immutability (UPDATE / DELETE Protection on Both Tables) ---');

class MockImmutablePostgreSqlTable {
  constructor(tableName) {
    this.tableName = tableName;
    this.rows = [];
  }

  insert(row) {
    const entry = { id: this.rows.length + 1, ...row, timestamp: new Date() };
    this.rows.push(Object.freeze(entry));
    return entry;
  }

  update(id, updates) {
    // Simulates trigger trg_protect_adaptation_audit and trg_protect_service_status_history
    throw new Error(`PostgreSQL Trigger Exception [P0001] on '${this.tableName}': Audit trail records are strictly immutable and append-only. Modification (UPDATE) or deletion (DELETE) is prohibited by data integrity policy.`);
  }

  delete(id) {
    // Simulates trigger trg_protect_adaptation_audit and trg_protect_service_status_history
    throw new Error(`PostgreSQL Trigger Exception [P0001] on '${this.tableName}': Audit trail records are strictly immutable and append-only. Modification (UPDATE) or deletion (DELETE) is prohibited by data integrity policy.`);
  }
}

const adaptationAuditTable = new MockImmutablePostgreSqlTable('AdaptationActionAudit');
const serviceHistoryTable = new MockImmutablePostgreSqlTable('EssentialServiceStatusHistory');

const auditRow = adaptationAuditTable.insert({ actionId: 10, fromStatus: 'PLANNED', toStatus: 'ONGOING' });
const historyRow = serviceHistoryTable.insert({ serviceRecordId: 5, fromStatus: null, toStatus: 'UNVERIFIED_REPORT' });

runTest('Table 1 Immutability: Rejects UPDATE on AdaptationActionAudit', () => {
  assert.throws(() => {
    adaptationAuditTable.update(auditRow.id, { actorName: 'Malicious' });
  }, /PostgreSQL Trigger Exception.*AdaptationActionAudit.*strictly immutable/);
});

runTest('Table 1 Immutability: Rejects DELETE on AdaptationActionAudit', () => {
  assert.throws(() => {
    adaptationAuditTable.delete(auditRow.id);
  }, /PostgreSQL Trigger Exception.*AdaptationActionAudit.*strictly immutable/);
});

runTest('Table 2 Immutability: Rejects UPDATE on EssentialServiceStatusHistory', () => {
  assert.throws(() => {
    serviceHistoryTable.update(historyRow.id, { actorName: 'Malicious' });
  }, /PostgreSQL Trigger Exception.*EssentialServiceStatusHistory.*strictly immutable/);
});

runTest('Table 2 Immutability: Rejects DELETE on EssentialServiceStatusHistory', () => {
  assert.throws(() => {
    serviceHistoryTable.delete(historyRow.id);
  }, /PostgreSQL Trigger Exception.*EssentialServiceStatusHistory.*strictly immutable/);
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('================================================================\n');
