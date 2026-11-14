"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface DistrictMapPoint {
  district: string;
  province?: string;
  lat: number;
  lng: number;
  exposureCategory: "high" | "moderate" | "low" | "insufficient_data";
  exposureScore: number | null;
  status: "pending" | "under_verification" | "verified" | "dismissed" | "escalated" | "insufficient_data" | "normal";
  sosCount: number;
  flagged: boolean;
  alertId?: number;
}

function getMarkerIcon(point: DistrictMapPoint): L.DivIcon {
  let fill = "#10b981"; // normal: emerald
  let ring = "#d1fae5";
  let pulse = false;

  if (point.status === "pending" || (point.flagged && point.status !== "verified" && point.status !== "dismissed" && point.status !== "under_verification")) {
    fill = "#e11d48"; // gap: rose/terracotta
    ring = "#fecdd3";
    pulse = true;
  } else if (point.status === "under_verification") {
    fill = "#f59e0b"; // amber
    ring = "#fef3c7";
    pulse = true;
  } else if (point.status === "escalated") {
    fill = "#b91c1c"; // dark red
    ring = "#fee2e2";
    pulse = true;
  } else if (point.status === "verified") {
    fill = "#8b5cf6"; // purple (confirmed gap)
    ring = "#ede9fe";
  } else if (point.exposureCategory === "insufficient_data" || point.status === "insufficient_data") {
    fill = "#64748b"; // slate
    ring = "#f1f5f9";
  } else if (point.exposureCategory === "high") {
    fill = "#0284c7"; // sky/blue
    ring = "#e0f2fe";
  }

  const pulseClass = pulse ? "animate-ping" : "";

  return L.divIcon({
    className: "rn-district-pin",
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${pulse ? `<span style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: ${fill}; opacity: 0.5;" class="${pulseClass}"></span>` : ""}
        <span style="position: relative; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 9999px; background-color: ${fill}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); color: white; font-size: 10px; font-weight: bold;">
          ${point.sosCount > 9 ? "9+" : point.sosCount}
        </span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    tooltipAnchor: [0, -14],
  });
}

function FitDistricts({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
    }
  }, [map, points]);
  return null;
}

export default function DistrictMonitoringMapInner({
  points,
  onSelectPoint,
  selectedDistrict,
}: {
  points: DistrictMapPoint[];
  onSelectPoint?: (point: DistrictMapPoint) => void;
  selectedDistrict?: string | null;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={positions[0] ?? [29.5, 69.0]}
        zoom={5}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full relative z-[1] isolate rounded-2xl"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {points.map((p) => (
          <Marker
            key={`${p.district}-${p.lat}-${p.lng}`}
            position={[p.lat, p.lng]}
            icon={getMarkerIcon(p)}
            eventHandlers={{
              click: () => onSelectPoint?.(p),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-left text-[11px] leading-tight">
                <p className="font-bold text-slate-800">{p.district}</p>
                <p className="text-slate-500">
                  Flood Exposure: {p.exposureScore !== null ? `${Math.round(p.exposureScore * 100)}%` : "Insufficient Data"}
                </p>
                <p className="font-semibold text-rose-600">
                  SOS Count: {p.sosCount} ({p.status.replace("_", " ").toUpperCase()})
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">Click to verify district</p>
              </div>
            </Tooltip>
          </Marker>
        ))}
        <FitDistricts points={positions} />
      </MapContainer>

      {/* Map Zoom Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-[500] flex flex-col gap-1">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => map?.zoomIn()}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[14px] font-bold text-ink shadow-md transition active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => map?.zoomOut()}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[14px] font-bold text-ink shadow-md transition active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}
