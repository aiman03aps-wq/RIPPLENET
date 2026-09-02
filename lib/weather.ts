import type { LatLng, RainfallFigures } from "./geo";

const OM_BASE = "https://api.open-meteo.com/v1/forecast";

interface OmDaily {
  time: string[];
  precipitation_sum: (number | null)[];
}

async function fetchDaily(points: LatLng[]): Promise<OmDaily[] | null> {
  const lat = points.map((p) => p.lat).join(",");
  const lng = points.map((p) => p.lng).join(",");
  const url = `${OM_BASE}?latitude=${lat}&longitude=${lng}&past_days=7&forecast_days=4&daily=precipitation_sum&timezone=auto`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];
    return list.map((d: OmDaily) => ({
      time: d.time ?? [],
      precipitation_sum: d.precipitation_sum ?? [],
    }));
  } catch {
    return null;
  }
}

// Open-Meteo with past_days=7 & forecast_days=4 returns 11 daily entries:
// indices 0-6 are the 7 days before today, 7 is today, 8-10 the next 3 days.
function toFigures(daily: OmDaily | null): RainfallFigures {
  const p = daily?.precipitation_sum ?? [];
  const num = (i: number) => (typeof p[i] === "number" ? (p[i] as number) : 0);
  const past7 = [0, 1, 2, 3, 4, 5, 6].reduce((s, i) => s + num(i), 0);
  const next72 = [8, 9, 10].reduce((s, i) => s + num(i), 0);
  return {
    last24hMm: Math.round(num(6) * 10) / 10,
    last7dMm: Math.round(past7 * 10) / 10,
    next24hMm: Math.round(num(8) * 10) / 10,
    next72hMm: Math.round(next72 * 10) / 10,
  };
}

export async function fetchRainfall(point: LatLng): Promise<RainfallFigures> {
  const daily = await fetchDaily([point]);
  return toFigures(daily?.[0] ?? null);
}

export async function fetchRainfallBatch(
  points: LatLng[]
): Promise<RainfallFigures[]> {
  if (points.length === 0) return [];
  const daily = await fetchDaily(points);
  if (!daily) return points.map(() => toFigures(null));
  return points.map((_, i) => toFigures(daily[i] ?? null));
}
