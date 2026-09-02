export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export interface RainfallFigures {
  last24hMm: number;
  last7dMm: number;
  next24hMm: number;
  next72hMm: number;
  currentMmH?: number;
  tempC?: number;
  source?: string;
}

export type RiskLevel = "Low" | "Moderate" | "High" | "Extreme";

export interface FloodRisk {
  score: number; // 0-10
  level: RiskLevel;
  factors: { label: string; value: string }[];
}

export function computeFloodRisk(
  baseWeight: number,
  rain: RainfallFigures
): FloodRisk {
  const score =
    baseWeight * 2.5 +
    Math.min(rain.last7dMm / 100, 1.4) * 3.2 +
    Math.min(rain.last24hMm / 50, 1) * 1.6 +
    Math.min(rain.next72hMm / 80, 1.2) * 2.4;

  const rounded = Math.min(10, Math.round(score * 10) / 10);
  const level: RiskLevel =
    rounded >= 7.5 ? "Extreme" : rounded >= 5.5 ? "High" : rounded >= 3.5 ? "Moderate" : "Low";

  return {
    score: rounded,
    level,
    factors: [
      { label: "Rain last 7 days", value: `${rain.last7dMm.toFixed(1)} mm` },
      { label: "Rain last 24 hours", value: `${rain.last24hMm.toFixed(1)} mm` },
      { label: "Forecast next 24 hours", value: `${rain.next24hMm.toFixed(1)} mm` },
      { label: "Forecast next 72 hours", value: `${rain.next72hMm.toFixed(1)} mm` },
    ],
  };
}
