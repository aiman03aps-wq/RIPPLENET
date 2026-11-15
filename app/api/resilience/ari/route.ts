import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';
import { calculateAdaptationRecoveryIndex } from '@/lib/resilience/ari';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boundaryId = searchParams.get('boundaryId');

    if (boundaryId) {
      const record = resilienceStore.getRecoveryRecord(parseInt(boundaryId, 10));
      if (!record) {
        return NextResponse.json({ success: false, error: 'Recovery tracking record not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: record });
    }

    const records = resilienceStore.getAllRecoveryRecords();
    return NextResponse.json({ success: true, data: records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      boundaryId,
      boundaryName,
      district,
      disasterEventLabel,
      baselineAssessmentDate,
      daysPostDisaster,
      sectorEvidence,
      leadAgency,
      dataProvenance,
      fieldNotes,
    } = body;

    const calculation = calculateAdaptationRecoveryIndex(
      sectorEvidence,
      baselineAssessmentDate,
      leadAgency,
      dataProvenance || 'SIMULATED_DEMONSTRATION'
    );

    const record = {
      boundaryId: parseInt(boundaryId, 10),
      boundaryName: boundaryName || 'Affected Zone',
      district: district || 'Dadu',
      disasterEventLabel: disasterEventLabel || 'Post-Disaster Recovery Benchmark',
      baselineAssessmentDate,
      daysPostDisaster: daysPostDisaster || 30,
      aggregateRecoveryIndex: calculation.aggregateRecoveryIndex,
      evidenceStatus: calculation.evidenceStatus,
      sectorEvidence,
      leadAgency,
      dataProvenance: dataProvenance || 'SIMULATED_DEMONSTRATION',
      monitoredDate: new Date().toISOString(),
      fieldNotes,
    };

    return NextResponse.json({ success: true, data: record, calculationMeta: calculation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
