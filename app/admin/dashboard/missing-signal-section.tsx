"use client";

import { useState, useEffect } from "react";
import { DistrictMonitoringMap, type DistrictMapPoint } from "../../components/district-monitoring-map";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconRefresh,
  IconMapPin,
  IconShield,
  IconX,
  IconUsers,
  IconActivity,
  IconTruck,
  IconSparkles,
  IconChevronRight,
  IconSearch,
  IconReportChart,
} from "../../components/icons";

export interface MissingSignalActionItem {
  id: number;
  fromStatus: string;
  toStatus: string;
  action: string;
  notes: string | null;
  actorName: string;
  createdAt: string;
}

export interface MissingSignalAlertItem {
  id: number;
  district: string;
  province: string | null;
  exposureCategory: "high" | "moderate" | "low" | "insufficient_data";
  exposureScore: number | null;
  dataSource: string;
  dataTimestamp: string;
  sosCount: number;
  monitoringStart: string;
  monitoringEnd: string;
  reason: string;
  status: "pending" | "under_verification" | "verified" | "dismissed" | "escalated" | "insufficient_data";
  verificationNotes: string | null;
  reviewerName: string | null;
  actions?: MissingSignalActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MissingSignalSummary {
  totalMonitored: number;
  potentialGapsCount: number;
  insufficientDataCount: number;
  verifiedGapsCount: number;
  dismissedCount: number;
  underVerificationCount: number;
}

export function MissingSignalSection() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [summary, setSummary] = useState<MissingSignalSummary>({
    totalMonitored: 61,
    potentialGapsCount: 0,
    insufficientDataCount: 0,
    verifiedGapsCount: 0,
    dismissedCount: 0,
    underVerificationCount: 0,
  });
  const [alerts, setAlerts] = useState<MissingSignalAlertItem[]>([]);
  const [monitoringHours, setMonitoringHours] = useState<number>(48);
  const [sosThreshold, setSosThreshold] = useState<number>(2);
  const [selectedAlert, setSelectedAlert] = useState<MissingSignalAlertItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("gaps");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDemoGuide, setShowDemoGuide] = useState<boolean>(true);

  // Form state for updating verification status
  const [statusInput, setStatusInput] = useState<string>("under_verification");
  const [notesInput, setNotesInput] = useState<string>("");
  const [reviewerInput, setReviewerInput] = useState<string>("Ali Hassan (Admin)");
  const [savingVerification, setSavingVerification] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Load initial alerts
  useEffect(() => {
    fetchAlerts();
  }, [monitoringHours, sosThreshold]);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/missing-signals?hours=${monitoringHours}&threshold=${sosThreshold}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load missing-signal alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerPipelineScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/missing-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scan",
          monitoringHours,
          sosThresholdLow: sosThreshold,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setScanning(false);
    }
  }

  async function loadDemoScenarios() {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/missing-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_demo" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        if (data.summary) setSummary(data.summary);
        // Automatically select District B to demonstrate
        const districtB = (data.alerts as MissingSignalAlertItem[]).find((a) => a.district === "District B");
        if (districtB) {
          openVerificationDrawer(districtB);
        }
      }
    } catch (err) {
      console.error("Demo load failed:", err);
    } finally {
      setScanning(false);
    }
  }

  function openVerificationDrawer(alert: MissingSignalAlertItem) {
    setSelectedAlert(alert);
    setStatusInput(alert.status === "pending" ? "under_verification" : alert.status);
    setNotesInput(alert.verificationNotes || "");
    setVerificationFeedback(null);
  }

  async function handleSaveVerification() {
    if (!selectedAlert) return;
    setSavingVerification(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch(`/api/admin/missing-signals/${selectedAlert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusInput,
          verificationNotes: notesInput,
          reviewerName: reviewerInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedAlert = data.alert;
        setSelectedAlert(updatedAlert);
        setAlerts((prev) => prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)));
        setVerificationFeedback("Verification findings and status successfully recorded in audit history.");
        // Refresh summary
        fetchAlerts();
      } else {
        setVerificationFeedback("Failed to update status. Please try again.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setVerificationFeedback("Network error while recording verification.");
    } finally {
      setSavingVerification(false);
    }
  }

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (searchTerm) {
      const match =
        alert.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alert.province && alert.province.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }

    if (activeFilter === "gaps") {
      return (
        alert.exposureCategory === "high" &&
        (alert.status === "pending" || alert.status === "under_verification" || alert.status === "escalated")
      );
    }
    if (activeFilter === "under_verification") return alert.status === "under_verification";
    if (activeFilter === "verified") return alert.status === "verified";
    if (activeFilter === "dismissed") return alert.status === "dismissed";
    if (activeFilter === "insufficient") {
      return alert.exposureCategory === "insufficient_data" || alert.status === "insufficient_data";
    }
    return true; // all
  });

  // Prepare map points
  const mapPoints: DistrictMapPoint[] = alerts.map((a) => {
    // Determine coordinate based on district
    let lat = 28.9417;
    let lng = 68.31;
    if (a.district === "District A") {
      lat = 26.7319;
      lng = 67.7761;
    } else if (a.district === "District B") {
      lat = 28.9417;
      lng = 68.31;
    } else if (a.district === "District C") {
      lat = 29.8953;
      lng = 69.2514;
    } else if (a.district === "Rajanpur") {
      lat = 29.1053;
      lng = 70.3304;
    } else if (a.district === "Dera Ghazi Khan") {
      lat = 30.0489;
      lng = 70.6463;
    } else if (a.district === "Dadu") {
      lat = 26.7319;
      lng = 67.7761;
    } else if (a.district === "Badin") {
      lat = 24.6561;
      lng = 68.8368;
    }

    return {
      district: a.district,
      province: a.province || undefined,
      lat,
      lng,
      exposureCategory: a.exposureCategory,
      exposureScore: a.exposureScore,
      status: a.status,
      sosCount: a.sosCount,
      flagged: a.exposureCategory === "high" || a.exposureCategory === "insufficient_data",
      alertId: a.id,
    };
  });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <section className="mt-5 px-5" aria-label="Missing-Signal Detection Pipeline">
      <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-cyan-pop shadow-sm">
                <IconActivity className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink">
                  Missing-Signal Detection Pipeline
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Flood exposure vs. SOS activity radar · District-level monitoring
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-channel">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-channel" />
              Rule-Based
            </span>
          </div>

          {/* Principle Callout */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-2.5 text-[11px] leading-relaxed text-amber-900">
            <span className="font-bold">Core Principle: </span>
            <span className="italic">“An absence of distress calls does not mean an absence of disaster.”</span>
            <span className="block mt-0.5 text-[10.5px] text-amber-800/90">
              Flags districts where satellite flood inundation is severe but citizen SOS volume is unexpectedly low, triggering prioritized human field verification.
            </span>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Districts Monitored</p>
            <p className="mt-1 font-display text-[20px] font-extrabold text-ink">{summary.totalMonitored}</p>
            <p className="text-[9.5px] text-slate-500">4 Provinces + AJK</p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Potential Gaps</p>
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <p className="mt-1 font-display text-[20px] font-extrabold text-rose-600">{summary.potentialGapsCount}</p>
            <p className="text-[9.5px] font-semibold text-rose-700">High flood / Low SOS</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Under Verification</p>
            <p className="mt-1 font-display text-[20px] font-extrabold text-amber-600">{summary.underVerificationCount}</p>
            <p className="text-[9.5px] text-amber-700">Field scouts deployed</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Insufficient Data</p>
            <p className="mt-1 font-display text-[20px] font-extrabold text-slate-700">{summary.insufficientDataCount}</p>
            <p className="text-[9.5px] text-slate-500">Stale/offline feeds</p>
          </div>
        </div>

        {/* Configurable Monitoring Controls & Actions */}
        <div className="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Window:</span>
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                {[24, 48, 168].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setMonitoringHours(h)}
                    className={`rounded-lg px-2 py-1 text-[10.5px] font-bold transition ${
                      monitoringHours === h ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
                    }`}
                  >
                    {h === 168 ? "7 Days" : `${h}h`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Low SOS Threshold:</span>
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                {[1, 2, 3].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setSosThreshold(th)}
                    className={`rounded-lg px-2 py-1 text-[10.5px] font-bold transition ${
                      sosThreshold === th ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
                    }`}
                  >
                    ≤{th} SOS
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerPipelineScan}
                disabled={scanning}
                className="flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
              >
                <IconRefresh className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Scanning…" : "Re-Scan Pipeline"}
              </button>

              <button
                type="button"
                onClick={loadDemoScenarios}
                disabled={scanning}
                className="flex items-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-bold text-channel shadow-2xs transition hover:bg-cyan-100 active:scale-95"
              >
                <IconSparkles className="h-3.5 w-3.5" />
                Demo (A, B, C)
              </button>
            </div>
          </div>
        </div>

        {/* Section 8 Demonstration & Testing Benchmark Panel */}
        {showDemoGuide && (
          <div className="mt-3.5 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconReportChart className="h-4 w-4 text-channel" />
                <h3 className="font-display text-[12.5px] font-bold text-ink">
                  Standard Demonstration Benchmark (Section 8)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoGuide(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-cyan-200/60 text-slate-500">
                    <th className="pb-1 font-semibold">Test District</th>
                    <th className="pb-1 font-semibold">Flood Exposure</th>
                    <th className="pb-1 font-semibold">SOS Activity</th>
                    <th className="pb-1 font-semibold">System Response</th>
                    <th className="pb-1 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100/60 text-slate-700">
                  <tr>
                    <td className="py-1.5 font-bold text-ink">District A</td>
                    <td className="py-1.5">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        High (88%)
                      </span>
                    </td>
                    <td className="py-1.5 font-semibold text-emerald-600">14 SOS (High)</td>
                    <td className="py-1.5 text-slate-500">No missing-signal flag (Proportional)</td>
                    <td className="py-1.5 text-right">
                      <span className="text-[10px] font-semibold text-slate-400">Normal</span>
                    </td>
                  </tr>
                  <tr className="bg-rose-50/50">
                    <td className="py-1.5 font-bold text-rose-900">District B</td>
                    <td className="py-1.5">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        High (94%)
                      </span>
                    </td>
                    <td className="py-1.5 font-bold text-rose-600">1 SOS (Unusually Low)</td>
                    <td className="py-1.5 font-semibold text-rose-700">
                      FLAGGED: Potential Reporting Gap
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const b = alerts.find((x) => x.district === "District B");
                          if (b) openVerificationDrawer(b);
                          else loadDemoScenarios();
                        }}
                        className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs hover:bg-rose-700 transition"
                      >
                        Verify Alert →
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-ink">District C</td>
                    <td className="py-1.5">
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        Insufficient Data
                      </span>
                    </td>
                    <td className="py-1.5 text-slate-400">0 SOS (Unknown)</td>
                    <td className="py-1.5 text-slate-600">Marked as insufficient data</td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const c = alerts.find((x) => x.district === "District C");
                          if (c) openVerificationDrawer(c);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* District-level Monitoring Map */}
        <div className="mt-4">
          <div className="flex items-center justify-between pb-1.5">
            <h3 className="font-display text-[13px] font-bold text-ink">
              District-Level Telemetry Map
            </h3>
            <div className="flex items-center gap-2 text-[9.5px]">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Potential Gap
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> In Verification
              </span>
              <span className="flex items-center gap-1 font-semibold text-purple-600">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> Confirmed
              </span>
            </div>
          </div>

          <div className="relative h-[210px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
            <DistrictMonitoringMap
              points={mapPoints}
              onSelectPoint={(p) => {
                const found = alerts.find((a) => a.district === p.district);
                if (found) openVerificationDrawer(found);
              }}
              selectedDistrict={selectedAlert?.district}
            />
          </div>
        </div>

        {/* Filters and Search for Alert List */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[13px] font-bold text-ink">
              Monitored Alert Feed ({filteredAlerts.length})
            </h3>
            <div className="relative w-36">
              <input
                type="text"
                placeholder="Search district…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-ink placeholder:text-slate-400 focus:border-channel focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "gaps", label: `Potential Gaps (${summary.potentialGapsCount})` },
              { id: "under_verification", label: `In Verification (${summary.underVerificationCount})` },
              { id: "verified", label: `Confirmed (${summary.verifiedGapsCount})` },
              { id: "dismissed", label: `Dismissed (${summary.dismissedCount})` },
              { id: "insufficient", label: `Insufficient Data (${summary.insufficientDataCount})` },
              { id: "all", label: `All Alerts (${alerts.length})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFilter(id)}
                className={`rounded-xl px-2.5 py-1 text-[10.5px] font-bold transition ${
                  activeFilter === id
                    ? "bg-ink text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Flagged Districts & Alerts */}
        <div className="mt-3 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
              <p className="text-[12px] font-semibold">No alerts match the selected criteria.</p>
              <button
                type="button"
                onClick={loadDemoScenarios}
                className="mt-2 text-[11px] font-bold text-channel hover:underline"
              >
                Click to load sample benchmark scenarios (Districts A, B, C)
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isGap = alert.exposureCategory === "high" && alert.status !== "dismissed";
              const isVerified = alert.status === "verified";
              const isUnderVerification = alert.status === "under_verification";
              const isDismissed = alert.status === "dismissed";
              const isInsufficient = alert.exposureCategory === "insufficient_data" || alert.status === "insufficient_data";

              let badgeColor = "bg-rose-100 text-rose-700 border-rose-200";
              let badgeLabel = "Potential Gap";
              if (isVerified) {
                badgeColor = "bg-purple-100 text-purple-700 border-purple-200";
                badgeLabel = "Verified Gap";
              } else if (isUnderVerification) {
                badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
                badgeLabel = "Field Scout Dispatched";
              } else if (isDismissed) {
                badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
                badgeLabel = "Dismissed Safe";
              } else if (isInsufficient) {
                badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                badgeLabel = "Insufficient Telemetry";
              }

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-3.5 transition shadow-2xs ${
                    selectedAlert?.id === alert.id
                      ? "border-channel bg-sky-50/40 ring-2 ring-channel/20"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-[13.5px] font-bold text-ink">
                          {alert.district}
                        </h4>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${badgeColor}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {alert.province || "Pakistan Flood Basin"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openVerificationDrawer(alert)}
                      className="flex items-center gap-1 rounded-xl bg-ink px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
                    >
                      Verify / Review
                      <IconChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Supporting Comparison Metrics */}
                  <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-[10.5px]">
                    <div>
                      <span className="text-slate-400">Flood Inundation</span>
                      <p className="font-bold text-ink">
                        {alert.exposureScore !== null ? `${Math.round(alert.exposureScore * 100)}% Index` : "Unavailable"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">SOS Calls in {monitoringHours}h</span>
                      <p className={`font-bold ${alert.sosCount <= sosThreshold ? "text-rose-600" : "text-emerald-600"}`}>
                        {alert.sosCount} received
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Data Freshness</span>
                      <p className="font-medium text-slate-600">{timeAgo(alert.dataTimestamp)}</p>
                    </div>
                  </div>

                  {/* Explainable Reason */}
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    <span className="font-semibold text-ink">Alert Diagnosis: </span>
                    {alert.reason}
                  </p>

                  {/* Verification Findings Note preview if exists */}
                  {alert.verificationNotes && (
                    <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/40 p-2 text-[10.5px] text-amber-900">
                      <span className="font-bold">Human Verification Log: </span>
                      {alert.verificationNotes}
                      <span className="block mt-0.5 text-[9.5px] text-amber-700">
                        Recorded by {alert.reviewerName || "Admin"} · {timeAgo(alert.updatedAt)}
                      </span>
                    </div>
                  )}

                  {/* Data Source & Timestamps */}
                  <div className="mt-2 flex items-center justify-between text-[9.5px] text-slate-400 border-t border-slate-100 pt-1.5">
                    <span>Source: {alert.dataSource}</span>
                    <span>Monitoring: {monitoringHours}h window</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Human Verification Drawer / Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedAlert(null)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Human verification for missing signal"
            className="relative z-10 w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl animate-slide-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <IconShield className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">
                    Field Verification &amp; Audit
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    District: {selectedAlert.district} ({selectedAlert.province || "Pakistan"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Evidence Comparison Panel */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              <h4 className="font-display text-[12px] font-bold uppercase tracking-wider text-slate-400">
                Supporting Evidence &amp; Inundation Telemetry
              </h4>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-white p-2.5 shadow-2xs">
                  <span className="text-slate-400">Flood Exposure</span>
                  <p className="font-display text-[15px] font-bold text-rose-600">
                    {selectedAlert.exposureScore !== null ? `${Math.round(selectedAlert.exposureScore * 100)}%` : "N/A"}
                  </p>
                  <p className="text-[9.5px] text-slate-500">
                    Category: {selectedAlert.exposureCategory.toUpperCase()}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-2.5 shadow-2xs">
                  <span className="text-slate-400">SOS Distress Calls</span>
                  <p className="font-display text-[15px] font-bold text-ink">
                    {selectedAlert.sosCount} calls
                  </p>
                  <p className="text-[9.5px] text-rose-600 font-semibold">
                    Expected: {selectedAlert.exposureCategory === "high" ? "High volume (>10)" : "Low"}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Telemetry Feed Source:</span>
                  <span className="font-semibold text-ink">{selectedAlert.dataSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telemetry Freshness:</span>
                  <span className="font-semibold text-ink">{timeAgo(selectedAlert.dataTimestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monitoring Interval:</span>
                  <span className="font-semibold text-ink">{monitoringHours} hours</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200/80 bg-white p-2.5">
                <p className="text-[11px] leading-relaxed text-slate-700">
                  <span className="font-bold text-ink">Pipeline Reason: </span>
                  {selectedAlert.reason}
                </p>
              </div>
            </div>

            {/* Mandatory Human Oversight Safeguard Notice (Section 5) */}
            <div className="mt-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] leading-relaxed text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <IconAlertTriangle className="h-4 w-4 text-amber-600" />
                Human Verification Protocol (Mandatory Safeguard)
              </div>
              <p className="mt-1 text-[10.5px]">
                The system recommends human verification when a reporting gap is detected. In accordance with system safeguards, the pipeline will <strong>never automatically dispatch volunteers</strong>, declare a communications blackout, alter existing SOS records, or allocate relief resources without human review.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold text-amber-800">
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5">✓ Frontline Volunteers</span>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5">✓ Relief Camp Managers</span>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5">✓ Local Field Reports</span>
              </div>
            </div>

            {/* Verification Decision Form */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <h4 className="font-display text-[12.5px] font-bold text-ink">
                Record Verification Status &amp; Field Findings
              </h4>

              {/* Status Selector */}
              <div className="mt-2.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Actionable Verification Status:
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[
                    { id: "under_verification", label: "Under Verification", desc: "Field team checking ground" },
                    { id: "verified", label: "Verified Gap", desc: "Confirmed cutoff / silent distress" },
                    { id: "dismissed", label: "Dismissed Safe", desc: "Verified normal / false alarm" },
                    { id: "escalated", label: "Escalated", desc: "Urgent scout deployment" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusInput(s.id)}
                      className={`flex flex-col text-left rounded-xl border p-2 transition ${
                        statusInput === s.id
                          ? "border-ink bg-slate-50 ring-2 ring-ink/10"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-ink">{s.label}</span>
                      <span className="text-[9.5px] text-slate-400">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Notes */}
              <div className="mt-3">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Field Verification Findings &amp; Ground Notes:
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record observations (e.g. Contacted Alkhidmat camp manager at Indus highway; telecom tower submerged; 45 families stranded without mobile coverage)..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-[11.5px] leading-relaxed text-ink placeholder:text-slate-400 focus:border-channel focus:outline-none"
                />
              </div>

              {/* Reviewer Name */}
              <div className="mt-2.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Reviewing Administrator:
                </label>
                <input
                  type="text"
                  value={reviewerInput}
                  onChange={(e) => setReviewerInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-[11.5px] text-ink focus:border-channel focus:outline-none"
                />
              </div>

              {verificationFeedback && (
                <div className="mt-2.5 rounded-xl bg-emerald-50 p-2 text-[11px] font-medium text-emerald-700">
                  {verificationFeedback}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveVerification}
                disabled={savingVerification}
                className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-[12px] font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
              >
                <IconCheck className="h-4 w-4" />
                {savingVerification ? "Recording Findings…" : "Save Verification Findings"}
              </button>
            </div>

            {/* Audit History Log (Section 6) */}
            <div className="mt-4">
              <h4 className="font-display text-[12px] font-bold uppercase tracking-wider text-slate-400">
                Audit History &amp; Decision Trail ({selectedAlert.actions?.length || 0})
              </h4>

              <div className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                {selectedAlert.actions && selectedAlert.actions.length > 0 ? (
                  selectedAlert.actions.map((act) => (
                    <div key={act.id} className="py-2 first:pt-0 last:pb-0 text-[10.5px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">
                          {act.action.replace("_", " ").toUpperCase()}: {act.fromStatus} → {act.toStatus}
                        </span>
                        <span className="text-slate-400">{timeAgo(act.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600">{act.notes}</p>
                      <p className="text-[9.5px] font-medium text-slate-400 mt-0.5">
                        Actor: {act.actorName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No previous decisions logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
