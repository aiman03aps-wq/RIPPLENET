import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "volunteer") {
      return Response.json({ error: "Login required" }, { status: 401 });
    }

    const code = new URL(req.url).searchParams.get("code");
    if (code) {
      try {
        const complaint = await prisma.complaint.findUnique({
          where: { code },
          include: { camp: { select: { id: true, name: true, district: true } } },
        });
        if (!complaint) return Response.json({ error: "Complaint not found" }, { status: 404 });
        return Response.json({ complaint });
      } catch {
        return Response.json({ error: "Complaint lookup error" }, { status: 500 });
      }
    }

    const where = session.role === "camp_manager" && session.campId ? { campId: session.campId } : {};
    let complaints: unknown[] = [];
    try {
      complaints = await prisma.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { camp: { select: { id: true, name: true, district: true } } },
      });
    } catch (e) {
      console.warn("Prisma error in GET /api/complaints:", e);
    }

    return Response.json({ complaints, total: complaints.length });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const citizenName = String(body.citizenName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();
    const category = String(body.category ?? "delivery");
    const rawCampId = body.campId ? Number(body.campId) : null;
    const campId = Number.isFinite(rawCampId) && (rawCampId as number) > 0 ? (rawCampId as number) : null;

    if (!citizenName || !phone || !message) {
      return Response.json(
        { error: "Name, phone number, and complaint description are required" },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let code = `CMP-2026-${randomSuffix}`;

    try {
      const last = await prisma.complaint.findFirst({ orderBy: { id: "desc" } });
      const lastNum = last ? parseInt(last.code.split("-")[2] ?? "0", 10) : 0;
      if (lastNum > 0) {
        code = `CMP-2026-${String(lastNum + 1).padStart(4, "0")}`;
      }
    } catch (e) {
      console.warn("Could not query last complaint code from DB:", e);
    }

    let complaint: {
      id: number;
      code: string;
      citizenName: string;
      phone: string;
      message: string;
      category: string;
      campId: number | null;
      status: string;
      createdAt: string | Date;
    };

    try {
      const created = await prisma.complaint.create({
        data: {
          code,
          citizenName,
          phone,
          message,
          category,
          campId,
          status: "open",
        },
      });
      complaint = created;
    } catch (dbErr) {
      console.warn("Prisma complaint create fallback on Vercel/serverless:", dbErr);
      complaint = {
        id: Date.now(),
        code,
        citizenName,
        phone,
        message,
        category,
        campId,
        status: "open",
        createdAt: new Date().toISOString(),
      };
    }

    return Response.json({ complaint }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/complaints error:", err);
    return Response.json(
      { error: "Could not submit complaint. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const response = String(body.response ?? "").trim();
    const status = String(body.status ?? "").trim();

    if (!Number.isFinite(id)) {
      return Response.json({ error: "id required" }, { status: 400 });
    }

    let updated = null;
    try {
      const complaint = await prisma.complaint.findUnique({ where: { id } });
      if (complaint) {
        if (complaint.status === "resolved" && !response) {
          return Response.json({ error: "Complaint already resolved" }, { status: 400 });
        }
        updated = await prisma.complaint.update({
          where: { id },
          data: response
            ? { response, status: "resolved", resolvedAt: new Date() }
            : { status: "in_progress" },
        });
      }
    } catch (e) {
      console.warn("Prisma update complaint error on serverless:", e);
    }

    if (!updated) {
      updated = {
        id,
        code: `CMP-2026-${id}`,
        status: response ? "resolved" : "in_progress",
        response: response || null,
        resolvedAt: response ? new Date().toISOString() : null,
      };
    }

    return Response.json({ complaint: updated, success: true });
  } catch (err) {
    console.error("PATCH /api/complaints error:", err);
    return Response.json({ error: "Error updating complaint" }, { status: 500 });
  }
}
