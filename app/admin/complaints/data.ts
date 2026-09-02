import { prisma } from "../../../lib/db";
import type { ComplaintAdminView, ReportsData } from "./complaints-reports-client";

export async function loadComplaintsReportsData(): Promise<{
  complaints: ComplaintAdminView[];
  reports: ReportsData;
}> {
  try {
    const [complaints, requests, camps, stockItems, restocks, volunteers] = await Promise.all([
      prisma.complaint.findMany({
        orderBy: { createdAt: "desc" },
        include: { camp: { select: { name: true, district: true } } },
      }),
      prisma.request.findMany({
        select: {
          code: true,
          priority: true,
          status: true,
          peopleCount: true,
          createdAt: true,
          resolvedAt: true,
          campId: true,
          camp: { select: { name: true, district: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.camp.findMany({
        include: { _count: { select: { requests: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.stockItem.findMany({
        include: { camp: { select: { name: true } } },
        orderBy: [{ camp: { name: "asc" } }, { name: "asc" }],
      }),
      prisma.restockRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { camp: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where: { role: "volunteer" },
        include: {
          camp: { select: { name: true } },
          tasks: { select: { status: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  const complaintViews: ComplaintAdminView[] = complaints.map((c) => ({
    id: c.id,
    code: c.code,
    citizenName: c.citizenName,
    message: c.message,
    category: c.category,
    status: c.status as ComplaintAdminView["status"],
    response: c.response,
    createdAt: c.createdAt.toISOString(),
    campName: c.camp?.name ?? null,
    district: c.camp?.district ?? null,
  }));

  const campRequests = new Map<number, { total: number; resolved: number; hrs: number[] }>();
  for (const r of requests) {
    if (r.campId == null) continue;
    const entry = campRequests.get(r.campId) ?? { total: 0, resolved: 0, hrs: [] };
    entry.total += 1;
    if (r.status === "resolved") {
      entry.resolved += 1;
      if (r.resolvedAt) {
        entry.hrs.push((r.resolvedAt.getTime() - r.createdAt.getTime()) / 3_600_000);
      }
    }
    campRequests.set(r.campId, entry);
  }

  const reports: ReportsData = {
    requests: requests.map((r) => ({
      code: r.code,
      camp: r.camp?.name ?? "Unassigned",
      district: r.camp?.district ?? "—",
      priority: r.priority,
      status: r.status,
      people: r.peopleCount,
      createdAt: r.createdAt.toISOString(),
    })),
    camps: camps.map((c) => {
      const entry = campRequests.get(c.id);
      return {
        name: c.name,
        district: c.district,
        province: c.province,
        requests: c._count.requests,
        resolved: entry?.resolved ?? 0,
        avgResolutionHrs:
          entry && entry.hrs.length > 0
            ? entry.hrs.reduce((sum, h) => sum + h, 0) / entry.hrs.length
            : null,
        occupancy: c.occupancy,
        capacity: c.capacity,
      };
    }),
    stock: stockItems.map((s) => ({
      camp: s.camp.name,
      item: s.name,
      category: s.category,
      quantity: s.quantity,
      unit: s.unit,
      reorderLevel: s.reorderLevel,
    })),
    restocks: restocks.map((r) => ({
      code: r.code,
      camp: r.camp.name,
      item: r.itemName,
      quantity: r.quantity,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    volunteers: volunteers.map((v) => ({
      name: v.name,
      camp: v.camp?.name ?? null,
      tasks: v.tasks.length,
      resolved: v.tasks.filter((t) => t.status === "resolved").length,
      available: v.available,
    })),
  };

    return { complaints: complaintViews, reports };
  } catch (err) {
    console.warn("loadComplaintsReportsData fallback due to database initialization:", err);
    return {
      complaints: [],
      reports: {
        requests: [],
        camps: [],
        stock: [],
        restocks: [],
        volunteers: [],
      },
    };
  }
}
