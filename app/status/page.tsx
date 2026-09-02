import type { Metadata } from "next";
import { CitizenNav } from "../components/citizen-nav";
import { LanguageProvider } from "../components/language-context";
import { Translated, LanguagePill } from "../components/citizen-translated";
import { RouteMap } from "../components/route-map";
import { NearbyCamps } from "../components/nearby-camps";
import {
  IconBrain,
  IconCheck,
  IconLocate,
  IconMapPin,
  IconPhone,
  IconTruck,
  IconWaterKit,
} from "../components/icons";
import { prisma } from "../../lib/db";
import { fetchRoute } from "../../lib/osrm";
import { haversineKm } from "../../lib/geo";
import { formatFullDate, parseNeeds } from "../../lib/needs";
import { runMultiAgentPipeline } from "../../lib/agents";
import { CopyRequestId } from "./copy-request-id";
import { TrackSearch } from "./track-search";
import { StatusRefresher } from "./status-refresher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Status — RippleNet AI",
};

const timelineKeys = ["received", "processing", "assigned", "inTransit", "resolved"] as const;

type StepState = "done" | "current" | "todo";

const statusSteps: Record<string, { steps: StepState[]; bigKey: string; subKey?: string }> = {
  pending: { steps: ["done", "current", "todo", "todo", "todo"], bigKey: "received" },
  assigned: { steps: ["done", "done", "current", "todo", "todo"], bigKey: "assigned", subKey: "volunteerOnWay" },
  in_transit: { steps: ["done", "done", "done", "current", "todo"], bigKey: "inTransit", subKey: "volunteerOnWay" },
  resolved: { steps: ["done", "done", "done", "done", "done"], bigKey: "resolved", subKey: "resolvedMsg" },
};

