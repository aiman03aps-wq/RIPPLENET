import { NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const overview = resilienceStore.getOverviewSummary();
    const assessments = resilienceStore.getAllResilienceAssessments();
    const services = resilienceStore.getAllServices();
    const recovery = resilienceStore.getAllRecoveryRecords();
    const displacement = resilienceStore.getDisplacementRecord(1); // default Dadu
    const adaptation = resilienceStore.getAllAdaptationRecords();

    return NextResponse.json({
      success: true,
      data: {
        overview,
        assessments,
        services,
        recovery,
        displacement,
        adaptation,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
