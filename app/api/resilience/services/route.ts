import { NextRequest, NextResponse } from 'next/server';
import { resilienceStore } from '@/lib/resilience/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boundaryId = searchParams.get('boundaryId');
    const serviceId = searchParams.get('id');

    if (serviceId) {
      const service = resilienceStore.getService(parseInt(serviceId, 10));
      if (!service) {
        return NextResponse.json({ success: false, error: 'Service record not found' }, { status: 404 });
      }
      const history = resilienceStore.getServiceHistory(service.id!);
      return NextResponse.json({ success: true, data: { service, history } });
    }

    const services = resilienceStore.getAllServices(boundaryId ? parseInt(boundaryId, 10) : undefined);
    return NextResponse.json({ success: true, data: services });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, isVerified, verifiedBy, verifiedAt, alternativeServicesInUse, notes, actorName, actorRole } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing mandatory fields: id, status' }, { status: 400 });
    }

    const updated = resilienceStore.updateServiceStatus(
      parseInt(id, 10),
      {
        status,
        isVerified: isVerified ?? false,
        verifiedBy: verifiedBy || null,
        verifiedAt: verifiedAt ? new Date(verifiedAt).toISOString() : (isVerified ? new Date().toISOString() : null),
        alternativeServicesInUse,
        verificationNotes: notes,
      },
      actorName || 'Field Operations Officer',
      actorRole || 'Operations Controller',
      notes
    );

    const history = resilienceStore.getServiceHistory(updated.id!);
    return NextResponse.json({ success: true, data: updated, history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