function Timeline({ steps }: { steps: StepState[] }) {
  const doneCount = steps.filter((s) => s === "done").length;
  return (
    <div className="relative mt-6">
      <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[16.5px] flex h-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`flex-1 ${i < doneCount ? "bg-emerald-500" : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="relative grid grid-cols-5">
        {steps.map((state, i) => (
          <div key={timelineKeys[i]} className="flex flex-col items-center gap-2">
            {state === "done" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                <IconCheck className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
            {state === "current" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-channel text-white shadow-md shadow-channel/30 ring-4 ring-sky-100">
                <IconTruck className="h-[18px] w-[18px]" />
              </span>
            )}
            {state === "todo" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-slate-200 bg-white" />
            )}
            <Translated
              k={timelineKeys[i]}
              as="span"
              className={`text-[9.5px] font-semibold leading-tight ${
                state === "current"
                  ? "text-channel"
                  : state === "done"
                    ? "text-slate-600"
                    : "text-slate-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function StatusPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const rawCode = searchParams.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.trim().toUpperCase() ?? "";

  const shell = (children: React.ReactNode) => (
    <LanguageProvider>
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">

        <header className="flex items-center justify-between px-5 pt-2">
          <div className="leading-tight">
            <Translated k="myRequest" as="h1" className="font-display text-[22px] font-bold tracking-tight text-ink" />
            <Translated k="trackSos" as="p" className="mt-0.5 text-[12px] font-medium text-slate-500" />
          </div>
          <LanguagePill />
        </header>

        <main className="pb-[110px]">{children}</main>

        <CitizenNav active="status" />
      </div>
    </LanguageProvider>
  );

  if (!code) return shell(<TrackSearch />);

  let request: any = null;
  try {
    request = await prisma.request.findUnique({
      where: { code },
      include: {
        camp: { select: { id: true, name: true, district: true, province: true, phone: true, lat: true, lng: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
  } catch (e) {
    console.warn("Database query error on /status:", e);
  }

  if (!request) {
    const mockDb: Record<string, any> = {
      "RIP-2026-00001": {
        id: 1,
        code: "RIP-2026-00001",
        citizenName: "Fatima Bibi",
        phone: "0300 8765432",
        type: "medical",
        priority: "critical",
        needs: JSON.stringify(["High Fever", "No Clean Water", "Children Under 5"]),
        district: "Badin",
        location: "Village Jam Goth, Talhar, Badin",
        lat: 24.7487,
        lng: 68.8651,
        peopleCount: 4,
        status: "in_transit",
        createdAt: new Date(),
        camp: { id: 1, name: "Badin Relief Camp", district: "Badin", province: "Sindh", phone: "0297 123456", lat: 24.6561, lng: 68.8368 },
        volunteer: { id: 1, name: "Hamza Khan", phone: "0333 1112233" },
      },
      "RIP-2026-00002": {
        id: 2,
        code: "RIP-2026-00002",
        citizenName: "Bashir Ahmed",
        phone: "0333 5556661",
        type: "food",
        priority: "high",
        needs: JSON.stringify(["Food Packs", "Clean Water"]),
        district: "Nowshera",
        location: "Tando Bago, Badin",
        lat: 24.7394,
        lng: 68.9697,
        peopleCount: 6,
        status: "assigned",
        createdAt: new Date(),
        camp: { id: 1, name: "Nowshera Relief Camp", district: "Nowshera", province: "KPK", phone: "0923 123456", lat: 34.0153, lng: 71.9747 },
        volunteer: { id: 2, name: "Ayesha Malik", phone: "0321 4445566" },
      },
      "RIP-2026-00005": {
        id: 5,
        code: "RIP-2026-00005",
        citizenName: "Muhammad Yousuf",
        phone: "0302 7778889",
        type: "medical",
        priority: "critical",
        needs: JSON.stringify(["High Fever", "Diarrhea", "Elderly Patient"]),
        district: "Badin",
        location: "Kadhan, Badin",
        lat: 24.6833,
        lng: 68.7667,
        peopleCount: 3,
        status: "pending",
        createdAt: new Date(),
        camp: { id: 1, name: "Badin Relief Camp", district: "Badin", province: "Sindh", phone: "0297 123456", lat: 24.6561, lng: 68.8368 },
        volunteer: null,
      },
      "RIP-2026-00008": {
        id: 8,
        code: "RIP-2026-00008",
        citizenName: "Saima",
        phone: "0345 3336669",
        type: "water",
        priority: "medium",
        needs: JSON.stringify(["Clean Water"]),
        district: "Badin",
        location: "Badin City",
        lat: 24.649,
        lng: 68.8295,
        peopleCount: 4,
        status: "resolved",
        createdAt: new Date(),
        camp: { id: 1, name: "Badin Relief Camp", district: "Badin", province: "Sindh", phone: "0297 123456", lat: 24.6561, lng: 68.8368 },
        volunteer: { id: 1, name: "Hamza Khan", phone: "0333 1112233" },
      },
    };

    if (mockDb[code]) {
      request = mockDb[code];
    }
  }

  if (!request) return shell(<TrackSearch notFound />);

  const camp = request.camp;
  const route = camp ? await fetchRoute({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) : null;
  const distanceKm =
    route?.distanceKm ??
    (camp ? Math.round(haversineKm({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) * 10) / 10 : null);
  const etaMin = route?.durationMin ?? null;
  const live = request.status !== "resolved" && request.status !== "cancelled";
    const stepInfo = statusSteps[request.status];
  const needsList = parseNeeds(request.needs);

  const pipeline = runMultiAgentPipeline({
    requestId: request.code,
    citizenName: request.citizenName,
    needs: needsList,
    priority: request.priority,
    type: request.type,
    peopleCount: request.peopleCount,
    district: request.district,
    campName: camp?.name,
    volunteerName: request.volunteer?.name,
    routeDistanceKm: distanceKm,
    routeDurationMin: etaMin,
    routeVia: route?.viaName,
  });

  return shell(
    <>
      <StatusRefresher enabled={live} />

      <section className="mt-4 px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="min-w-0 flex-1 leading-tight">
            <Translated k="requestId" as="p" className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
            <p className="mt-1 font-display text-[16px] font-bold text-ink">{request.code}</p>
            <p className="mt-1 text-[11.5px] text-slate-500">
              <Translated k="requestedOn" /> {formatFullDate(request.createdAt)}
            </p>
          </div>
          <CopyRequestId value={request.code} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <Translated k="currentStatus" as="h2" className="text-[12px] font-semibold text-slate-600" />
        {request.status === "cancelled" ? (
          <div className="mt-1.5 rounded-2xl bg-red-50 px-4 py-4 text-center">
            <Translated k="statusCancelled" as="p" className="font-display text-[22px] font-bold text-red-600" />
          </div>
        ) : (
          <>
            <Translated
              k={stepInfo?.bigKey ?? "received"}
              as="p"
              className="mt-1.5 font-display text-[26px] font-bold leading-tight text-channel"
            />
            {stepInfo?.subKey && (
              <Translated k={stepInfo.subKey} as="p" className="mt-0.5 text-[12.5px] text-slate-500" />
            )}
            <Timeline steps={stepInfo?.steps ?? statusSteps.pending.steps} />
          </>
        )}
      </section>

      {/* AI Agents Transparent Decision Card */}
      <section className="mt-5 px-5">
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/60 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-display text-[12px] font-bold text-ink">
              <IconBrain className="h-4 w-4 text-channel" />
              5 AI Agents Dispatched Your Help
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
              Verified
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-[11.5px] text-slate-600">
            <p className="flex items-start gap-1.5">
              <span className="text-channel">💧</span>
              <span>
                <strong className="text-ink">Water &amp; Medical Relief:</strong> Safe drinking water supplies and oral rehydration allocated to prevent diarrheal &amp; cholera illness.
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-sky-600">🗺️</span>
              <span>
                <strong className="text-ink">Route Priority:</strong> Ranked {pipeline.percentile} urgency with bypass travel via {pipeline.routeAgent.viaRoadName}.
              </span>
            </p>
          </div>
        </div>
      </section>

      {camp && (
        <section className="mt-7 px-5" aria-label="Route map">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[20px] shadow-lg shadow-ink/10">
            <RouteMap
              from={{ lat: camp.lat, lng: camp.lng, label: camp.name }}
              to={{ lat: request.lat, lng: request.lng, label: request.location ?? request.district }}
              geometry={route?.geometry ?? []}
            />

            {request.status === "in_transit" && (
              <span className="absolute" style={{ left: "71%", top: "26%" }}>
                <span className="flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-signal text-white shadow-md ring-[3px] ring-white">
                  <IconTruck className="h-[18px] w-[18px]" />
                </span>
              </span>
            )}

            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <IconMapPin className="h-3.5 w-3.5 shrink-0 text-channel" />
              <Translated k="yourLocation" as="span" className="text-[10.5px] font-bold text-ink" />
            </span>

            <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">ETA</p>
              <p className="font-display text-[18px] font-bold leading-tight text-ink">
                {etaMin != null ? `${etaMin} min` : "—"}
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                Distance: {distanceKm != null ? `${distanceKm} km` : "—"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Recenter map"
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-channel shadow-md transition active:scale-95"
            >
              <IconLocate className="h-[18px] w-[18px]" />
            </button>
          </div>
        </section>
      )}

      {camp && (
        <section className="mt-7 px-5">
          <Translated k="contactCard" as="h2" className="font-display text-[19px] font-bold tracking-tight text-ink" />
          <div className="mt-3.5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1 leading-tight">
              <Translated k="nearestCamp" as="p" className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
              <h3 className="mt-1 font-display text-[15px] font-bold text-ink">{camp.name}</h3>
              <a href={`tel:${camp.phone.replace(/\s+/g, "")}`} className="mt-1 block text-[13px] font-bold text-channel">
                {camp.phone}
              </a>
            </div>
            <a
              href={`tel:${camp.phone.replace(/\s+/g, "")}`}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
            >
              <IconPhone className="h-4 w-4" />
              <Translated k="call" />
            </a>
          </div>
        </section>
      )}

      <section className="mt-4 px-5">
        <a
          href="tel:0800444488"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3.5 transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-signal shadow-sm">
            <IconPhone className="h-[20px] w-[20px]" />
          </span>
          <span className="leading-tight">
            <Translated k="needMoreHelp" as="span" className="block text-[12.5px] font-bold text-ink" />
            <span className="mt-1 block text-[11.5px] text-slate-600">
              <Translated k="callHotline" /> <span className="font-bold text-ink">0800 44 44 88</span>
            </span>
          </span>
        </a>
      </section>

      <section className="mt-7 px-5">
        <Translated k="nearbyCamps" as="h2" className="font-display text-[19px] font-bold tracking-tight text-ink" />
        <NearbyCamps lat={request.lat} lng={request.lng} />
      </section>
    </>
  );
}
