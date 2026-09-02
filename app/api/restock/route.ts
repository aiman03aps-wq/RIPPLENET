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

  const restocks = await prisma.restockRequest.findMany({
    where: campId ? { campId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { camp: { select: { id: true, name: true, district: true, province: true } } },
  });

  return Response.json({ restocks, total: restocks.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "camp_manager" || !session.campId) {
    return Response.json({ error: "Only camp managers can create restock requests" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const itemName = String(body.itemName ?? "").trim();
  const quantity = Number(body.quantity);

  if (!itemName || !Number.isFinite(quantity) || quantity <= 0) {
    return Response.json({ error: "itemName and positive quantity required" }, { status: 400 });
  }

  const last = await prisma.restockRequest.findFirst({ orderBy: { id: "desc" } });
  const lastNum = last ? parseInt(last.code.split("-")[2] ?? "0", 10) : 0;
  const code = `RSK-2026-${String(lastNum + 1).padStart(4, "0")}`;

  const restock = await prisma.restockRequest.create({
    data: { code, campId: session.campId, itemName, quantity, status: "pending" },
    include: { camp: { select: { id: true, name: true, district: true, province: true } } },
  });

  return Response.json({ restock }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Only admins can update restock requests" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const status = String(body.status ?? "");

  if (!Number.isFinite(id) || !["approved", "fulfilled"].includes(status)) {
    return Response.json({ error: "id and status (approved|fulfilled) required" }, { status: 400 });
  }

  const restock = await prisma.restockRequest.findUnique({
    where: { id },
    include: { camp: { select: { id: true, name: true, district: true, province: true } } },
  });
  if (!restock) return Response.json({ error: "Restock request not found" }, { status: 404 });
  if (restock.status === "fulfilled") {
    return Response.json({ error: "Request already fulfilled" }, { status: 400 });
  }

  const updated = await prisma.restockRequest.update({
    where: { id },
    data: { status },
    include: { camp: { select: { id: true, name: true, district: true, province: true } } },
  });

  // Fulfilling a request delivers the stock to the camp inventory.
  if (status === "fulfilled") {
    const item = await prisma.stockItem.findFirst({
      where: { campId: restock.campId, name: { contains: restock.itemName.split("(")[0].trim() } },
    });
    if (item) {
      await prisma.stockItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity + restock.quantity },
      });
    }
  }

  return Response.json({ restock: updated });
}
