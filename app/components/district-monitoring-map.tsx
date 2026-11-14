"use client";

import dynamic from "next/dynamic";
import type { DistrictMapPoint } from "./district-monitoring-map-inner";

const DistrictMonitoringMapInner = dynamic(
  () => import("./district-monitoring-map-inner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 rounded-2xl">
        <span className="text-[11px] font-semibold text-slate-400">
          Loading district monitoring radar…
        </span>
      </div>
    ),
  }
);

export type { DistrictMapPoint };

export function DistrictMonitoringMap({
  points,
  onSelectPoint,
  selectedDistrict,
}: {
  points: DistrictMapPoint[];
  onSelectPoint?: (point: DistrictMapPoint) => void;
  selectedDistrict?: string | null;
}) {
  return (
    <DistrictMonitoringMapInner
      points={points}
      onSelectPoint={onSelectPoint}
      selectedDistrict={selectedDistrict}
    />
  );
}
