import { prisma } from "../../../lib/db";
import type { CampView, RestockView } from "./camps-restock-client";

export async function loadCampsRestockData(): Promise<{
  camps: CampView[];
  restocks: RestockView[];
}> {
  try {
    const [camps, restocks] = await Promise.all([
      prisma.camp.findMany({
        include: {
          _count: { select: { requests: true } },
          managers: { where: { role: "volunteer" }, select: { id: true } },
          stock: { select: { quantity: true, reorderLevel: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.restockRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { camp: { select: { name: true } } },
      }),
    ]);

    const stockStatusOf = (stock: { quantity: number; reorderLevel: number }[]) => {
      const low = stock.filter((s) => s.quantity <= s.reorderLevel).length;
      if (low >= 2) return "Low" as const;
      if (low === 1) return "Medium" as const;
      return "Good" as const;
    };

    const campViews: CampView[] = camps.map((c) => ({
      id: c.id,
      name: c.name,
      district: c.district,
      province: c.province,
      status: c.status,
      requestCount: c._count.requests,
      volunteerCount: c.managers.length,
      stockStatus: stockStatusOf(c.stock),
    }));

    // Restock urgency mirrors the requesting camp's current stock severity.
    const priorityByCamp = new Map(
      campViews.map((c) => [c.id, c.stockStatus === "Low" ? "High" : c.stockStatus === "Medium" ? "Medium" : "Low"]),
    );

    const restockViews: RestockView[] = restocks.map((r) => ({
      id: r.id,
      code: r.code,
      campName: r.camp.name,
      itemName: r.itemName,
      quantity: r.quantity,
      status: r.status as RestockView["status"],
      priority: (priorityByCamp.get(r.campId) ?? "Low") as RestockView["priority"],
      createdAt: r.createdAt.toISOString(),
    }));

    return { camps: campViews, restocks: restockViews };
  } catch (err) {
    console.warn("loadCampsRestockData fallback due to database initialization:", err);
    return { camps: [], restocks: [] };
  }
}
