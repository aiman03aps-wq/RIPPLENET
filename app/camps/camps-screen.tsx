"use client";

import { Translated } from "../components/citizen-translated";
import { CitizenHeader } from "../components/citizen-header";
import { NearbyCamps } from "../components/nearby-camps";
import { CitizenNav } from "../components/citizen-nav";
import { useCitizenLocation } from "../components/use-citizen-location";

export function CampsScreen() {
  const { coords, locState, districtName, locate } = useCitizenLocation();

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <CitizenHeader title="Relief Camps" subtitle="Find Shelter & Medical Aid" />

      <header className="px-5 pt-4">
        <div className="leading-tight">
          <Translated k="nearbyCamps" as="h1" className="font-display text-[22px] font-bold tracking-tight text-ink" />
          <Translated k="hereForYou" as="p" className="mt-0.5 text-[12px] font-medium text-slate-500" />
        </div>
      </header>

      <main className="pb-[110px]">
        <section className="mt-4 px-5">
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl p-3.5 ${
              locState === "locating" ? "bg-sky-50" : "bg-emerald-50"
            }`}
          >
            <div className="leading-tight">
              <p
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  locState === "locating" ? "text-channel" : "text-emerald-600"
                }`}
              >
                <Translated
                  k={
                    locState === "locating"
                      ? "locatingYou"
                      : locState === "gps"
                        ? "locationCaptured"
                        : "locationFallback"
                  }
                />
              </p>
              <p className="mt-1 text-[13px] font-semibold text-ink">
                {districtName || "Pakistan"}
                {coords && (
                  <span className="ml-1.5 text-[11px] font-medium tabular-nums text-slate-500">
                    {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={locate}
              className="shrink-0 text-[12px] font-semibold text-channel"
            >
              <Translated k="retry" />
            </button>
          </div>
        </section>

        <section className="mt-5 px-5">
          {coords ? (
            <NearbyCamps lat={coords.lat} lng={coords.lng} limit={10} />
          ) : (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-6 text-center text-[12px] font-medium text-slate-400 shadow-sm">
              <Translated k="locatingYou" />
            </div>
          )}
        </section>
      </main>

      <CitizenNav active="home" />
    </div>
  );
}
