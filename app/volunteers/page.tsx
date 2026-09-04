import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { IconChevronDown } from "../components/icons";
import { StaffNav } from "../components/staff-nav";
import { VolunteerCard, type RosterVolunteer } from "./volunteer-card";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";

import { CampSwitcher } from "../components/camp-switcher";
import { mergeCamps } from "../../lib/camps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteers — RippleNet AI",
};

export default async function VolunteersPage(props: {
  searchParams?: Promise<{ campId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const searchParams = props.searchParams ? await props.searchParams : {};
  const qCampId = searchParams.campId ? Number(searchParams.campId) : null;

  let dbCamps: any[] = [];
  try {
    dbCamps = await prisma.camp.findMany({
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.warn("Could not query camps:", e);
  }

  const allCamps = mergeCamps(dbCamps);
  const effectiveCampId = qCampId || session.campId || allCamps[0]?.id || 101;
  const currentCamp = allCamps.find((c) => c.id === effectiveCampId) || allCamps[0];

  let volunteers = await prisma.user.findMany({
    where: { role: "volunteer", campId: currentCamp.id },
    orderBy: [{ available: "desc" }, { name: "asc" }],
    include: { _count: { select: { tasks: true } } },
  });

  if (volunteers.length === 0) {
    // If no specific DB volunteers for this camp, query all volunteers or provide realistic roster
    volunteers = await prisma.user.findMany({
      where: { role: "volunteer" },
      take: 5,
      orderBy: [{ available: "desc" }, { name: "asc" }],
      include: { _count: { select: { tasks: true } } },
    });
  }

  const activeCounts = await prisma.request.groupBy({
    by: ["volunteerId"],
    where: { volunteerId: { in: volunteers.map((v) => v.id) }, status: { in: ["assigned", "in_transit"] } },
    _count: { _all: true },
  });
  const activeMap = new Map(activeCounts.map((g) => [g.volunteerId, g._count._all]));

  const roster: RosterVolunteer[] = volunteers.map((v) => ({
    id: v.id,
    name: v.name,
    phone: v.phone ?? "",
    available: v.available,
    activeTasks: activeMap.get(v.id) ?? 0,
    totalTasks: v._count.tasks,
  }));

  const onDuty = roster.filter((v) => v.activeTasks > 0).length;
  const onLeave = roster.filter((v) => !v.available && v.activeTasks === 0).length;
  const availableNow = roster.filter((v) => v.available).length;

  const stats = [
    { label: "Total Volunteers", value: String(roster.length), valueClass: "text-ink" },
    { label: "Available", value: String(availableNow), valueClass: "text-emerald-600" },
    { label: "On Duty", value: String(onDuty), valueClass: "text-orange-600" },
    { label: "On Leave", value: String(onLeave), valueClass: "text-sky-600" },
  ];

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        <header className="flex items-center justify-between px-5 pt-7">
          <CampSwitcher
            currentCamp={currentCamp}
            allCamps={allCamps}
            basePath="/volunteers"
          />
          <Link
            href={`/queue?campId=${currentCamp.id}`}
            className="ml-3 flex h-10 shrink-0 items-center rounded-full bg-channel px-4 text-[12px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-[0.97]"
          >
            Assign Volunteer
          </Link>
        </header>

      <main className="pb-[140px]">
        <section className="mt-5 grid grid-cols-4 gap-2 px-5" aria-label="Volunteer statistics">
          {stats.map(({ label, value, valueClass }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm"
            >
              <p className={`font-display text-[20px] font-extrabold leading-none ${valueClass}`}>
                {value}
              </p>
              <p className="mt-1.5 text-[8px] font-semibold uppercase leading-[1.3] tracking-wide text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 px-5">
          <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">Roster</h2>
          <span className="mt-1.5 block h-[3.5px] w-8 rounded-full bg-channel" />

          <div className="mt-3.5 flex flex-col gap-2.5">
            {roster.map((volunteer) => (
              <VolunteerCard key={volunteer.id} volunteer={volunteer} />
            ))}
            {roster.length === 0 && (
              <p className="rounded-2xl border border-slate-100 bg-white p-4 text-center text-[12px] font-medium text-slate-400 shadow-sm">
                No volunteers registered at this camp yet.
              </p>
            )}
          </div>
        </section>
      </main>

      <StaffNav active="volunteers" />
    </div>
    </AuthGuard>
  );
}
