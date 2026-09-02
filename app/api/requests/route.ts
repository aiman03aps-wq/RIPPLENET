import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { haversineKm } from "@/lib/geo";
import { nearestDistrict } from "@/lib/pakistan-districts";
import { parseNeeds } from "@/lib/needs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const request = await prisma.request.findUnique({
      where: { code },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true, lat: true, lng: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!request) return Response.json({ error: "Request not found" }, { status: 404 });
    return Response.json({ request: { ...request, needsList: parseNeeds(request.needs) } });
  }

  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const status = url.searchParams.get("status");
  const volunteerIdParam = url.searchParams.get("volunteerId");
  const mine = url.searchParams.get("mine");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  if (session.role === "volunteer") {
    where.volunteerId = session.id;
  } else if (mine === "1" && volunteerIdParam) {
    where.volunteerId = Number(volunteerIdParam);
  } else if (session.role === "camp_manager" && session.campId) {
    where.campId = session.campId;
  }

  const requests = await prisma.request.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      camp: { select: { id: true, name: true, district: true, phone: true } },
      volunteer: { select: { id: true, name: true, phone: true } },
    },
  });

  return Response.json({
    requests: requests.map((r) => ({ ...r, needsList: parseNeeds(r.needs) })),
    total: requests.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const citizenName = String(body.citizenName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const type = String(body.type ?? "medical");
    const priority = String(body.priority ?? "high");
    const needs = parseNeeds(body.needs);
    const peopleCount = Number(body.peopleCount ?? 1) || 1;
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!citizenName || !phone) {
      return Response.json({ error: "Name and phone are required" }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return Response.json({ error: "Location is required" }, { status: 400 });
    }

    const districtInfo = nearestDistrict(lat, lng);

    const camps = await prisma.camp.findMany();
    const nearest = camps
      .map((c) => ({ camp: c, distanceKm: haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng }) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    const last = await prisma.request.findFirst({ orderBy: { id: "desc" } });
    const lastNum = last ? parseInt(last.code.split("-")[2] ?? "0", 10) : 0;
    const code = `RIP-2026-${String(lastNum + 1).padStart(5, "0")}`;

    const request = await prisma.request.create({
      data: {
        code,
        citizenName,
        phone,
        type,
        priority,
        needs: JSON.stringify(needs),
        district: String(body.district ?? districtInfo?.name ?? "Unknown"),
        location: body.location ? String(body.location).slice(0, 200) : null,
        lat,
        lng,
        peopleCount,
        status: "pending",
        campId: nearest?.camp.id ?? null,
      },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
      },
    });

    return Response.json(
      {
        request: { ...request, needsList: needs },
        routedToCamp: nearest?.camp.name ?? null,
        distanceToCampKm: nearest ? Math.round(nearest.distanceKm * 10) / 10 : null,
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Could not submit request" }, { status: 500 });
  }
}
