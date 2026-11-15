import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';
import { calculateCommunityResilienceIndex } from '@/lib/resilience/cri';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boundaryId = searchParams.get('boundaryId');

    if (boundaryId) {
      const assessment = resilienceStore.getResilienceAssessment(parseInt(boundaryId, 10));
      if (!assessment) {
        return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: assessment });
    }

    const assessments = resilienceStore.getAllResilienceAssessments();
    return NextResponse.json({ success: true, data: assessments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boundaryId, boundaryName, district, province, dimensionEvidence, overallProvenance, sourceAttribution, assessedBy, notes } = body;

    if (!boundaryId || !dimensionEvidence) {
      return NextResponse.json({ success: false, error: 'Missing mandatory fields: boundaryId, dimensionEvidence' }, { status: 400 });
    }

    const calculation = calculateCommunityResilienceIndex(dimensionEvidence, overallProvenance || 'SIMULATED_DEMONSTRATION');

    const saved = resilienceStore.saveResilienceAssessment({
      boundaryId: parseInt(boundaryId, 10),
      boundaryName: boundaryName || 'Surveyed Boundary',
      district: district || 'Dadu',
      province: province || 'Sindh',
      compositeScore: calculation.compositeScore,
      confidenceScore: calculation.confidenceScore,
      evidenceStatus: calculation.evidenceStatus,
      dimensionEvidence,
      hasSimulatedData: calculation.hasSimulatedData,
      overallProvenance: overallProvenance || 'SIMULATED_DEMONSTRATION',
      sourceAttribution: sourceAttribution || 'Standard Field Assessment',
      assessedBy: assessedBy || 'Authorized Field Auditor',
      assessmentDate: new Date().toISOString(),
      notes,
    });

    return NextResponse.json({ success: true, data: saved, calculationMeta: calculation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
