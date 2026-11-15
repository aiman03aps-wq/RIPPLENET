import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';
import { analyzeCampOccupancyContrast } from '@/lib/resilience/displacement';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boundaryId = searchParams.get('boundaryId');

    const record = resilienceStore.getDisplacementRecord(boundaryId ? parseInt(boundaryId, 10) : 1);
    if (!record) {
      return NextResponse.json({ success: false, error: 'Displacement record not found' }, { status: 404 });
    }

    const contrastAnalysis = analyzeCampOccupancyContrast(record);

    return NextResponse.json({
      success: true,
      data: {
        record,
        contrastAnalysis,
      },
    });
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
      totalDisplacedBaseline,
      verifiedReturnedCount,
      inCampShelterCount,
      secondaryDisplacedCount,
      unaccountedCount,
      verificationMethod,
      verifiedBy,
      dataProvenance,
      notes,
    } = body;

    const saved = resilienceStore.saveDisplacementRecord({
      boundaryId: parseInt(boundaryId, 10),
      boundaryName: boundaryName || 'Surveyed District',
      district: district || 'Dadu',
      assessmentDate: new Date().toISOString(),
      unit: 'INDIVIDUALS',
      totalDisplacedBaseline: parseInt(totalDisplacedBaseline, 10),
      verifiedReturnedCount: parseInt(verifiedReturnedCount, 10),
      inCampShelterCount: parseInt(inCampShelterCount, 10),
      secondaryDisplacedCount: parseInt(secondaryDisplacedCount, 10),
      unaccountedCount: parseInt(unaccountedCount, 10),
      verificationMethod: verificationMethod || 'Field Biometric Survey',
      verifiedBy: verifiedBy || 'Displacement Tracking Team',
      dataProvenance: dataProvenance || 'SIMULATED_DEMONSTRATION',
      notes,
    });

    const contrastAnalysis = analyzeCampOccupancyContrast(saved);

    return NextResponse.json({
      success: true,
      data: {
        record: saved,
        contrastAnalysis,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
