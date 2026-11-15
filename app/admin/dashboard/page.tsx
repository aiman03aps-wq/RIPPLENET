import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthGuard } from "../../components/auth-guard";
import { CampsMap, type CampMapPoint } from "../../components/camps-map";
import { NotificationBell } from "../../components/notification-bell";
import {
  IconArrowRight,
  IconBrain,
  IconCalendar,
  IconCheck,
  IconCoins,
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconMapPin,
  IconMenu,
  IconMessageSquareWarning,
  IconResourceAgent,
  IconRouteAgent,
  IconShield,
  IconTrendingUp,
  IconTruck,
  IconUserCheck,
  IconWaterKit,
} from "../../components/icons";
import { AdminNav } from "../components/admin-nav";
import { AdminHeader } from "../components/admin-header";
import { RecentActivitySection, type ActivityItem } from "./recent-activity-section";
import { MissingSignalSection } from "./missing-signal-section";
import { AdminAgentTerminal } from "./admin-agent-terminal";
import { prisma } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { assessRisk } from "../../../lib/risk";
import { parseNeeds } from "../../../lib/needs";
import { AnimatedNumber } from "../../components/animated-number";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard — RippleNet AI",
};

function DonutChart({
  counts,
}: {
  counts: { assigned: number; inTransit: number; resolved: number; pending: number; total: number };
}) {
  const { assigned, inTransit, resolved, pending, total } = counts;
  const seg = (n: number) => (total > 0 ? (n / total) * 360 : 0);
  let acc = 0;
  const stops = [
    { color: "#3b82f6", deg: seg(assigned) },
    { color: "#38bdf8", deg: seg(inTransit) },
    { color: "#10b981", deg: seg(resolved) },
    { color: "#f59e0b", deg: seg(pending) },
  ]
    .filter((s) => s.deg > 0)
    .map((s) => {
      const from = acc;
      acc += s.deg;
      return `${s.color} ${from}deg ${acc}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-[120px] w-[120px] rounded-full"
        style={{ background: `conic-gradient(from 0deg, ${stops || "#e2e8f0 0deg 360deg"})` }}
      >
        <div className="absolute inset-0 m-auto flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white">
          <span className="font-display text-[11px] font-bold text-slate-400">Total</span>
          <span className="font-display text-[18px] font-extrabold text-ink">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {[
          { label: "Assigned", value: assigned.toLocaleString(), dot: "bg-blue-500" },
          { label: "In Transit", value: inTransit.toLocaleString(), dot: "bg-sky-400" },
          { label: "Resolved", value: resolved.toLocaleString(), dot: "bg-emerald-500" },
          { label: "Pending", value: pending.toLocaleString(), dot: "bg-amber-500" },
        ].map(({ label, value, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="text-[10px] font-semibold text-slate-600">
              {label} <span className="text-ink">{value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ bars }: { bars: { label: string; value: number }[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const colors = ["bg-emerald-500", "bg-amber-400", "bg-orange-500", "bg-red-500"];
  const texts = ["text-emerald-600", "text-amber-600", "text-orange-600", "text-red-600"];
  return (
    <div className="flex h-full flex-col justify-end">
      <div className="flex items-end justify-between gap-1">
        {bars.map(({ label, value }, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={`font-display text-[11px] font-extrabold ${texts[i]}`}>{value}</span>
            <div className="h-[70px] w-full rounded-t-lg bg-slate-100">
              <div
                className={`w-full rounded-t-lg ${colors[i]}`}
                style={{ height: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  let statusGroups: any[] = [];
  let camps: any[] = [];
  let volunteerCount = 0;
  let availableVolunteers = 0;
  let restockPending = 0;
  let unresolvedComplaints = 0;
  let recentRequests: any[] = [];
  let allRequests: any[] = [];

  try {
    const results = await Promise.all([
      prisma.request.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.camp.findMany({ orderBy: { name: "asc" } }),
      prisma.user.count({ where: { role: "volunteer" } }),
      prisma.user.count({ where: { role: "volunteer", available: true } }),
      prisma.restockRequest.count({ where: { status: "pending" } }),
      prisma.complaint.count({ where: { status: { not: "resolved" } } }),
      prisma.request.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          camp: { select: { name: true, district: true } },
          volunteer: { select: { name: true } },
        },
      }),
      prisma.request.findMany({
        select: { priority: true, type: true, peopleCount: true, needs: true, createdAt: true },
      }),
    ]);
    statusGroups = results[0];
    camps = results[1];
    volunteerCount = results[2];
    availableVolunteers = results[3];
    restockPending = results[4];
    unresolvedComplaints = results[5];
    recentRequests = results[6];
    allRequests = results[7];
  } catch (dbErr) {
    console.warn("Prisma unavailable or unconfigured in local development, running dashboard with safe defaults:", (dbErr as Error).message);
  }

  const statusCounts: Record<string, number> = {};
  for (const g of statusGroups) statusCounts[g.status] = g._count._all;
  const total = allRequests.length;
  const pending = statusCounts.pending ?? 0;
  const assigned = statusCounts.assigned ?? 0;
  const inTransit = statusCounts.in_transit ?? 0;
  const resolved = statusCounts.resolved ?? 0;
  const inProgress = assigned + inTransit;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const todayCount = allRequests.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;

  const riskBars = [
    { label: "Low", value: 0 },
    { label: "Medium", value: 0 },
    { label: "High", value: 0 },
    { label: "Very High", value: 0 },
  ];
  for (const r of allRequests) {
    const { level } = assessRisk({
      priority: r.priority,
      type: r.type,
      peopleCount: r.peopleCount,
      needs: parseNeeds(r.needs),
    });
    const idx = riskBars.findIndex((b) => b.label === level);
    if (idx >= 0) riskBars[idx].value += 1;
  }

  const highRiskCount =
    (riskBars.find((b) => b.label === "Very High")?.value ?? 0) +
    (riskBars.find((b) => b.label === "High")?.value ?? 0);

  const mapPoints: CampMapPoint[] = camps.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    label: c.name,
    detail: `${c.district}, ${c.province}`,
    status: c.status,
  }));
  const openCamps = camps.filter((c) => c.status === "open").length;

  let choleraSignals = 0;
  let malariaSignals = 0;
  let waterReliefSignals = 0;
  let totalPeopleServiced = 0;
  for (const r of allRequests) {
    totalPeopleServiced += r.peopleCount;
    const n = parseNeeds(r.needs).join(" ").toLowerCase();
    if (/diarrhea|cholera|vomit/i.test(n)) choleraSignals += 1;
    if (/fever|malaria|dengue/i.test(n)) malariaSignals += 1;
    if (/water|thirst|clean water/i.test(n)) waterReliefSignals += 1;
  }
  const avgCostPerBeneficiary = 3450;
  const totalAidValuationPkr = totalPeopleServiced * avgCostPerBeneficiary;

  const activityItems: ActivityItem[] = recentRequests.map((r) => {
    const dateObj = new Date(r.createdAt);
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const fullDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    let title = "New request received";
    let detail = r.location || `${r.district} District`;
    let type: ActivityItem["type"] = "pending";

    if (r.status === "resolved") {
      title = "Request resolved";
      detail = `Aid delivered to ${r.citizenName} (${r.peopleCount} people)`;
      type = "resolved";
    } else if (r.status === "in_transit") {
      title = "Delivery in transit";
      detail = `${r.volunteer?.name ?? "Volunteer"} en route to ${r.citizenName}`;
      type = "in_transit";
    } else if (r.status === "assigned") {
      title = "Volunteer assigned";
      detail = `${r.volunteer?.name ?? "Volunteer"} tasked for ${r.citizenName}`;
      type = "assigned";
    } else {
      title = "New SOS request";
      detail = `${r.citizenName} requested urgent relief for ${r.peopleCount} people`;
      type = "pending";
    }

    return {
      id: r.id,
      title,
      detail,
      campName: r.camp?.name ?? "Central Relief Hub",
      district: r.camp?.district ?? r.district,
      time,
      fullDate,
      type,
      status: r.status,
    };
  });

  const alertCount = restockPending + unresolvedComplaints;
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const stats = [
    {
      label: "Total Requests",
      value: total,
      sub: `+${todayCount}`,
      subDetail: "today",
      tone: "text-ink",
      subTone: "text-emerald-500",
      showArrow: true,
    },
    {
      label: "Resolved",
      value: resolved,
      sub: `${pct(resolved)}%`,
      subDetail: "of total",
      tone: "text-emerald-600",
      subTone: "text-emerald-500",
      showArrow: false,
    },
    {
      label: "In Progress",
      value: inProgress,
      sub: `${pct(inProgress)}%`,
      subDetail: "of total",
      tone: "text-sky-600",
      subTone: "text-sky-500",
      showArrow: false,
    },
    {
      label: "Pending",
      value: pending,
      sub: `${pct(pending)}%`,
      subDetail: "of total",
      tone: "text-amber-600",
      subTone: "text-amber-500",
      showArrow: false,
    },
  ] as const;

  return (
    <AuthGuard role="admin" loginHref="/admin/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper pb-24 shadow-xl">
      <AdminHeader title="RippleNet AI Admin" subtitle="Overview Dashboard" />

      <section className="mt-2 px-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
              Overview Dashboard
            </h1>
            <p className="text-[12px] font-medium text-slate-500">
              Live overview of relief operations
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <IconCalendar className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-bold text-ink">{today}</span>
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, sub, subDetail, tone, subTone, showArrow }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                {label}
              </p>
              <p className={`mt-1 font-display text-[22px] font-extrabold tabular-nums ${tone}`}>
                <AnimatedNumber value={value} />
              </p>
              <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${subTone}`}>
                {showArrow && <IconTrendingUp className="h-3 w-3" />}
                {sub}
                <span className="font-normal text-slate-400">{subDetail}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <h2 className="text-[12px] font-bold text-ink">Requests by Status</h2>
            <div className="mt-2">
              <DonutChart counts={{ assigned, inTransit, resolved, pending, total }} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <h2 className="text-[12px] font-bold text-ink">Risk Level Distribution</h2>
            <div className="mt-2">
              <BarChart bars={riskBars} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Map Overview</h2>
        <div className="relative mt-2 h-[200px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <CampsMap points={mapPoints} />
          <div className="absolute left-3 top-3 rounded-xl bg-ink px-3 py-2 text-white shadow-lg">
            <p className="text-[10px] font-semibold opacity-80">Active Camps</p>
            <p className="font-display text-[20px] font-extrabold leading-none">{openCamps}</p>
          </div>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
          <IconMessageSquareWarning className="h-3.5 w-3.5" />
          {volunteerCount} volunteers · {availableVolunteers} available · {restockPending} restocks pending
        </p>
      </section>

      {/* AI Multi-Agent Telemetry & Outbreak Early-Warning Radar */}
      <section className="mt-5 px-5">
        <AdminAgentTerminal
          campsCount={camps.length}
          openCamps={openCamps}
          highRiskCount={highRiskCount}
          restockPending={restockPending}
          inTransit={inTransit}
          volunteerCount={volunteerCount}
          availableVolunteers={availableVolunteers}
          choleraSignals={choleraSignals}
          malariaSignals={malariaSignals}
          waterReliefSignals={waterReliefSignals}
          totalAidValuationPkr={totalAidValuationPkr}
          avgCostPerBeneficiary={avgCostPerBeneficiary}
        />
      </section>

      {/* Missing-Signal Detection Pipeline */}
      <MissingSignalSection />

      {/* Climate Resilience, Recovery & Adaptation Engine Banner */}
      <section className="mt-4 px-5">
        <Link
          href="/admin/resilience"
          className="group block rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <IconShield className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-ink group-hover:text-blue-600 transition">
                    Climate Resilience & Recovery Engine
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-800">
                    PROTOTYPE DEMO
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Illustrative Demo Figures: Baseline CRI 5.3/10 · Disrupted: 1 · Return Rate: 29.0%
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Open <IconArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </section>

      <RecentActivitySection initialActivities={activityItems} />

      <AdminNav />
    </div>
    </AuthGuard>
  );
}
