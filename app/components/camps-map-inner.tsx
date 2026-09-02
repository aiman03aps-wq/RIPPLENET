"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface CampMapPoint {
  lat: number;
  lng: number;
  label: string;
  detail: string;
  status: string;
}

function campPin(fill: string): L.DivIcon {
  return L.divIcon({
    className: "rn-pin",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.1 11.03 19.26 11.5 19.69.44.41 1.11.41 1.55 0C13.5 32.26 26 22.1 26 13 26 5.82 20.18 0 13 0z" fill="${fill}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="13" cy="12.5" r="4.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    tooltipAnchor: [0, -28],
  });
}

const statusFill: Record<string, string> = {
  open: "#0e9f6e",
  full: "#c1440e",
  closed: "#64748b",
};

function FitCamps({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
  }, [map, points]);
  return null;
}

export default function CampsMapInner({ points }: { points: CampMapPoint[] }) {
  const [map, setMap] = useState<L.Map | null>(null);
  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={positions[0] ?? [30.3753, 69.3451]}
        zoom={5}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl
        className="h-full w-full relative z-[1] isolate"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((p) => (
          <Marker key={`${p.lat},${p.lng}`} position={[p.lat, p.lng]} icon={campPin(statusFill[p.status] ?? "#0b3d5c")}>
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              {p.label} — {p.detail}
            </Tooltip>
          </Marker>
        ))}
        <FitCamps points={positions} />
      </MapContainer>
      <div className="absolute bottom-3 right-3 z-[500] flex flex-col gap-1.5">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => map?.zoomIn()}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[16px] font-bold text-ink shadow-md transition active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => map?.zoomOut()}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[16px] font-bold text-ink shadow-md transition active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}
