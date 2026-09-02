import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "volunteer") {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const code = new URL(req.url).searchParams.get("code");
  if (code) {
    const complaint = await prisma.complaint.findUnique({ where: { code } });
    if (!complaint) return Response.json({ error: "Complaint not found" }, { status: 404 });
    return Response.json({ complaint });
  }

  const where = session.role === "camp_manager" && session.campId ? { campId: session.campId } : {};
  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { camp: { select: { id: true, name: true, district: true } } },
  });

  return Response.json({ complaints, total: complaints.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const citizenName = String(body.citizenName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();
  const category = String(body.category ?? "service");

  if (!citizenName || !phone || !message) {
    return Response.json({ error: "Name, phone and message are required" }, { status: 400 });
  }

  const last = await prisma.complaint.findFirst({ orderBy: { id: "desc" } });
  const lastNum = last ? parseInt(last.code.split("-")[2] ?? "0", 10) : 0;
  const code = `CMP-2026-${String(lastNum + 1).padStart(4, "0")}`;

  const complaint = await prisma.complaint.create({
    data: {
      code,
      citizenName,
      phone,
      message,
      category,
      campId: Number(body.campId) || null,
      status: "open",
    },
  });

  return Response.json({ complaint }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "volunteer") {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const response = String(body.response ?? "").trim();
  const status = String(body.status ?? "").trim();

  if (!Number.isFinite(id)) {
    return Response.json({ error: "id required" }, { status: 400 });
  }
  if (!response && status !== "in_progress") {
    return Response.json({ error: "response required (or status=in_progress)" }, { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) return Response.json({ error: "Complaint not found" }, { status: 404 });
  if (session.role === "camp_manager" && complaint.campId !== session.campId) {
    return Response.json({ error: "Complaint belongs to another camp" }, { status: 403 });
  }
  if (complaint.status === "resolved") {
    return Response.json({ error: "Complaint already resolved" }, { status: 400 });
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: response
      ? { response, status: "resolved", resolvedAt: new Date() }
      : { status: "in_progress" },
  });

  return Response.json({ complaint: updated });
}
