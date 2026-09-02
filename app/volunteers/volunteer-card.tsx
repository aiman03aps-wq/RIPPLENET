"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBike, IconTruck, IconUser, type IconType } from "../components/icons";

export interface RosterVolunteer {
  id: number;
  name: string;
  phone: string;
  available: boolean;
  activeTasks: number;
  totalTasks: number;
}

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
  const [available, setAvailable] = useState(volunteer.available);
  const [busy, setBusy] = useState(false);

  const onDuty = volunteer.activeTasks > 0;
  const status = onDuty
    ? { label: "On Duty", className: "bg-orange-100 text-orange-600" }
    : available
      ? { label: "Available", className: "bg-emerald-100 text-emerald-600" }
      : { label: "On Leave", className: "bg-sky-100 text-sky-600" };
  const VehicleIcon: IconType = onDuty ? IconTruck : available ? IconBike : IconUser;

  async function toggle() {
    const next = !available;
    setBusy(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: volunteer.id, available: next }),
      });
      if (!res.ok) throw new Error("toggle failed");
      setAvailable(next);
      router.refresh();
    } catch {
      setAvailable(available);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-channel/10 font-display text-[15px] font-bold text-channel">
        {initials(volunteer.name)}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[14px] font-bold text-ink">{volunteer.name}</p>
        <p className="mt-1 text-[11.5px] font-medium tabular-nums text-slate-400">{volunteer.phone}</p>
        <p className="mt-0.5 text-[10.5px] font-medium tabular-nums text-slate-400">
          {volunteer.activeTasks} active · {volunteer.totalTasks} total
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold ${status.className}`}>
        {status.label}
      </span>
      <VehicleIcon className="h-[18px] w-[18px] shrink-0 text-slate-400" />
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={available ? `Set ${volunteer.name} off duty` : `Set ${volunteer.name} on duty`}
        aria-pressed={available}
        className={`relative h-[22px] w-[36px] shrink-0 rounded-full transition-colors ${
          available ? "bg-emerald-500" : "bg-slate-200"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
            available ? "left-[16px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
