import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const daduAssessment = resilienceStore.getResilienceAssessment(1);
    const daduServices = resilienceStore.getAllServices(1);
    const daduRecovery = resilienceStore.getRecoveryRecord(1);
    const daduDisplacement = resilienceStore.getDisplacementRecord(1);
    const daduAdaptation = resilienceStore.getAllAdaptationRecords(1);

    return NextResponse.json({
      success: true,
      data: {
        district: 'Dadu District (PK-SD-DADU)',
        population: 1550266,
        populationSource: 'Pakistan Bureau of Statistics 7th Population & Housing Census (2023)',
        demonstrationLabel: 'SIMULATED_DEMONSTRATION (Methodology Validation Only)',
        currentWorkflowState: {
          cri: {
            score: daduAssessment?.compositeScore,
            confidenceScore: daduAssessment?.confidenceScore,
            status: daduAssessment?.evidenceStatus,
            provenance: daduAssessment?.overallProvenance,
          },
          services: daduServices.map((s) => ({
            name: s.facilityName,
            type: s.serviceType,
            status: s.status,
            isVerified: s.isVerified,
            flaggedBySosVolume: s.flaggedBySosVolume,
          })),
          recovery: {
            label: daduRecovery?.disasterEventLabel,
            ari: daduRecovery?.aggregateRecoveryIndex,
            status: daduRecovery?.evidenceStatus,
            waterRestorationPct: daduRecovery?.sectorEvidence.waterRestoration.pct,
            housingRestorationPct: daduRecovery?.sectorEvidence.housingRestoration.pct,
          },
          displacement: {
            baseline: daduDisplacement?.totalDisplacedBaseline,
            returned: daduDisplacement?.verifiedReturnedCount,
            ratePct: daduDisplacement?.verifiedReturnRatePct,
            isBalanceValid: daduDisplacement?.isBalanceValid,
          },
          adaptation: daduAdaptation.map((a) => ({
            title: a.title,
            sector: a.sector,
            status: a.status,
            verified: a.independentlyVerified,
          })),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'full_cycle';

    const auditTrail: string[] = [];

    // Step 1: Simulate Disaster Inundation & Agent Telemetry Trigger
    auditTrail.push('1. Ingesting Flood Agent (Severity 8.5/10) and Route Agent (N-55 Impassable) advisory signals.');
    const flaggedServices = resilienceStore.syncDisasterTelemetryToServices(1, 8.5, false, 7);
    auditTrail.push(`2. Advisory cue generated: ${flaggedServices.length} essential facilities flagged for field verification.`);

    // Step 2: Officer Field Verification
    auditTrail.push('3. Field Officer Dr. Tariq verified Indus Highway N-55 culvert breach (154.5 hrs disruption).');
    resilienceStore.updateServiceStatus(
      3,
      {
        status: 'VERIFIED_DISRUPTED',
        isVerified: true,
        verifiedBy: 'NHA Sukkur Field Engineers',
        verifiedAt: new Date().toISOString(),
        disruptionDurationHrs: 154.5,
        alternativeServicesInUse: 'Diversion via KN Shah causeway',
      },
      'NHA Field Engineers',
      'Accredited Infrastructure Inspector',
      'Culvert breached. Flow velocity 4.2 m/s.'
    );

    // Step 3: Verified Population Return Recorded
    auditTrail.push('4. SDMC field team completed biometric household verification: 16,820 verified returned out of 58,000 baseline.');
    const dispRecord = resilienceStore.saveDisplacementRecord({
      boundaryId: 1,
      boundaryName: 'Dadu District',
      district: 'Dadu',
      assessmentDate: new Date().toISOString(),
      unit: 'INDIVIDUALS',
      totalDisplacedBaseline: 58000,
      verifiedReturnedCount: 16820,
      inCampShelterCount: 14500,
      secondaryDisplacedCount: 21480,
      unaccountedCount: 5200,
      verificationMethod: 'Biometric Household Survey',
      verifiedBy: 'Sindh Displacement Monitoring Cell (SDMC)',
      dataProvenance: 'SIMULATED_DEMONSTRATION',
      notes: 'Roadside tents along Johi bund hold 37% of displaced population.',
    });
    auditTrail.push(`5. Population balance validated: Return rate = ${dispRecord.verifiedReturnRatePct}%. Housing recovery in ARI updated.`);

    // Step 4: Long-Term Climate Adaptation Action Certified
    auditTrail.push('6. UN-Habitat third-party audit certified Elevated Solar RO Plant with 18,500 beneficiaries.');
    const certResult = resilienceStore.updateAdaptationVerification(
      1,
      'UN-Habitat Infrastructure Audit Panel',
      18500,
      'https://ripplenet.org/evidence/un-habitat-cert-dadu.pdf',
      'UN-Habitat Lead Auditor',
      'Accredited Infrastructure Inspector'
    );
    auditTrail.push(`7. CRI recalculation executed: ${certResult.recalculationResult.recalculationJustification}`);

    const finalAssessment = resilienceStore.getResilienceAssessment(1);
    const finalRecovery = resilienceStore.getRecoveryRecord(1);

    return NextResponse.json({
      success: true,
      message: 'End-to-end flood-to-recovery-to-adaptation simulation cycle completed successfully.',
      auditTrail,
      resultingState: {
        criCompositeScore: finalAssessment?.compositeScore,
        confidenceScore: finalAssessment?.confidenceScore,
        ariRecoveryIndex: finalRecovery?.aggregateRecoveryIndex,
        verifiedReturnRatePct: dispRecord.verifiedReturnRatePct,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
