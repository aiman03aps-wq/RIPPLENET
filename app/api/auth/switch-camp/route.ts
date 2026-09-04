import { NextRequest } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DEFAULT_PAKISTAN_CAMPS } from "@/lib/camps";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const campId = Number(body.campId);
    if (!Number.isFinite(campId)) {
      return Response.json({ error: "Invalid campId" }, { status: 400 });
    }

    // Try to update user's campId in DB if user exists
    try {
      await prisma.user.update({
        where: { id: session.id },
        data: { campId },
      });
    } catch (e) {
      console.warn("Could not update user camp in DB:", e);
    }

    // Re-create session with new campId
    await createSession({
      ...session,
      campId,
    });

    return Response.json({ success: true, campId });
  } catch (err) {
    console.error("switch-camp error:", err);
    return Response.json({ error: "Failed to switch camp" }, { status: 500 });
  }
}
