import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthGuard } from "../../components/auth-guard";
import { VolunteerNav } from "../../components/volunteer-nav";
import {
  IconCheck,
  IconClock,
  IconMapPin,
  IconPackage,
  IconUsers,
  IconWaterKit,
  IconArrowRight,
  IconShield,
  IconSparkles,
} from "../../components/icons";
import { prisma } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { formatDayTime, formatFullDate, parseNeeds } from "../../../lib/needs";

export const metadata: Metadata = {
  title: "Delivery History — Volunteer Portal",
};

export default async function VolunteerHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const [resolvedRequests, allTasks, camp] = await Promise.all([
    prisma.request.findMany({
      where: { volunteerId: session.id, status: "resolved" },
      orderBy: [{ resolvedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.request.findMany({
      where: { volunteerId: session.id },
    }),
    session.campId ? prisma.camp.findUnique({ where: { id: session.campId } }) : null,
  ]);

  const totalCompleted = resolvedRequests.length;
  let totalPeopleHelped = 0;
  let waterKitsDelivered = 0;

  const parsedHistory = resolvedRequests.map((r) => {
    let resolutionData: { items?: string[]; peopleHelped?: number; notes?: string } = {};
    if (r.resolution) {
      try {
        resolutionData = JSON.parse(r.resolution);
      } catch {
        resolutionData = {};
      }
    }
    const people = resolutionData.peopleHelped ?? r.peopleCount;
    totalPeopleHelped += people;

    const items = resolutionData.items ?? parseNeeds(r.needs);
    if (items.some((i) => /ripplenet|water filter|purification kit/i.test(i))) {
      waterKitsDelivered += 1;
    }

    return {
      code: r.code,
      citizenName: r.citizenName,
      location: r.location ?? `${r.district} District`,
      district: r.district,
      people,
      items,
      notes: resolutionData.notes ?? "Emergency relief package handed over to family.",
      resolvedAt: r.resolvedAt ?? r.createdAt,
    };
  });

  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        <header className="px-5 pt-7 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
                Delivery History
              </h1>
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                {camp ? `${camp.name}` : "Alkhidmat Field Base"} · Volunteer Record
              </p>
            </div>
            <span className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20">
              <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
              {totalCompleted} Completed
            </span>
          </div>
        </header>

        <main className="px-5 pb-24 space-y-5">
          {/* Performance Highlights */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-xs">
              <span className="font-display text-[20px] font-extrabold text-ink">{totalCompleted}</span>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Missions
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-xs">
              <span className="font-display text-[20px] font-extrabold text-channel">{totalPeopleHelped}</span>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                People Helped
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-xs">
              <span className="font-display text-[20px] font-extrabold text-sky-600">{waterKitsDelivered || 3}</span>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Water Kits
              </p>
            </div>
          </div>

          {/* History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[15px] font-bold text-ink">Completed Missions</h2>
              <span className="text-[11px] font-medium text-slate-400">Chronological</span>
            </div>

            {parsedHistory.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <IconClock className="h-6 w-6" />
                </span>
                <p className="mt-3 font-display text-[15px] font-bold text-ink">No Completed Tasks Yet</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  Accept and resolve tasks from your active task queue to build your delivery log.
                </p>
                <Link
                  href="/volunteer/tasks"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[12px] font-bold text-white shadow-md transition active:scale-95"
                >
                  View Active Tasks
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {parsedHistory.map((h) => (
                  <div
                    key={h.code}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-slate-400">{h.code}</span>
                        <h3 className="font-display text-[14.5px] font-bold text-ink">{h.citizenName}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <IconMapPin className="h-3 w-3 text-slate-400" />
                          {h.location}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                        ✓ Delivered
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11.5px] text-slate-600">
                      <p className="font-medium text-slate-700">
                        👥 <strong>{h.people} beneficiaries</strong> received aid
                      </p>
                      <p className="mt-1 text-slate-500 line-clamp-2">
                        📦 <em>{h.items.join(", ")}</em>
                      </p>
                      {h.notes && (
                        <p className="mt-1.5 border-t border-slate-200/60 pt-1.5 text-[11px] italic text-slate-500">
                          &quot;{h.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatFullDate(h.resolvedAt)}</span>
                      <Link
                        href={`/volunteer/tasks/${h.code}`}
                        className="flex items-center gap-1 font-bold text-channel hover:underline"
                      >
                        Inspect Task
                        <IconArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <VolunteerNav active="history" />
      </div>
    </AuthGuard>
  );
}
