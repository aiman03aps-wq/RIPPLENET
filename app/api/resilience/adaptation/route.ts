import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';
import { calculateAdaptationEfficiency } from '@/lib/resilience/adaptation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boundaryId = searchParams.get('boundaryId');

    const records = resilienceStore.getAllAdaptationRecords(boundaryId ? parseInt(boundaryId, 10) : undefined);
    const enriched = records.map((r) => ({
      ...r,
      efficiencyMeta: calculateAdaptationEfficiency(r),
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, verifyingAuditor, verifiedBeneficiaries, evidenceAttachmentUrl, actorName, actorRole } = body;

    if (!id || !verifyingAuditor || !verifiedBeneficiaries) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: id, verifyingAuditor, verifiedBeneficiaries' },
        { status: 400 }
      );
    }

    const result = resilienceStore.updateAdaptationVerification(
      parseInt(id, 10),
      verifyingAuditor,
      parseInt(verifiedBeneficiaries, 10),
      evidenceAttachmentUrl || 'https://ripplenet.org/evidence/verified-audit.pdf',
      actorName || 'Independent Certifier',
      actorRole || 'Third-Party Engineer'
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
