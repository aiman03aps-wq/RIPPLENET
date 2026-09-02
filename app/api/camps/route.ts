import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { haversineKm } from "@/lib/geo";
import { findDistrict } from "@/lib/pakistan-districts";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);

  const camps = await prisma.camp.findMany({
    include: { _count: { select: { requests: true, restocks: true } } },
    orderBy: [{ province: "asc" }, { name: "asc" }],
  });

  let result = camps.map((c) => ({
    id: c.id,
    name: c.name,
    district: c.district,
    province: c.province,
    lat: c.lat,
    lng: c.lng,
    phone: c.phone,
    capacity: c.capacity,
    occupancy: c.occupancy,
    status: c.status,
    requestCount: c._count.requests,
    distanceKm: hasPoint
      ? Math.round(haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng }) * 10) / 10
      : null,
  }));

  if (hasPoint) {
    result = result.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  return Response.json({ camps: result, total: result.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Only admins can register camps" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const districtName = String(body.district ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const capacity = Number(body.capacity);

  if (!name || !districtName) {
    return Response.json({ error: "Camp name and district are required" }, { status: 400 });
  }
  const district = findDistrict(districtName);
  if (!district) {
    return Response.json({ error: "Unknown district" }, { status: 400 });
  }

  const camp = await prisma.camp.create({
    data: {
      name,
      district: district.name,
      province: district.province,
      lat: district.lat,
      lng: district.lng,
      phone: phone || "0000 0000000",
      capacity: Number.isFinite(capacity) && capacity > 0 ? Math.round(capacity) : 100,
      occupancy: 0,
      status: "open",
    },
  });

  return Response.json({ camp }, { status: 201 });
}
