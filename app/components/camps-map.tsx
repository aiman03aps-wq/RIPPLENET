"use client";

import dynamic from "next/dynamic";
import type { CampMapPoint } from "./camps-map-inner";

const CampsMapInner = dynamic(() => import("./camps-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <span className="text-[11px] font-semibold text-slate-400">Loading map…</span>
    </div>
  ),
});

export type { CampMapPoint };

export function CampsMap({ points }: { points: CampMapPoint[] }) {
  return <CampsMapInner points={points} />;
}
