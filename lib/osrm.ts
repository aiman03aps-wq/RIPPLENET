import type { LatLng } from "./geo";

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: LatLng[];
  viaName: string | null;
}

// OSRM public demo server — real road-network routing (OpenStreetMap data).
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoute(
  from: LatLng,
  to: LatLng
): Promise<RouteResult | null> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    const stepNames: string[] = (route.legs?.[0]?.steps ?? [])
      .map((s: { name?: string }) => s?.name)
      .filter((n: string | undefined): n is string => typeof n === "string" && n.length > 2);
    const viaName = stepNames.length > 0 ? stepNames.reduce((a, b) => (b.length > a.length ? b : a), stepNames[0]) : null;
    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
      geometry: route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
        lat,
        lng,
      })),
      viaName,
    };
  } catch {
    return null;
  }
}
