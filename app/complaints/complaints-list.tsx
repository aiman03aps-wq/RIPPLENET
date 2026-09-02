"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconFileQuestion, IconMapPin, IconShield, IconUsers, IconX } from "../components/icons";

export interface ComplaintView {
  id: number;
  code: string;
  citizenName: string;
  message: string;
  category: string;
  status: string;
  response: string | null;
  createdAt: string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  open: { label: "New", className: "bg-orange-100 text-orange-600" },
  in_progress: { label: "In Progress", className: "bg-sky-100 text-sky-700" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-600" },
};

const categoryStyles: Record<string, { Icon: (props: { className?: string }) => React.ReactElement; tone: string; label: string }> = {
  delivery: { Icon: IconMapPin, tone: "bg-red-50 text-red-500", label: "Delivery" },
  service: { Icon: IconUsers, tone: "bg-orange-50 text-orange-500", label: "Service" },
  medical: { Icon: IconShield, tone: "bg-sky-50 text-sky-600", label: "Medical" },
  other: { Icon: IconFileQuestion, tone: "bg-purple-50 text-purple-500", label: "Other" },
};

function categoryOf(category: string) {
  return categoryStyles[category] ?? categoryStyles.other;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function ComplaintsList({ complaints }: { complaints: ComplaintView[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"inbox" | "progress" | "resolved">("inbox");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [error, setError] = useState("");

  const progressCount = complaints.filter((c) => c.status === "in_progress").length;

  const tabs = [
    { id: "inbox" as const, label: "Inbox", badge: null as number | null },
    { id: "progress" as const, label: "In Progress", badge: progressCount },
    { id: "resolved" as const, label: "Resolved", badge: null as number | null },
  ];

  const visible = complaints.filter((c) => {
    if (tab === "progress") return c.status === "in_progress";
    if (tab === "resolved") return c.status === "resolved";
    return true;
  });

  async function startReview(id: number) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "in_progress" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not update complaint");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update complaint");
    } finally {
      setBusyId(null);
    }
  }

  async function resolve() {
    if (resolveId == null) return;
    setBusyId(resolveId);
    setError("");
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolveId, response: responseText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not resolve complaint");
      setResolveId(null);
      setResponseText("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve complaint");
    } finally {
      setBusyId(null);
    }
  }

  const resolving = complaints.find((c) => c.id === resolveId);

  return (
    <div>
      <div className="mt-4 flex gap-6 border-b border-slate-200/80 px-5" role="tablist" aria-label="Complaint views">
        {tabs.map(({ id, label, badge }) => {
          const isActive = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 pb-2.5 pt-1.5 ${
                isActive ? "text-ink" : "text-slate-400"
              }`}
            >
              <span className={`text-[13px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span className="inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white">
                  {badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-channel" />
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mx-5 mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2.5 px-5">
        {visible.map((c) => {
          const status = statusStyles[c.status] ?? statusStyles.open;
          const { Icon, tone, label } = categoryOf(c.category);
          return (
            <div
              key={c.id}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-[21px] w-[21px]" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-display text-[14px] font-bold text-ink">
                    {c.citizenName}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{c.message}</p>
                <p className="mt-1.5 text-[10px] font-semibold tabular-nums text-slate-400">
                  {c.code} · {label} · {shortDate(c.createdAt)}
                </p>

                {c.status === "open" && (
                  <button
                    type="button"
                    onClick={() => startReview(c.id)}
                    disabled={busyId === c.id}
                    className="mt-2 rounded-full border border-slate-200 px-3 py-1.5 text-[10.5px] font-bold text-slate-600 transition active:scale-95 disabled:opacity-50"
                  >
                    {busyId === c.id ? "Starting…" : "Start Review"}
                  </button>
                )}
                {c.status === "in_progress" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolveId(c.id);
                      setResponseText("");
                      setError("");
                    }}
                    className="mt-2 flex items-center gap-1.5 rounded-full bg-channel px-3 py-1.5 text-[10.5px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-95"
                  >
                    <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
                    Resolve
                  </button>
                )}
                {c.status === "resolved" && c.response && (
                  <p className="mt-2 rounded-xl bg-emerald-50 px-2.5 py-2 text-[11px] leading-snug text-emerald-700">
                    {c.response}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-500">No complaints here</p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {tab === "progress"
                ? "Complaints under review will appear here."
                : tab === "resolved"
                  ? "Resolved complaints will appear here."
                  : "Citizen complaints routed to this camp will appear here."}
            </p>
          </div>
        )}
      </div>

      {resolveId != null && resolving && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resolve complaint"
            className="w-full max-w-[480px] rounded-t-3xl bg-paper px-5 pb-8 pt-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">
                Resolve Complaint
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setResolveId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              {resolving.code} · {resolving.citizenName}
            </p>

            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Resolution Note
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              placeholder="What action was taken for this citizen?"
              className="mt-1.5 h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-channel"
            />

            <button
              type="button"
              onClick={resolve}
              disabled={busyId === resolveId || responseText.trim().length === 0}
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-channel text-[12.5px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              {busyId === resolveId ? "Resolving…" : (
                <>
                  <IconCheck className="h-4 w-4" strokeWidth={3} />
                  Mark Resolved
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
