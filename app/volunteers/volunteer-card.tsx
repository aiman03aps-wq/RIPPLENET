"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBike,
  IconTruck,
  IconUser,
  IconCheck,
  IconChevronDown,
  IconX,
  type IconType,
} from "../components/icons";

export interface RosterVolunteer {
  id: number;
  name: string;
  phone: string;
  available: boolean;
  activeTasks: number;
  totalTasks: number;
}

export type VolunteerStatusMode = "available" | "on_duty" | "on_leave";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function VolunteerCard({ volunteer }: { volunteer: RosterVolunteer }) {
  const router = useRouter();
  const initialMode: VolunteerStatusMode =
    volunteer.activeTasks > 0
      ? "on_duty"
      : volunteer.available
      ? "available"
      : "on_leave";

  const [currentMode, setCurrentMode] = useState<VolunteerStatusMode>(initialMode);
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const statusConfigs: Record<
    VolunteerStatusMode,
    { label: string; className: string; Icon: IconType; desc: string }
  > = {
    available: {
      label: "Available",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Icon: IconBike,
      desc: "Ready for immediate emergency dispatch",
    },
    on_duty: {
      label: "On Duty",
      className: "bg-amber-100 text-amber-800 border-amber-200",
      Icon: IconTruck,
      desc: "Currently executing active flood delivery / rescue",
    },
    on_leave: {
      label: "On Leave",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      Icon: IconUser,
      desc: "Resting / off-duty",
    },
  };

  const currentConfig = statusConfigs[currentMode];
  const CurrentIcon = currentConfig.Icon;

  async function updateStatus(mode: VolunteerStatusMode) {
    setBusy(true);
    setCurrentMode(mode);
    setShowPicker(false);
    try {
      const res = await fetch("/api/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: volunteer.id,
          available: mode !== "on_leave",
          statusMode: mode,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      // Revert if error
      setCurrentMode(initialMode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-channel/10 font-display text-[15px] font-bold text-channel">
        {initials(volunteer.name)}
      </span>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[14px] font-bold text-ink">{volunteer.name}</p>
        <p className="mt-1 text-[11.5px] font-medium tabular-nums text-slate-400">
          <a href={`tel:${volunteer.phone.replace(/\s+/g, "")}`} className="hover:text-channel">
            {volunteer.phone}
          </a>
        </p>
        <p className="mt-0.5 text-[10.5px] font-medium tabular-nums text-slate-400">
          {volunteer.activeTasks} active · {volunteer.totalTasks} total
        </p>
      </div>

      {/* 3-Option Interactive Status Toggle Button */}
      <button
        type="button"
        onClick={() => setShowPicker((prev) => !prev)}
        disabled={busy}
        aria-label={`Change status for ${volunteer.name}. Current: ${currentConfig.label}`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border shadow-xs transition active:scale-95 ${currentConfig.className}`}
      >
        <CurrentIcon className="h-3.5 w-3.5 shrink-0" />
        <span>{currentConfig.label}</span>
        <IconChevronDown className="h-3 w-3 shrink-0 opacity-70" />
      </button>

      {/* 3-Option Selection Modal / Dropdown */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
            onClick={() => setShowPicker(false)}
          />

          <div className="absolute right-3 top-14 z-50 w-[240px] rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 px-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Volunteer Status
              </p>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-600"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {(["available", "on_duty", "on_leave"] as VolunteerStatusMode[]).map((mode) => {
                const config = statusConfigs[mode];
                const ModeIcon = config.Icon;
                const isSelected = currentMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateStatus(mode)}
                    className={`flex items-start gap-2.5 w-full rounded-xl p-2 text-left transition ${
                      isSelected ? "bg-sky-50 text-ink" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${config.className}`}
                    >
                      <ModeIcon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-[12px] font-bold">{config.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{config.desc}</p>
                    </div>
                    {isSelected && (
                      <IconCheck className="h-4 w-4 shrink-0 text-channel mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
