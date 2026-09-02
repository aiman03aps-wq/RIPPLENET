"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBell,
  IconX,
  IconAlertTriangle,
  IconCheck,
  IconTruck,
  IconShield,
  IconWaterKit,
  IconSparkles,
  IconChevronRight,
} from "./icons";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "info" | "success";
  link: string;
  read?: boolean;
}

const adminNotifications: NotificationItem[] = [
  {
    id: "admin-notif-1",
    title: "Critical SOS: Infant Dehydration",
    message: "RIP-2026-00001 · High-priority emergency in Thatta District. Tap to review overview.",
    time: "2m ago",
    type: "critical",
    link: "/admin/dashboard",
  },
  {
    id: "admin-notif-2",
    title: "Indus Basin Flood Inundation",
    message: "Flood Agent: River Indus runoff surged +35mm in Sukkur & Dadu relief camps.",
    time: "14m ago",
    type: "warning",
    link: "/admin/camps",
  },
  {
    id: "admin-notif-3",
    title: "New Restock Request Pending",
    message: "Badin Relief Camp requested 50 units of RippleNet Water Purification Kits.",
    time: "32m ago",
    type: "warning",
    link: "/admin/restock",
  },
  {
    id: "admin-notif-4",
    title: "Citizen Complaint Logged",
    message: "Delivery delay reported in Nowshera Camp sector 4. Tap to inspect triage desk.",
    time: "1h ago",
    type: "info",
    link: "/admin/complaints",
  },
];

const volunteerNotifications: NotificationItem[] = [
  {
    id: "vol-notif-1",
    title: "Emergency Delivery Assigned",
    message: "RIP-2026-00001 · Urgent Infant Rehydration Kit assigned to you for dispatch.",
    time: "3m ago",
    type: "critical",
    link: "/volunteer/tasks",
  },
  {
    id: "vol-notif-2",
    title: "Route Advisory: Submerged Road",
    message: "Route Agent: Badin North road cut. Follow alternate bypass route via Support.",
    time: "18m ago",
    type: "warning",
    link: "/volunteer/support",
  },
  {
    id: "vol-notif-3",
    title: "Delivery Proof Verified",
    message: "Your delivery for RIP-2026-00002 has been verified and logged in history.",
    time: "45m ago",
    type: "success",
    link: "/volunteer/history",
  },
  {
    id: "vol-notif-4",
    title: "Base Camp Hotline Active",
    message: "Disaster coordinator and medical triage desk available 24/7 on support desk.",
    time: "2h ago",
    type: "info",
    link: "/volunteer/support",
  },
];

const campManagerNotifications: NotificationItem[] = [
  {
    id: "mgr-notif-1",
    title: "Critical SOS: Infant Dehydration",
    message: "RIP-2026-00001 · Village Jam Goth requires urgent ORS & Zinc therapy dispatch.",
    time: "2m ago",
    type: "critical",
    link: "/queue",
  },
  {
    id: "mgr-notif-2",
    title: "Flood Inundation Warning",
    message: "Flood Agent: River Indus basin runoff surged +35mm. Check active emergency queue.",
    time: "14m ago",
    type: "warning",
    link: "/queue",
  },
  {
    id: "mgr-notif-3",
    title: "Restock Request Approved",
    message: "Admin HQ approved 50 units of RippleNet Water Purification Kits for delivery.",
    time: "45m ago",
    type: "success",
    link: "/stock",
  },
  {
    id: "mgr-notif-4",
    title: "Volunteer Check-In",
    message: "Hamza Khan reached delivery perimeter for RIP-2026-00002 safely. Check roster.",
    time: "1h ago",
    type: "info",
    link: "/volunteers",
  },
];

export function NotificationBell({
  role = "camp_manager",
  count,
}: {
  role?: "admin" | "camp_manager" | "volunteer";
  count?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const getInitial = () => {
    if (role === "admin") return adminNotifications;
    if (role === "volunteer") return volunteerNotifications;
    return campManagerNotifications;
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(getInitial());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // 1. Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    // 2. Close modal
    setOpen(false);
    // 3. Navigate to route
    if (item.link) {
      router.push(item.link);
    }
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

          <div className="absolute right-0 top-12 z-50 w-[330px] max-w-[92vw] rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xl animate-slide-up">
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
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2.5 max-h-[350px] space-y-2 overflow-y-auto pr-0.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNotificationClick(n);
                    }
                  }}
                  className={`group relative flex cursor-pointer items-start gap-2.5 rounded-xl p-3 transition border text-left ${
                    n.read
                      ? "bg-slate-50/60 border-slate-100 opacity-75 hover:opacity-100 hover:bg-white hover:border-slate-300"
                      : "bg-white border-slate-200 shadow-xs ring-1 ring-black/5 hover:border-channel hover:shadow-md"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[12px] font-bold ${
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
                      <p className="text-[12.5px] font-bold text-ink truncate group-hover:text-channel transition">
                        {n.title}
                      </p>
                      <span className="text-[9.5px] font-medium text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-channel group-hover:underline">
                        Open Page →
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {role === "admin" ? "Admin HQ" : role === "volunteer" ? "Volunteer" : "Camp Mgr"}
                      </span>
                    </div>
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
