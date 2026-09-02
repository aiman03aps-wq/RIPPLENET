"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconMapPin } from "../../components/icons";

type Priority = "Critical" | "High" | "Medium" | "Low";

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-500 text-white",
  High: "bg-red-500 text-white",
  Medium: "bg-orange-500 text-white",
  Low: "bg-emerald-500 text-white",
};

type TaskStatus = "assigned" | "in_transit" | "resolved";

const statusStyles: Record<TaskStatus, { label: string; className: string }> = {
  assigned: { label: "Assigned", className: "bg-sky-100 text-sky-600" },
  in_transit: { label: "In Transit", className: "bg-amber-100 text-amber-600" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-600" },
};

export type Task = {
  priority: Priority;
  status: TaskStatus;
  id: string;
  location: string;
  issues: string;
  distance: string;
  time: string;
  today: boolean;
};

const tabs = [
  { id: "all", label: "All" },
  { id: "progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function TaskCard({ task }: { task: Task }) {
  const status = statusStyles[task.status];
  return (
    <Link
      href={`/volunteer/tasks/${task.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
        <span className="text-[10.5px] font-medium tabular-nums text-slate-400">{task.time}</span>
      </div>
      <p className="mt-2 font-display text-[14px] font-bold tabular-nums text-ink">{task.id}</p>
      <p className="mt-1 flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-500">
        <IconMapPin className="mt-[1px] h-3.5 w-3.5 shrink-0 text-slate-400" />
        {task.location}
      </p>
      <p className="mt-1 text-[11.5px] font-medium text-slate-600">{task.issues}</p>
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[11px] font-medium text-slate-400">{task.distance}</span>
        <span className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
          <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </span>
      </div>
    </Link>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [tab, setTab] = useState<TabId>("all");

  const active = tasks.filter((t) => t.status === "assigned" || t.status === "in_transit");
  const inProgress = tasks.filter((t) => t.status === "in_transit");
  const completed = tasks.filter((t) => t.status === "resolved");
  const todays = active.filter((t) => t.today);
  const upcoming = active.filter((t) => !t.today);

  const counts: Record<TabId, number> = {
    all: tasks.length,
    progress: inProgress.length,
    completed: completed.length,
  };

  const visible =
    tab === "all" ? active : tab === "progress" ? inProgress : completed;

  return (
    <div>
      <div
        className="mt-4 flex gap-6 border-b border-slate-200/80 px-5"
        role="tablist"
        aria-label="Task views"
      >
        {tabs.map(({ id, label }) => {
          const isActive = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1 pb-2.5 pt-1.5 ${
                isActive ? "text-ink" : "text-slate-400"
              }`}
            >
              <span className={`text-[13px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {label} <span className="tabular-nums">({counts[id]})</span>
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-channel" />
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="mt-4 px-5">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-500">
              {tab === "progress"
                ? "No tasks in progress"
                : tab === "completed"
                  ? "No completed tasks yet"
                  : "No tasks assigned to you"}
            </p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {tab === "progress"
                ? "Tasks you start will appear here."
                : tab === "completed"
                  ? "Finished tasks will appear here."
                  : "New assignments from your camp will appear here."}
            </p>
          </div>
        </div>
      )}

      {tab === "all" ? (
        <>
          {todays.length > 0 && (
            <section className="mt-4 px-5" aria-label="Today's tasks">
              <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
                Today&apos;s Tasks
              </h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {todays.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="mt-6 px-5" aria-label="Upcoming tasks">
              <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">Upcoming</h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {upcoming.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        visible.length > 0 && (
          <section className="mt-4 px-5">
            <div className="flex flex-col gap-2.5">
              {visible.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
