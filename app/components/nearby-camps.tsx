"use client";

import { useEffect, useState } from "react";
import { Translated } from "./citizen-translated";
import { IconMapPin, IconPhone } from "./icons";

interface NearbyCamp {
  id: number;
  name: string;
  district: string;
  province: string;
  phone: string;
  capacity: number;
  occupancy: number;
  status: string;
  distanceKm: number | null;
}

export function NearbyCamps({
  lat,
  lng,
  limit = 4,
}: {
  lat: number;
  lng: number;
  limit?: number;
}) {
  const [camps, setCamps] = useState<NearbyCamp[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/camps?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setCamps((d.camps ?? []).slice(0, limit));
      })
      .catch(() => {
        if (alive) setCamps([]);
      });
    return () => {
      alive = false;
    };
  }, [lat, lng, limit]);

  if (camps === null) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-4 text-center text-[12px] font-medium text-slate-400 shadow-sm">
        …
      </div>
    );
  }

  if (camps.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {camps.map((camp, i) => (
        <div
          key={camp.id}
          className={`flex items-center gap-3 px-3.5 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-channel">
            <IconMapPin className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13.5px] font-bold text-ink">{camp.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {camp.district}, {camp.province}
            </p>
            {camp.distanceKm != null && (
              <p className="mt-0.5 text-[11px] font-semibold text-channel">
                {camp.distanceKm} <Translated k="kmAway" />
              </p>
            )}
          </div>
          <a
            href={`tel:${camp.phone.replace(/\s+/g, "")}`}
            aria-label={`Call ${camp.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition active:scale-95"
          >
            <IconPhone className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  );
}
