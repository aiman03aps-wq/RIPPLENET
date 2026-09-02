"use client";

import dynamic from "next/dynamic";
import type { RouteMapPoint } from "./route-map-inner";

const RouteMapInner = dynamic(() => import("./route-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <span className="text-[11px] font-semibold text-slate-400">Loading map…</span>
    </div>
  ),
});

export type { RouteMapPoint };

export function RouteMap({
  from,
  to,
  geometry,
}: {
  from: RouteMapPoint;
  to: RouteMapPoint;
  geometry: { lat: number; lng: number }[];
}) {
  return <RouteMapInner from={from} to={to} geometry={geometry} />;
}
