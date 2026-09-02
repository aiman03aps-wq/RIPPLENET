"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconMenu,
  IconFunnel,
  IconBandage,
  IconUserExclamation,
  IconRoute,
  IconFileQuestion,
  IconFileChart,
  IconBarChart,
  IconPackageChart,
  IconUserChart,
  IconCheck,
  IconX,
} from "../../components/icons";
import { AdminNav } from "../components/admin-nav";

type Tab = "complaints" | "reports";
type Filter = "All" | "New" | "In Progress" | "Resolved";

export interface ComplaintAdminView {
  id: number;
  code: string;
  citizenName: string;
  message: string;
  category: string;
  status: "open" | "in_progress" | "resolved";
  response: string | null;
  createdAt: string;
  campName: string | null;
  district: string | null;
}

export interface ReportsData {
  requests: {
    code: string;
    camp: string;
    district: string;
    priority: string;
    status: string;
    people: number;
    createdAt: string;
  }[];
  camps: {
    name: string;
    district: string;
    province: string;
    requests: number;
    resolved: number;
    avgResolutionHrs: number | null;
    occupancy: number;
    capacity: number;
  }[];
  stock: {
    camp: string;
    item: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
  }[];
  restocks: {
    code: string;
    camp: string;
    item: string;
    quantity: number;
    status: string;
    createdAt: string;
  }[];
  volunteers: {
    name: string;
    camp: string | null;
    tasks: number;
    resolved: number;
    available: boolean;
  }[];
}

const categoryMeta: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }>; iconColor: string }
> = {
  delivery: { label: "Delivery Issue", Icon: IconRoute, iconColor: "bg-sky-100 text-sky-500" },
  service: { label: "Service Issue", Icon: IconUserExclamation, iconColor: "bg-amber-100 text-amber-500" },
  medical: { label: "Medical Issue", Icon: IconBandage, iconColor: "bg-rose-100 text-rose-500" },
  other: { label: "Other", Icon: IconFileQuestion, iconColor: "bg-indigo-100 text-indigo-500" },
};

const statusMap: Record<
  ComplaintAdminView["status"],
  { label: Filter; className: string }
