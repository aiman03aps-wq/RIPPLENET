"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBell,
  IconX,
  IconAlertTriangle,
  IconCheck,
  IconTruck,
  IconShield,
  IconWaterKit,
  IconSparkles,
} from "./icons";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "info" | "success";
  link?: string;
  read?: boolean;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Critical SOS: Infant Dehydration",
    message: "RIP-2026-00001 · Village Jam Goth requires urgent ORS & Zinc therapy dispatch.",
    time: "2m ago",
    type: "critical",
    link: "/queue/1",
  },
  {
    id: "notif-2",
    title: "Flood Inundation Warning",
    message: "Flood Agent: River Indus basin runoff surged +35mm. Bypass route recommended.",
    time: "14m ago",
    type: "warning",
    link: "/queue",
  },
  {
    id: "notif-3",
    title: "Restock Request Approved",
    message: "Admin HQ approved 50 units of RippleNet Water Purification Kits for delivery.",
    time: "45m ago",
    type: "success",
    link: "/stock",
  },
  {
    id: "notif-4",
    title: "Volunteer Check-In",
    message: "Hamza Khan reached delivery perimeter for RIP-2026-00002 safely.",
    time: "1h ago",
    type: "info",
    link: "/volunteers",
  },
];

export function NotificationBell({ count = 3 }: { count?: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open notifications"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition"
      >
        <IconBell className="h-[20px] w-[20px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-[320px] max-w-[90vw] rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <p className="font-display text-[14px] font-bold text-ink">Notifications</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9.5px] font-bold text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10.5px] font-semibold text-channel hover:underline"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2.5 max-h-[340px] space-y-2 overflow-y-auto pr-0.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markSingleAsRead(n.id)}
                  className={`relative flex items-start gap-2.5 rounded-xl p-2.5 transition border ${
                    n.read
                      ? "bg-slate-50/50 border-slate-100 opacity-70"
                      : "bg-white border-slate-200 shadow-xs ring-1 ring-black/5"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[12px] ${
                      n.type === "critical"
                        ? "bg-red-500 shadow-xs shadow-red-500/30"
                        : n.type === "warning"
                        ? "bg-amber-500"
                        : n.type === "success"
                        ? "bg-emerald-500"
                        : "bg-channel"
                    }`}
                  >
                    {n.type === "critical" ? "!" : n.type === "warning" ? "⚠" : n.type === "success" ? "✓" : "i"}
                  </span>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[12px] font-bold text-ink truncate">{n.title}</p>
                      <span className="text-[9.5px] font-medium text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setOpen(false)}
                        className="mt-1.5 inline-block text-[10.5px] font-bold text-channel hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
