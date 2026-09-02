import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "volunteer") {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const campIdParam = new URL(req.url).searchParams.get("campId");
  const campId = session.role === "admin" && campIdParam ? Number(campIdParam) : session.campId;

  const volunteers = await prisma.user.findMany({
    where: { role: "volunteer", ...(campId ? { campId } : {}) },
    orderBy: [{ available: "desc" }, { name: "asc" }],
    include: {
      camp: { select: { id: true, name: true, district: true } },
      _count: { select: { tasks: true } },
    },
  });

  const activeCounts = await prisma.request.groupBy({
    by: ["volunteerId"],
    where: { status: { in: ["assigned", "in_transit"] } },
    _count: { _all: true },
  });
  const activeMap = new Map(
    activeCounts.filter((r) => r.volunteerId !== null).map((r) => [r.volunteerId, r._count._all])
  );

  return Response.json({
    volunteers: volunteers.map((v) => ({
      id: v.id,
      username: v.username,
      name: v.name,
      phone: v.phone,
      available: v.available,
      camp: v.camp,
      totalTasks: v._count.tasks,
      activeTasks: activeMap.get(v.id) ?? 0,
    })),
    total: volunteers.length,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const volunteerId = Number(body.volunteerId ?? session.id);
  const available = Boolean(body.available);

  if (session.role === "volunteer" && volunteerId !== session.id) {
    return Response.json({ error: "Not allowed" }, { status: 403 });
  }
  if (session.role === "camp_manager") {
    const target = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!target || target.campId !== session.campId) {
      return Response.json({ error: "Volunteer belongs to another camp" }, { status: 403 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: volunteerId },
    data: { available },
  });

  return Response.json({
    volunteer: { id: updated.id, name: updated.name, available: updated.available },
  });
}
