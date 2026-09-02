"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconX } from "../../components/icons";

export interface AssignableVolunteer {
  id: number;
  name: string;
  phone: string;
  available: boolean;
  activeTasks: number;
  totalTasks: number;
}

interface AssignSheetProps {
  requestCode: string;
  volunteers: AssignableVolunteer[];
}

export function AssignButton({ requestCode, volunteers }: AssignSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [assignedName, setAssignedName] = useState("");

  const assignable = volunteers.filter((v) => v.available);

  async function assign(volunteerId: number) {
    setBusyId(volunteerId);
    setError("");
    try {
      const res = await fetch(`/api/requests/${requestCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", volunteerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not assign volunteer");
      setAssignedName(data.request.volunteer?.name ?? "volunteer");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not assign volunteer");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={assignable.length === 0}
        className="h-[52px] w-full rounded-full bg-ink text-[12.5px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98] disabled:opacity-50"
      >
        {assignable.length === 0 ? "No Available Volunteers" : "Accept & Assign Volunteer"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assign volunteer"
            className="w-full max-w-[480px] rounded-t-3xl bg-paper px-5 pb-12 pt-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">
                Assign Volunteer
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              {requestCode} · {assignable.length} available at this camp
            </p>

            {error && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex max-h-[45dvh] flex-col gap-2.5 overflow-y-auto">
              {volunteers.map((v) => {
                const busy = busyId === v.id;
                return (
                  <div
                    key={v.id}
                    className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm ${
                      v.available ? "" : "opacity-60"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[13px] font-bold text-sky-600">
                      {v.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13.5px] font-bold text-ink">{v.name}</span>
                      <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-slate-400">
                        {v.phone} · {v.activeTasks} active · {v.totalTasks} total
                      </span>
                    </span>
                    {v.available ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => assign(v.id)}
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-channel px-3.5 text-[11.5px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-95 disabled:opacity-50"
                      >
                        {busy ? (
                          "Assigning…"
                        ) : (
                          <>
                            <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
                            Assign
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9.5px] font-bold text-slate-500">
                        Off Duty
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {assignedName && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-emerald-500 px-4 py-2 text-[12px] font-bold text-white shadow-lg"
        >
          Assigned to {assignedName}
        </div>
      )}
    </>
  );
}
