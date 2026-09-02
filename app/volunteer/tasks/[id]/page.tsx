import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthGuard } from "../../../components/auth-guard";
import { RouteMap } from "../../../components/route-map";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
  IconBaby,
  IconBandage,
  IconBowlSpoon,
  IconChevronLeft,
  IconDroplet,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconPregnant,
  IconTent,
  IconThermometer,
  IconUser,
  IconUsers,
} from "../../../components/icons";
import {
  StockIconAntiseptic,
  StockIconBandage,
  StockIconOrs,
  StockIconParacetamol,
  StockIconWaterFilter,
  StockIconWaterTabs,
  StockIconZinc,
} from "../../../stock/stock-icons";
import { prisma } from "../../../../lib/db";
import { getSession } from "../../../../lib/session";
import { haversineKm } from "../../../../lib/geo";
import { fetchRoute } from "../../../../lib/osrm";
import { runMultiAgentPipeline } from "../../../../lib/agents";
import { parseNeeds, displayPriority, formatDayTime, suggestParcel } from "../../../../lib/needs";
import { StartTripButton } from "./start-trip-button";

export const metadata: Metadata = {
  title: "Task Detail — RippleNet AI",
};

type IconType = (props: { className?: string }) => React.ReactNode;

function IconPackageLight({ className }: { className?: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
      <IconPackage className={className} />
    </span>
  );
}

const priorityBadges: Record<string, { label: string; className: string }> = {
  Critical: { label: "Critical Priority", className: "bg-red-500" },
  High: { label: "High Priority", className: "bg-red-500" },
  Medium: { label: "Medium Priority", className: "bg-orange-500" },
  Low: { label: "Low Priority", className: "bg-emerald-500" },
};

const needStyles: { match: RegExp; Icon: IconType; tone: string }[] = [
  { match: /fever|temperature|pain/i, Icon: IconThermometer, tone: "bg-red-50 text-red-500" },
  { match: /water|thirst|dehydra|diarrhea|ors/i, Icon: IconDroplet, tone: "bg-sky-50 text-sky-500" },
  { match: /food|meal|hungry|nutrition/i, Icon: IconBowlSpoon, tone: "bg-amber-50 text-amber-600" },
  { match: /pregnan|mother|newborn/i, Icon: IconPregnant, tone: "bg-pink-50 text-pink-500" },
  { match: /child|baby|infant|under 5/i, Icon: IconBaby, tone: "bg-violet-50 text-violet-500" },
  { match: /elder/i, Icon: IconUsers, tone: "bg-slate-100 text-slate-500" },
  { match: /injur|wound|bleed|bandage|cut/i, Icon: IconBandage, tone: "bg-rose-50 text-rose-500" },
  { match: /rescue|boat|stranded|evacuat|snake|drown/i, Icon: IconAlertTriangle, tone: "bg-orange-50 text-orange-500" },
  { match: /tent|shelter|blanket|roof/i, Icon: IconTent, tone: "bg-emerald-50 text-emerald-600" },
];

const parcelIcons: Record<string, IconType> = {
  "RippleNet Water Purification Kit": StockIconWaterFilter,
  "Paracetamol (500mg)": StockIconParacetamol,
  "ORS Sachets": StockIconOrs,
  "Zinc Tablets": StockIconZinc,
  "Water Purification Tabs": StockIconWaterTabs,
  "Antiseptic Liquid (100ml)": StockIconAntiseptic,
  "Bandage Rolls": StockIconBandage,
  "Mineral Water (1.5L)": IconDroplet,
  "Family Food Pack": IconBowlSpoon,
  "Family Tent": IconTent,
  Blankets: IconUsers,
  "Rescue Rope (20m)": IconActivity,
  "Life Jackets": IconUsers,
  "Hygiene Kit": IconPackageLight,
  "Soap Bars": IconPackageLight,
  "Clean Delivery Kit": IconPackageLight,
};

