"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconMenu,
  IconChevronDown,
  IconSearch,
  IconPlus,
  IconChevronRight,
  IconTent,
  IconPackage,
  IconCheck,
  IconX,
} from "../../components/icons";
import { AdminNav } from "../components/admin-nav";
import { pakistanDistricts } from "../../../lib/pakistan-districts";

type Tab = "camps" | "restock";

export interface CampView {
  id: number;
  name: string;
  district: string;
  province: string;
  status: string;
  requestCount: number;
  volunteerCount: number;
  stockStatus: "Good" | "Medium" | "Low";
}

export interface RestockView {
  id: number;
  code: string;
  campName: string;
  itemName: string;
  quantity: number;
  status: "pending" | "approved" | "fulfilled";
  priority: "High" | "Medium" | "Low";
  createdAt: string;
}

const stockBadge = (stock: CampView["stockStatus"]) => {
  const styles = {
    Good: "bg-resolved/10 text-resolved",
    Medium: "bg-signal/15 text-signal",
    Low: "bg-terracotta/10 text-terracotta",
  };
  return styles[stock];
};

const priorityIcon = (priority: RestockView["priority"]) => {
  const styles = {
    High: "bg-rose-100 text-rose-500",
    Medium: "bg-amber-100 text-amber-500",
    Low: "bg-sky-100 text-sky-500",
  };
  return styles[priority];
};

const restockStatusBadge = (status: RestockView["status"]) => {
  const styles = {
    pending: "bg-signal/15 text-signal",
    approved: "bg-sky-100 text-sky-600",
    fulfilled: "bg-resolved/10 text-resolved",
  };
  const labels = { pending: "Pending", approved: "Approved", fulfilled: "Fulfilled" };
  return { className: styles[status], label: labels[status] };
};

function timeAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CampsRestockClient({
  defaultTab = "camps",
  camps,
  restocks,
}: {
  defaultTab?: Tab;
  camps: CampView[];
  restocks: RestockView[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [restockQuery, setRestockQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [newCampName, setNewCampName] = useState("");
  const [newCampDistrict, setNewCampDistrict] = useState("");
  const [newCampPhone, setNewCampPhone] = useState("");
  const [newCampCapacity, setNewCampCapacity] = useState("100");
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const pendingCount = restocks.filter((r) => r.status === "pending").length;

  const districts = useMemo(
    () => [...new Set(camps.map((c) => c.district))].sort(),
    [camps],
  );

  const filteredCamps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return camps.filter((c) => {
      const matchesDistrict = !districtFilter || c.district === districtFilter;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q);
      return matchesDistrict && matchesQuery;
    });
  }, [camps, query, districtFilter]);

  const filteredRestocks = useMemo(() => {
    const q = restockQuery.trim().toLowerCase();
    return restocks.filter((r) => {
      const matchesPriority = !priorityFilter || r.priority === priorityFilter;
      const matchesQuery =
        !q ||
        r.campName.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [restocks, restockQuery, priorityFilter]);

  const recentRestocks = useMemo(
    () =>
      [...restocks]
        .sort((a, b) => Number(a.status === "fulfilled") - Number(b.status === "fulfilled"))
        .slice(0, 4),
    [restocks],
  );

  const provinces = useMemo(
    () => [...new Set(pakistanDistricts.map((d) => d.province))],
    [],
  );

  async function updateRestock(id: number, status: "approved" | "fulfilled") {
    setBusyId(id);
    setActionError(null);
    const res = await fetch("/api/restock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setActionError(data.error ?? "Failed to update request");
      return;
    }
    router.refresh();
  }

  async function submitCamp() {
    if (!newCampName.trim() || !newCampDistrict) {
      setSheetError("Camp name and district are required");
      return;
    }
    setAdding(true);
    setSheetError(null);
    const res = await fetch("/api/camps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCampName,
        district: newCampDistrict,
        phone: newCampPhone,
        capacity: Number(newCampCapacity),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) {
      setSheetError(data.error ?? "Failed to add camp");
      return;
    }
    setSheetOpen(false);
    setNewCampName("");
    setNewCampDistrict("");
    setNewCampPhone("");
    setNewCampCapacity("100");
    router.refresh();
  }

  function renderRestockCard(req: RestockView) {
    const status = restockStatusBadge(req.status);
    return (
      <div
        key={req.id}
        className="flex flex-col rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${priorityIcon(req.priority)}`}>
            <IconPackage className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-[13px] font-bold text-ink">{req.campName}</h3>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              {req.code} · {timeAgo(req.createdAt)} · {req.priority} priority
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              Requested: <span className="font-medium text-slate-400">{req.itemName} × {req.quantity}</span>
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2 pl-[52px]">
          {req.status === "pending" && (
            <button
              onClick={() => updateRestock(req.id, "approved")}
              disabled={busyId === req.id}
              className="rounded-lg bg-channel px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60"
            >
              {busyId === req.id ? "Approving…" : "Approve"}
            </button>
          )}
          {req.status !== "fulfilled" && (
            <button
              onClick={() => updateRestock(req.id, "fulfilled")}
              disabled={busyId === req.id}
              className="rounded-lg bg-resolved px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60"
            >
              {busyId === req.id ? "Updating…" : req.status === "approved" ? "Mark Fulfilled" : "Fulfill"}
            </button>
          )}
          {req.status === "fulfilled" && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-resolved">
              <IconCheck className="h-3.5 w-3.5" /> Delivered to camp stock
            </p>
          )}
        </div>
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
          Camps & Restock
        </h1>
        <div className="h-10 w-10" />
      </header>

      <main className="px-5 pt-4">
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("camps")}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition ${
              activeTab === "camps" ? "bg-white text-ink shadow-sm" : "text-slate-500"
            }`}
          >
            Camps
          </button>
          <button
            onClick={() => setActiveTab("restock")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition ${
              activeTab === "restock" ? "bg-white text-ink shadow-sm" : "text-slate-500"
            }`}
          >
            Restock Requests
            {pendingCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === "camps" ? (
          <section className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex h-11 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  aria-label="Filter by district"
                  className="h-full w-full appearance-none bg-transparent pr-5 text-[13px] font-semibold text-ink outline-none"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search camp..."
                  className="h-full w-full bg-transparent text-[13px] font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => {
                  setSheetError(null);
                  setSheetOpen(true);
                }}
                className="flex h-11 shrink-0 items-center gap-1 rounded-xl bg-ink px-3.5 text-[12px] font-bold text-white shadow-md shadow-ink/20 transition active:scale-95"
              >
                <IconPlus className="h-4 w-4" />
                Add Camp
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-ink">Camps Overview</h2>
              <span className="text-[12px] font-semibold text-slate-400">
                {filteredCamps.length} Camp{filteredCamps.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {filteredCamps.map((camp) => (
                <div
                  key={camp.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-channel">
                    <IconTent className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-[13px] font-bold text-ink">{camp.name}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          camp.status === "full"
                            ? "bg-terracotta/10 text-terracotta"
                            : "bg-resolved/10 text-resolved"
                        }`}
                      >
                        {camp.status === "full" ? "Full" : "Active"}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">
                      {camp.district} District, {camp.province}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Requests</p>
                        <p className="text-[13px] font-bold text-ink">{camp.requestCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Volunteers</p>
                        <p className="text-[13px] font-bold text-ink">{camp.volunteerCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Stock Status</p>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${stockBadge(camp.stockStatus)}`}>
                          {camp.stockStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </div>
              ))}
              {filteredCamps.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[12px] font-semibold text-slate-400">
                  No camps match your filters.
                </div>
              )}
            </div>

            <Link
              href="/admin/dashboard"
              className="mt-4 block w-full rounded-xl bg-sky-50 py-3 text-center text-[13px] font-bold text-channel transition active:scale-[0.99]"
            >
              View All Camps
            </Link>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-ink">Restock Requests</h2>
              <button
                onClick={() => setActiveTab("restock")}
                className="text-[12px] font-bold text-channel"
              >
                View All
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {recentRestocks.map(renderRestockCard)}
              {recentRestocks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[12px] font-semibold text-slate-400">
                  No restock requests yet.
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={restockQuery}
                  onChange={(e) => setRestockQuery(e.target.value)}
                  placeholder="Search request..."
                  className="h-full w-full bg-transparent text-[13px] font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="relative flex h-11 items-center rounded-xl border border-slate-200 bg-white pl-3 pr-8">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  aria-label="Filter by priority"
                  className="h-full w-full appearance-none bg-transparent text-[13px] font-semibold text-ink outline-none"
                >
                  <option value="">Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <IconChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-ink">Restock Requests</h2>
              <span className="text-[12px] font-semibold text-slate-400">
                {pendingCount} pending
              </span>
            </div>

            {actionError && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-3 flex flex-col gap-3">
              {filteredRestocks.map(renderRestockCard)}
              {filteredRestocks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[12px] font-semibold text-slate-400">
                  No restock requests match your filters.
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {sheetOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add camp"
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-28 pt-6 shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">
                Add Camp
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Registers a new health camp with district flood-risk data.
            </p>

            {sheetError && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {sheetError}
              </p>
            )}

            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Camp Name
            </label>
            <input
              type="text"
              value={newCampName}
              onChange={(e) => setNewCampName(e.target.value)}
              placeholder="e.g. Thatta Health Camp"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-channel"
            />

            <label className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              District
            </label>
            <select
              value={newCampDistrict}
              onChange={(e) => setNewCampDistrict(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-channel"
            >
              <option value="">Select district…</option>
              {provinces.map((province) => (
                <optgroup key={province} label={province}>
                  {pakistanDistricts
                    .filter((d) => d.province === province)
                    .map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <div className="mt-3 flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCampPhone}
                  onChange={(e) => setNewCampPhone(e.target.value)}
                  placeholder="300 1234567"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-channel"
                />
              </div>
              <div className="w-[110px]">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={newCampCapacity}
                  onChange={(e) => setNewCampCapacity(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-channel"
                />
              </div>
            </div>

            <button
              onClick={submitCamp}
              disabled={adding}
              className="mt-5 w-full rounded-xl bg-ink py-3.5 text-[14px] font-bold text-white shadow-md shadow-ink/20 transition active:scale-[0.99] disabled:opacity-60"
            >
              {adding ? "Adding camp…" : "Add Camp"}
            </button>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
}
