"use client";

import { useState } from "react";
import Link from "next/link";
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
  actionText?: string;
  read?: boolean;
}

const adminNotifications: NotificationItem[] = [
  {
    id: "admin-notif-1",
    title: "Critical SOS: Infant Dehydration",
    message: "RIP-2026-00001 · High-priority emergency in Thatta District. Urgent rehydration package dispatch requested by field medical officer.",
    time: "2m ago",
    type: "critical",
    link: "/admin/dashboard",
    actionText: "View Overview Dashboard",
  },
  {
    id: "admin-notif-2",
    title: "Indus Basin Flood Inundation Warning",
    message: "Flood Agent: River Indus runoff surged +35mm in Sukkur & Dadu relief camp perimeters. Saturated soil requires bypass logistics.",
    time: "14m ago",
    type: "warning",
    link: "/admin/camps",
    actionText: "Open Camps & Flood Map",
  },
  {
    id: "admin-notif-3",
    title: "New Restock Request Pending Approval",
    message: "Badin Relief Camp requested 50 units of RippleNet Water Purification Kits. Stock levels currently below safety threshold.",
    time: "32m ago",
    type: "warning",
    link: "/admin/restock",
    actionText: "Open Restock Approval Desk",
  },
  {
    id: "admin-notif-4",
    title: "Citizen Complaint Logged",
    message: "Delivery delay reported in Nowshera Camp sector 4. Grievance submitted via citizen portal for priority resolution.",
    time: "1h ago",
    type: "info",
    link: "/admin/complaints",
    actionText: "Open Complaints & Reports",
  },
];

const volunteerNotifications: NotificationItem[] = [
  {
    id: "vol-notif-1",
    title: "Emergency Delivery Task Assigned",
    message: "RIP-2026-00001 · Urgent Infant Rehydration Kit assigned to you for immediate motorcycle/boat dispatch.",
    time: "3m ago",
    type: "critical",
    link: "/volunteer/tasks",
    actionText: "Open My Tasks",
  },
  {
    id: "vol-notif-2",
    title: "Route Advisory: Submerged Road",
    message: "Route Agent: Badin North road cut by floodwaters. Follow alternate safe bypass route via Base Camp support desk.",
    time: "18m ago",
    type: "warning",
    link: "/volunteer/support",
    actionText: "Open Field Support Desk",
  },
  {
    id: "vol-notif-3",
    title: "Delivery Proof Verified & Logged",
    message: "Your photo and signature delivery proof for RIP-2026-00002 has been verified and permanently logged.",
    time: "45m ago",
    type: "success",
    link: "/volunteer/history",
    actionText: "Open Delivery History",
  },
  {
    id: "vol-notif-4",
    title: "Base Camp Hotline 24/7 Active",
    message: "Disaster coordinator and medical triage team are available 24/7 on the field support desk.",
    time: "2h ago",
    type: "info",
    link: "/volunteer/support",
    actionText: "Contact Support Desk",
  },
];

const campManagerNotifications: NotificationItem[] = [
  {
    id: "mgr-notif-1",
    title: "Critical SOS: Infant Dehydration",
    message: "RIP-2026-00001 · Village Jam Goth requires urgent ORS & Zinc therapy dispatch. Flood severity calculated at 9.2/10.",
    time: "2m ago",
    type: "critical",
    link: "/queue",
    actionText: "Open Incoming Queue",
  },
  {
    id: "mgr-notif-2",
    title: "Flood Inundation Warning",
    message: "Flood Agent: River Indus basin runoff surged +35mm. Check active emergency queue and route hazards.",
    time: "14m ago",
    type: "warning",
    link: "/queue",
    actionText: "Inspect Emergency Queue",
  },
  {
    id: "mgr-notif-3",
    title: "Restock Request Approved by HQ",
    message: "Admin HQ approved 50 units of RippleNet Water Purification Kits for field warehouse delivery.",
    time: "45m ago",
    type: "success",
    link: "/stock",
    actionText: "Open Camp Stock Desk",
  },
  {
    id: "mgr-notif-4",
    title: "Volunteer On-Duty Check-In",
    message: "Hamza Khan reached delivery perimeter for RIP-2026-00002 safely. Check available roster.",
    time: "1h ago",
    type: "info",
    link: "/volunteers",
    actionText: "Open Volunteers Roster",
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
  const [selectedAlert, setSelectedAlert] = useState<NotificationItem | null>(null);

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

  const handleOpenAlertModal = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setSelectedAlert(item);
  };

  const handleNavigateDirect = (item: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setOpen(false);
    setSelectedAlert(null);
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
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
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

          <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[92vw] rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <p className="font-display text-[15px] font-bold text-ink">Notifications</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-channel hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 max-h-[360px] space-y-2.5 overflow-y-auto pr-0.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenAlertModal(n)}
                  role="button"
                  tabIndex={0}
                  className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl p-3 transition border text-left ${
                    n.read
                      ? "bg-slate-50/70 border-slate-100 opacity-80 hover:opacity-100 hover:bg-white hover:border-slate-300"
                      : "bg-white border-slate-200 shadow-xs ring-1 ring-black/5 hover:border-channel hover:shadow-md"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-[13px] font-bold shadow-xs ${
                      n.type === "critical"
                        ? "bg-red-500 shadow-red-500/30"
                        : n.type === "warning"
                        ? "bg-amber-500 shadow-amber-500/30"
                        : n.type === "success"
                        ? "bg-emerald-500 shadow-emerald-500/30"
                        : "bg-channel shadow-channel/30"
                    }`}
                  >
                    {n.type === "critical" ? "!" : n.type === "warning" ? "⚠" : n.type === "success" ? "✓" : "i"}
                  </span>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[13px] font-bold text-ink truncate group-hover:text-channel transition">
                        {n.title}
                      </p>
                      <span className="text-[9.5px] font-medium text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <Link
                        href={n.link}
                        onClick={(e) => handleNavigateDirect(n, e)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-channel hover:underline"
                      >
                        Open Page →
                      </Link>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
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

      {/* Full Notification Intelligence Alert Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-[420px] rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  selectedAlert.type === "critical"
                    ? "bg-red-100 text-red-700"
                    : selectedAlert.type === "warning"
                    ? "bg-amber-100 text-amber-800"
                    : selectedAlert.type === "success"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    selectedAlert.type === "critical"
                      ? "bg-red-500 animate-pulse"
                      : selectedAlert.type === "warning"
                      ? "bg-amber-500"
                      : selectedAlert.type === "success"
                      ? "bg-emerald-500"
                      : "bg-channel"
                  }`}
                />
                {selectedAlert.type === "critical"
                  ? "CRITICAL ALERT"
                  : selectedAlert.type === "warning"
                  ? "OPERATIONAL WARNING"
                  : selectedAlert.type === "success"
                  ? "SYSTEM CONFIRMATION"
                  : "INFORMATION INTEL"}
              </span>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="font-display text-[17px] font-extrabold text-ink leading-snug">
                {selectedAlert.title}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Logged {selectedAlert.time} · Priority Operational Telemetry
              </p>

              <div className="mt-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[13px] leading-relaxed text-slate-700">
                  {selectedAlert.message}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={selectedAlert.link}
                onClick={() => {
                  setSelectedAlert(null);
                  setOpen(false);
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-channel text-[13.5px] font-bold text-white shadow-lg shadow-channel/25 active:scale-[0.98] transition hover:bg-sky-700"
              >
                <span>{selectedAlert.actionText || "Open Action Console"}</span>
                <IconChevronRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="h-10 w-full rounded-full border border-slate-200 bg-white text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
