"use client";

import { useCallback, useEffect, useState } from "react";
import { nearestDistrict } from "../../lib/pakistan-districts";

const FALLBACK = { lat: 33.5973, lng: 73.0645 };

export type LocationSource = "locating" | "gps" | "fallback";

export function useCitizenLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<LocationSource>("locating");
  const [districtName, setDistrictName] = useState("");

  const apply = useCallback((lat: number, lng: number, source: "gps" | "fallback") => {
    setCoords({ lat, lng });
    setLocState(source);
    const d = nearestDistrict(lat, lng);
    setDistrictName(d ? `${d.name}, ${d.province}` : "Pakistan");
  }, []);

  const locate = useCallback(() => {
    setLocState("locating");
    if (!("geolocation" in navigator)) {
      apply(FALLBACK.lat, FALLBACK.lng, "fallback");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => apply(pos.coords.latitude, pos.coords.longitude, "gps"),
      () => apply(FALLBACK.lat, FALLBACK.lng, "fallback"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [apply]);

  useEffect(() => {
    locate();
  }, [locate]);

  return { coords, locState, districtName, locate };
}
