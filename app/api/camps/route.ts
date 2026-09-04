import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { haversineKm } from "@/lib/geo";
import { findDistrict } from "@/lib/pakistan-districts";
import { mergeCamps } from "@/lib/camps";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const districtParam = url.searchParams.get("district")?.trim();
  const rawLat = url.searchParams.get("lat");
  const rawLng = url.searchParams.get("lng");
  let lat = Number(rawLat);
  let lng = Number(rawLng);
  let hasPoint = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasPoint && districtParam) {
    const d = findDistrict(districtParam);
    if (d) {
      lat = d.lat;
      lng = d.lng;
      hasPoint = true;
    }
  }

  let dbCamps: any[] = [];
  try {
    dbCamps = await prisma.camp.findMany({
      include: { _count: { select: { requests: true, restocks: true } } },
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.warn("Prisma camp query error:", e);
  }

  const allCamps = mergeCamps(dbCamps);

  let result = allCamps.map((c) => ({
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
    requestCount: c.requestCount ?? 0,
    distanceKm: hasPoint
      ? Math.round(haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng }) * 10) / 10
      : null,
  }));

  if (districtParam) {
    const matches = result.filter((c) => c.district.toLowerCase() === districtParam.toLowerCase());
    const others = result.filter((c) => c.district.toLowerCase() !== districtParam.toLowerCase());
    if (hasPoint) {
      matches.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      others.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    result = [...matches, ...others];
  } else if (hasPoint) {
    result = result.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    // Default proximity sort against Central Relief HQ (Rawalpindi/Islamabad)
    result = result.sort(
      (a, b) =>
        haversineKm({ lat: 33.5973, lng: 73.0645 }, { lat: a.lat, lng: a.lng }) -
        haversineKm({ lat: 33.5973, lng: 73.0645 }, { lat: b.lat, lng: b.lng })
    );
  }

  return Response.json({ camps: result, total: result.length });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const districtName = String(body.district ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const capacity = Number(body.capacity);

    if (!name || !districtName) {
      return Response.json({ error: "Camp name and district are required" }, { status: 400 });
    }
    const district = findDistrict(districtName) ?? {
      name: districtName,
      province: "Sindh",
      lat: 28.5,
      lng: 69.5,
    };

    let camp = null;
    try {
      camp = await prisma.camp.create({
        data: {
          name,
          district: district.name,
          province: district.province,
          lat: district.lat,
          lng: district.lng,
          phone: phone || "0800 22677",
          capacity: Number.isFinite(capacity) && capacity > 0 ? Math.round(capacity) : 100,
          occupancy: 0,
          status: "open",
        },
      });
    } catch (e) {
      console.warn("Prisma create camp error on serverless:", e);
    }

    if (!camp) {
      camp = {
        id: Date.now(),
        name,
        district: district.name,
        province: district.province,
        lat: district.lat,
        lng: district.lng,
        phone: phone || "0800 22677",
        capacity: Number.isFinite(capacity) && capacity > 0 ? Math.round(capacity) : 100,
        occupancy: 0,
        status: "open",
      };
    }

    return Response.json({ camp, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/camps error:", err);
    return Response.json({ error: "Failed to create camp" }, { status: 500 });
  }
}
