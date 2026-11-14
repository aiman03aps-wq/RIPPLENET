import { getSession } from "@/lib/session";
import { updateAlertVerification, type AlertStatus } from "@/lib/missing-signals";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Admin login required" }, { status: 401 });
  }

  const { id } = await params;
  const alertId = parseInt(id, 10);
  if (isNaN(alertId)) {
    return Response.json({ error: "Invalid alert ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, verificationNotes, reviewerName } = body;

    const validStatuses: AlertStatus[] = [
      "pending",
      "under_verification",
      "verified",
      "dismissed",
      "escalated",
      "insufficient_data",
    ];

    if (status && !validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await updateAlertVerification({
      alertId,
      newStatus: status || "under_verification",
      verificationNotes,
      reviewerName: reviewerName || session.name || "Administrator",
      reviewerId: session.id,
    });

    return Response.json({ success: true, alert: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update alert";
    console.error("Error updating missing signal alert:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
