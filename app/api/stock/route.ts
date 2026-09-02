import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "camp_manager" && session.role !== "admin")) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const campIdParam = new URL(req.url).searchParams.get("campId");
  const campId = session.role === "admin" && campIdParam ? Number(campIdParam) : session.campId;

  const items = await prisma.stockItem.findMany({
    where: campId ? { campId } : undefined,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { camp: { select: { id: true, name: true, district: true } } },
  });

  return Response.json({
    items: items.map((i) => ({ ...i, low: i.quantity <= i.reorderLevel })),
    total: items.length,
    lowCount: items.filter((i) => i.quantity <= i.reorderLevel).length,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "camp_manager" && session.role !== "admin")) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const itemId = Number(body.itemId);
  const delta = Number(body.delta);

  if (!Number.isFinite(itemId) || !Number.isFinite(delta)) {
    return Response.json({ error: "itemId and delta required" }, { status: 400 });
  }

  const item = await prisma.stockItem.findUnique({ where: { id: itemId } });
  if (!item) return Response.json({ error: "Item not found" }, { status: 404 });
  if (session.role === "camp_manager" && item.campId !== session.campId) {
    return Response.json({ error: "Item belongs to another camp" }, { status: 403 });
  }

  const quantity = Math.max(0, item.quantity + Math.round(delta));
  const updated = await prisma.stockItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return Response.json({ item: { ...updated, low: quantity <= updated.reorderLevel } });
}