function needStyle(label: string) {
  for (const rule of needStyles) {
    if (rule.match.test(label)) return rule;
  }
  return { Icon: IconActivity, tone: "bg-slate-100 text-slate-500" };
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">{title}</h2>;
}

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const numeric = Number(id);
  const request = await prisma.request.findFirst({
    where: Number.isFinite(numeric) && /^\d+$/.test(id) ? { id: numeric } : { code: id.toUpperCase() },
    include: { camp: true },
  });
  if (!request || request.volunteerId !== session.id) notFound();

  const camp = request.camp;
  const needs = parseNeeds(request.needs);
  const parcel = suggestParcel(needs, request.type);

  const route = camp ? await fetchRoute({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) : null;
  const distanceKm = route?.distanceKm ?? (camp ? Math.round(haversineKm({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) * 10) / 10 : null);
  const etaMin = route?.durationMin ?? null;

  const dueAt = new Date((request.assignedAt ?? request.createdAt).getTime() + 2 * 60 * 60 * 1000);
  const summary = [
    { label: "Distance", value: distanceKm != null ? `${distanceKm} km` : "—" },
    { label: "ETA", value: etaMin != null ? `${etaMin} min` : "—" },
    { label: "Due Time", value: formatDayTime(dueAt) },
  ] as const;

  const priority = displayPriority(request.priority);
  const badge = priorityBadges[priority];

  const pipeline = runMultiAgentPipeline({
    requestId: request.code,
    citizenName: request.citizenName,
    needs,
    priority: request.priority,
    type: request.type,
    peopleCount: request.peopleCount,
    district: request.district,
    campName: camp?.name ?? "Alkhidmat Relief Camp",
    volunteerName: session.name,
    routeDistanceKm: distanceKm,
    routeDurationMin: etaMin,
    routeVia: route?.viaName,
  });

  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center gap-2 px-5 pt-7">
        <Link
          href="/volunteer/tasks"
          aria-label="Back to my tasks"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Task Detail
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">{request.code}</p>
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <main className="pb-10">
        <section className="mt-4 px-5" aria-label="Task summary">
          <div className="grid grid-cols-3 gap-2">
            {summary.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm"
              >
                <p className="font-display text-[16px] font-extrabold leading-none text-ink">
                  {value}
                </p>
                <p className="mt-1.5 text-[8.5px] font-semibold uppercase leading-[1.3] tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Agent Field Briefing */}
        <section className="mt-4 px-5">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50/50 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display text-[12px] font-bold text-ink">
                🤖 AI Field Briefing (Route &amp; Health Agents)
              </span>
              <span className="rounded-full bg-channel px-2 py-0.5 text-[9px] font-bold text-white">
                {pipeline.routeAgent.recommendedVehicle}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-[11.5px] text-slate-600">
              <p>
                <span className="font-semibold text-ink">🗺️ Route Advice:</span> {pipeline.routeAgent.verdict}
              </p>
              <p>
                <span className="font-semibold text-ink">🦠 Pathogen Caution:</span> {pipeline.healthAgent.verdict}{" "}
                {pipeline.healthAgent.contraindications.length > 0 && `(${pipeline.healthAgent.contraindications[0]})`}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Victim Details" />
          <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <IconUser className="h-[21px] w-[21px]" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[14px] font-bold text-ink">{request.citizenName}</p>
                <p className="mt-1 flex items-start gap-1 text-[11px] leading-snug text-slate-500">
                  <IconMapPin className="mt-[1px] h-3 w-3 shrink-0 text-slate-400" />
                  {request.location ?? `${request.district} District`} — {request.peopleCount}{" "}
                  {request.peopleCount === 1 ? "person" : "people"}
                </p>
              </div>
              <a
                href={`tel:${request.phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${request.citizenName}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition active:scale-95"
              >
                <IconPhone className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Symptoms / Needs" />
          <div className="mt-3 flex flex-wrap gap-2">
            {needs.length > 0 ? (
              needs.map((label) => {
                const { Icon, tone } = needStyle(label);
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                );
              })
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-[12px] font-semibold text-slate-500">
                <IconActivity className="h-4 w-4" />
                General relief
              </span>
            )}
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Parcel to Deliver" />
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {parcel.map(({ name, qty }, i) => {
              const Icon = parcelIcons[name] ?? IconPackageLight;
              return (
                <div
                  key={name}
                  className={`flex items-center gap-3 px-3.5 py-2.5 ${i > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <Icon className="h-9 w-9 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                    {name}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-bold tabular-nums text-slate-500">
                    {qty}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Route" />
          <p className="mt-1 text-[11.5px] text-slate-500">
            {route?.viaName ? `Via ${route.viaName}` : "Fastest road route"} · Live OSRM road data
          </p>
          <div className="relative mt-3 h-[175px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            {camp ? (
              <RouteMap
                from={{ lat: camp.lat, lng: camp.lng, label: camp.name }}
                to={{ lat: request.lat, lng: request.lng, label: request.location ?? request.district }}
                geometry={route?.geometry ?? []}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                Camp location unavailable
              </div>
            )}
            <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[9.5px] font-bold text-white shadow-md">
              {etaMin != null ? `${etaMin} min` : "Road Clear"}
            </span>
          </div>
        </section>

        <section className="mt-6 px-5">
          {request.status === "resolved" ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-center">
              <p className="font-display text-[15px] font-bold text-emerald-700">
                Delivery completed
              </p>
              <p className="mt-1 text-[12px] text-emerald-600">
                Resolved {request.resolvedAt ? formatDayTime(request.resolvedAt) : ""}
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <a
                href={`tel:${(camp?.phone ?? "").replace(/\s+/g, "")}`}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-[13px] font-bold text-ink shadow-sm transition active:scale-[0.98]"
              >
                <IconPhone className="h-[18px] w-[18px] text-emerald-500" />
                Call Camp
              </a>
              {request.status === "assigned" ? (
                <StartTripButton requestId={request.code} />
              ) : (
                <Link
                  href={`/volunteer/tasks/${request.code}/resolve`}
                  className="flex h-[52px] flex-[1.3] items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
                >
                  Resolve Delivery
                  <IconArrowRight className="h-[18px] w-[18px]" />
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
    </AuthGuard>
  );
}
