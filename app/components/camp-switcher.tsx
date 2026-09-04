"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconMapPin, IconSearch, IconX, IconCheck, IconTent } from "./icons";

export interface SwitcherCamp {
  id: number;
  name: string;
  district: string;
  province: string;
  capacity?: number;
  occupancy?: number;
  status?: string;
}

export function CampSwitcher({
  currentCamp,
  allCamps,
  basePath = "/queue",
}: {
  currentCamp: SwitcherCamp;
  allCamps: SwitcherCamp[];
  basePath?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [switching, setSwitching] = useState(false);

  const provinces = useMemo(() => {
    const set = new Set<string>();
    allCamps.forEach((c) => {
      if (c.province) set.add(c.province);
    });
    return ["All", ...Array.from(set)];
  }, [allCamps]);

  const filteredCamps = useMemo(() => {
    return allCamps.filter((c) => {
      const matchProv = selectedProvince === "All" || c.province === selectedProvince;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q);
      return matchProv && matchSearch;
    });
  }, [allCamps, search, selectedProvince]);

  const handleSelectCamp = async (camp: SwitcherCamp) => {
    setSwitching(true);
    try {
      await fetch("/api/auth/switch-camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campId: camp.id }),
      });
      localStorage.setItem("ripplenet_active_camp_id", String(camp.id));
    } catch (e) {
      console.warn("Could not switch camp on server:", e);
    }
    setOpen(false);
    setSwitching(false);
    router.push(`${basePath}?campId=${camp.id}`);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex max-w-[280px] items-center gap-1.5 text-left transition hover:opacity-85 active:scale-98"
        aria-label="Switch Health Camp"
      >
        <span className="truncate font-display text-[18px] font-bold tracking-tight text-ink">
          {currentCamp.name || `${currentCamp.district} Health Camp`}
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <IconChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* Camp Selection Modal */}
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-[480px] rounded-t-[28px] sm:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-channel/10 text-channel">
                  <IconTent className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">Switch Relief Camp</h3>
                  <p className="text-[11px] text-slate-500">
                    Select camp to view regional queue &amp; stock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200 hover:text-slate-600 transition"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 pt-3.5 pb-2">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search camp by city, district or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-[13px] text-ink placeholder:text-slate-400 focus:border-channel focus:bg-white focus:outline-none focus:ring-2 focus:ring-channel/15"
                />
              </div>

              {/* Province Pills */}
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {provinces.map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSelectedProvince(prov)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                      selectedProvince === prov
                        ? "bg-channel text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            {/* Camps List */}
            <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-slate-100">
              {filteredCamps.map((camp) => {
                const isSelected = camp.id === currentCamp.id;
                return (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => handleSelectCamp(camp)}
                    disabled={switching}
                    className={`w-full flex items-center justify-between py-3 px-2 text-left rounded-xl transition ${
                      isSelected
                        ? "bg-sky-50/80 text-channel"
                        : "hover:bg-slate-50 text-ink"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-display text-[14px] font-bold truncate">
                          {camp.name}
                        </p>
                        {isSelected && (
                          <span className="rounded-full bg-channel px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-slate-500">
                        <IconMapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>
                          {camp.district}, {camp.province}
                        </span>
                        {camp.capacity && (
                          <span className="text-slate-400">
                            · Cap: {camp.capacity}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-channel text-white">
                          <IconCheck className="h-4 w-4 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[12px] font-semibold text-slate-400 hover:text-channel">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredCamps.length === 0 && (
                <div className="py-8 text-center text-[13px] text-slate-400">
                  No camps match your search.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center text-[12px]">
              <span className="text-slate-500">
                {allCamps.length} Relief Camps nationwide
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-bold text-channel hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
