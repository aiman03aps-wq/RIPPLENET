import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "../../components/auth-guard";
import { NotificationBell } from "../../components/notification-bell";
import { VolunteerNav } from "../../components/volunteer-nav";
import { TaskList, type Task } from "./task-list";
import { prisma } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { haversineKm } from "../../../lib/geo";
import { parseNeeds, displayPriority, formatDayTime, isToday } from "../../../lib/needs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Tasks — RippleNet AI",
};

export default async function VolunteerTasksPage() {
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const [requests, camp] = await Promise.all([
    prisma.request.findMany({
      where: { volunteerId: session.id },
      orderBy: [{ createdAt: "desc" }],
    }),
    session.campId
      ? prisma.camp.findUnique({ where: { id: session.campId } })
      : null,
  ]);

  const tasks: Task[] = requests.map((r) => ({
    id: r.code,
    status: (r.status === "resolved" ? "resolved" : r.status === "in_transit" ? "in_transit" : "assigned"),
    priority: displayPriority(r.priority),
    location: r.location ?? `${r.district} District`,
    issues: parseNeeds(r.needs).slice(0, 3).join(", ") || "Relief delivery",
    distance: camp
      ? `${haversineKm({ lat: camp.lat, lng: camp.lng }, { lat: r.lat, lng: r.lng }).toFixed(1)} km away`
      : `${r.district} District`,
    time: (() => {
      const t = r.status === "resolved" && r.resolvedAt ? r.resolvedAt : r.assignedAt ?? r.createdAt;
      return isToday(t) ? formatDayTime(t) : t.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    })(),
    today: isToday(r.status === "resolved" && r.resolvedAt ? r.resolvedAt : r.assignedAt ?? r.createdAt),
  }));

  const activeCount = tasks.filter((t) => t.status === "assigned" || t.status === "in_transit")
    .length;

  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center justify-between px-5 pt-7">
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">My Tasks</h1>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            {camp ? `${camp.district} Health Camp` : "Relief Camp"}
          </p>
        </div>
        <NotificationBell role="volunteer" />
      </header>

      <main className="pb-[110px]">
        <TaskList tasks={tasks} />
      </main>

      <VolunteerNav active="tasks" />
    </div>
    </AuthGuard>
  );
}