> = {
  open: { label: "New", className: "bg-rose-100 text-rose-500" },
  in_progress: { label: "In Progress", className: "bg-sky-100 text-sky-500" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-500" },
};

function categoryOf(category: string) {
  return categoryMeta[category] ?? categoryMeta.other;
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n");
}

function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  // BOM keeps Excel happy with UTF-8 citizen names.
  const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ComplaintsReportsClient({
  defaultTab = "complaints",
  complaints,
  reports,
}: {
  defaultTab?: Tab;
  complaints: ComplaintAdminView[];
  reports: ReportsData;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [filter, setFilter] = useState<Filter>("All");
  const [ascending, setAscending] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);

  const statusOf = (c: ComplaintAdminView) => statusMap[c.status].label;

  const filters: { label: Filter; count: number }[] = [
    { label: "All", count: complaints.length },
    { label: "New", count: complaints.filter((c) => c.status === "open").length },
    { label: "In Progress", count: complaints.filter((c) => c.status === "in_progress").length },
    { label: "Resolved", count: complaints.filter((c) => c.status === "resolved").length },
  ];

  const filteredComplaints = useMemo(() => {
    const base =
      filter === "All" ? complaints : complaints.filter((c) => statusOf(c) === filter);
    return [...base].sort((a, b) =>
      ascending
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
  }, [complaints, filter, ascending]);

  const resolving = complaints.find((c) => c.id === resolveId);

  async function startReview(id: number) {
    setBusyId(id);
    setError(null);
    const res = await fetch("/api/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "in_progress" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not update complaint");
      return;
    }
    router.refresh();
  }

  async function submitResolve() {
    if (resolveId == null || !responseText.trim()) return;
    setBusyId(resolveId);
    setError(null);
    const res = await fetch("/api/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resolveId, response: responseText }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not resolve complaint");
      return;
    }
    setResolveId(null);
    setResponseText("");
    router.refresh();
  }

  function generateReport(key: string) {
    setGenerating(key);
    const stamp = new Date().toISOString().slice(0, 10);
    if (key === "requests") {
      downloadCsv(`ripplenet-requests-${stamp}.csv`, [
        ["Code", "Camp", "District", "Priority", "Status", "People", "Created"],
        ...reports.requests.map((r) => [
          r.code, r.camp, r.district, r.priority, r.status, r.people, longDate(r.createdAt),
        ]),
      ]);
    } else if (key === "camps") {
      downloadCsv(`ripplenet-camp-performance-${stamp}.csv`, [
        ["Camp", "District", "Province", "Requests", "Resolved", "Avg Resolution (hrs)", "Occupancy", "Capacity"],
        ...reports.camps.map((c) => [
          c.name, c.district, c.province, c.requests, c.resolved,
          c.avgResolutionHrs == null ? "—" : c.avgResolutionHrs.toFixed(1),
          c.occupancy, c.capacity,
        ]),
      ]);
    } else if (key === "stock") {
      downloadCsv(`ripplenet-stock-restock-${stamp}.csv`, [
        ["Type", "Camp", "Item", "Quantity", "Unit / Status", "Reorder Level / Created"],
        ...reports.stock.map((s) => [
          "Stock", s.camp, s.item, s.quantity, s.unit, s.reorderLevel,
        ]),
        ...reports.restocks.map((r) => [
          "Restock", r.camp, r.item, r.quantity, r.status, longDate(r.createdAt),
        ]),
      ]);
    } else if (key === "volunteers") {
      downloadCsv(`ripplenet-volunteer-performance-${stamp}.csv`, [
        ["Volunteer", "Camp", "Tasks", "Resolved", "Available"],
        ...reports.volunteers.map((v) => [
          v.name, v.camp ?? "Unassigned", v.tasks, v.resolved, v.available ? "Yes" : "No",
        ]),
      ]);
    }
    setTimeout(() => setGenerating(null), 800);
  }

  const reportItems = [
    {
      key: "requests",
      title: "Requests Report",
      desc: `Total requests, status breakdown, trends — ${reports.requests.length} requests`,
      Icon: IconFileChart,
      iconColor: "bg-sky-100 text-sky-500",
    },
    {
      key: "camps",
      title: "Camp Performance",
      desc: `Camp-wise performance and resolution time — ${reports.camps.length} camps`,
      Icon: IconBarChart,
      iconColor: "bg-emerald-100 text-emerald-500",
    },
    {
      key: "stock",
      title: "Stock & Restock Report",
      desc: `Stock usage and restock analysis — ${reports.stock.length} items`,
      Icon: IconPackageChart,
      iconColor: "bg-amber-100 text-amber-500",
    },
    {
      key: "volunteers",
      title: "Volunteer Performance",
      desc: `Volunteer activity and delivery stats — ${reports.volunteers.length} volunteers`,
      Icon: IconUserChart,
      iconColor: "bg-indigo-100 text-indigo-500",
    },
  ];

  function renderComplaintCard(c: ComplaintAdminView) {
    const status = statusMap[c.status];
    const { label, Icon, iconColor } = categoryOf(c.category);
    return (
      <div
        key={c.id}
        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-bold text-ink">{label}</h3>
            <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium text-slate-500">{c.message}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">
            {c.citizenName} · {c.code}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>{c.district ? `${c.district} District` : "Unassigned"}</span>
            <span>{longDate(c.createdAt)}</span>
          </div>

          {c.status === "open" && (
            <button
              onClick={() => startReview(c.id)}
              disabled={busyId === c.id}
              className="mt-2 rounded-full border border-slate-200 px-3 py-1.5 text-[10.5px] font-bold text-slate-600 transition active:scale-95 disabled:opacity-50"
            >
              {busyId === c.id ? "Starting…" : "Start Review"}
            </button>
          )}
          {c.status === "in_progress" && (
            <button
              onClick={() => {
                setResolveId(c.id);
                setResponseText("");
                setError(null);
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
  }

  function renderReportCard(r: (typeof reportItems)[number]) {
    return (
      <div
        key={r.title}
        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.iconColor}`}>
          <r.Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-ink">{r.title}</h3>
          <p className="text-[11px] font-medium text-slate-400">{r.desc}</p>
        </div>
        <button
          onClick={() => generateReport(r.key)}
          disabled={generating === r.key}
          className="shrink-0 text-[12px] font-bold text-channel transition active:scale-95 disabled:opacity-60"
        >
          {generating === r.key ? "Generating…" : "Generate"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white pb-[74px] shadow-xl">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-100 bg-white px-5">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition active:scale-95">
          <IconMenu className="h-6 w-6" strokeWidth={2.2} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-display text-[17px] font-bold text-ink">
          Complaints & Reports
        </h1>
        <div className="h-10 w-10" />
      </header>

      <main className="px-5 pt-4">
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition ${
              activeTab === "complaints" ? "bg-white text-ink shadow-sm" : "text-slate-500"
            }`}
          >
            Complaints
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition ${
              activeTab === "reports" ? "bg-white text-ink shadow-sm" : "text-slate-500"
            }`}
          >
            Reports
          </button>
        </div>

        {activeTab === "complaints" ? (
          <section className="mt-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filters.map(({ label, count }) => {
                  const active = filter === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setFilter(label)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition ${
                        active
                          ? "bg-ink text-white"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {label}
                      <span className={active ? "text-white/70" : "text-slate-400"}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setAscending((a) => !a)}
                aria-label={ascending ? "Sort by newest first" : "Sort by oldest first"}
                title={ascending ? "Sort by newest first" : "Sort by oldest first"}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition active:scale-95 ${
                  ascending
                    ? "border-channel bg-sky-50 text-channel"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <IconFunnel className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {filteredComplaints.map(renderComplaintCard)}
              {filteredComplaints.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[12px] font-semibold text-slate-400">
                  No complaints in this view.
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-[16px] font-bold text-ink">Reports</h2>
              <div className="mt-3 flex flex-col gap-3">{reportItems.map(renderReportCard)}</div>
            </div>
          </section>
        ) : (
          <section className="mt-4">
            <div className="flex flex-col gap-3">{reportItems.map(renderReportCard)}</div>
            <p className="mt-4 text-center text-[11px] font-medium text-slate-400">
              Reports export as CSV from live camp data.
            </p>
          </section>
        )}
      </main>

      {resolveId != null && resolving && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resolve complaint"
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-28 pt-6 shadow-2xl animate-slide-up"
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

            {error && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {error}
              </p>
            )}

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
              onClick={submitResolve}
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

      <AdminNav />
    </div>
  );
}
