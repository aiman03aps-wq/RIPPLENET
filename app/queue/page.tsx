import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { StaffNav } from "../components/staff-nav";
import { IconBell, IconChevronDown } from "../components/icons";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";
import { parseNeeds } from "../../lib/needs";
import { assessRisk } from "../../lib/risk";
import { QueueList } from "./queue-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Incoming Requests — RippleNet AI",
};

export default async function QueuePage() {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const [camp, requests] = await Promise.all([
    session.campId
      ? prisma.camp.findUnique({ where: { id: session.campId } })
      : null,
    prisma.request.findMany({
      where: { campId: session.campId ?? -1 },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  const items = requests.map((r) => {
    const needs = parseNeeds(r.needs);
    const risk = assessRisk({ priority: r.priority, type: r.type, peopleCount: r.peopleCount, needs });
    return {
      code: r.code,
      name: r.citizenName,
      location: r.location ?? `${r.district} District`,
      issues: needs.slice(0, 2).join(", ") || "Relief delivery",
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      score: risk.score,
      level: risk.level,
      levelColor: risk.levelColor,
      badge: risk.badge,
    };
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center justify-between px-5 pt-7">
        <div className="flex min-w-0 items-center gap-1.5">
          <h1 className="truncate font-display text-[20px] font-bold tracking-tight text-ink">
            {camp ? `${camp.district} Health Camp` : "Relief Camp"}
          </h1>
          <IconChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
        <div
          className="relative ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink"
          aria-label={`${pendingCount} new requests`}
        >
          <IconBell className="h-[22px] w-[22px]" />
          {pendingCount > 0 && (
            <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white shadow-sm">
              {pendingCount}
            </span>
          )}
        </div>
      </header>

      <main className="pb-[110px]">
        <QueueList items={items} />
      </main>

      <StaffNav active="queue" />
    </div>
    </AuthGuard>
  );
}
