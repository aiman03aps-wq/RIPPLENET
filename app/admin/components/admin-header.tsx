"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "../../components/logo";
import { NotificationBell } from "../../components/notification-bell";
import {
  IconMenu,
  IconX,
  IconLayoutDashboard,
  IconTent,
  IconPackage,
  IconMessageSquareWarning,
  IconReportChart,
  IconSparkles,
  IconHome,
  IconPhone,
  IconChevronRight,
  IconLogOut,
  IconShield,
} from "../../components/icons";

export function AdminHeader({
  title = "RippleNet AI Admin",
  subtitle = "National Command HQ",
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-5 pb-2 bg-paper">
        <button
          type="button"
          aria-label="Open Admin Command Menu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink border border-slate-200/80 shadow-xs hover:bg-slate-50 transition active:scale-90"
        >
          <IconMenu className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </button>

        <div className="text-center leading-tight">
          <p className="font-display text-[16px] font-bold tracking-tight text-ink flex items-center justify-center gap-1.5">
            {title}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
          </p>
          <p className="text-[11px] font-medium text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell role="admin" />
          <Image
            src="/images/avatar_ali.png"
            alt="Admin profile"
            width={36}
            height={36}
            className="rounded-full object-cover ring-2 ring-purple-600/30 shadow-xs"
          />
        </div>
      </header>

      {/* Slide-Out Admin Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-start">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="relative w-full max-w-[340px] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-purple-50/60">
              <div className="flex items-center gap-2.5">
                <Logo className="h-9 w-9" />
                <div className="leading-tight">
                  <p className="font-display text-[15px] font-bold text-ink">Admin HQ Console</p>
                  <p className="text-[10.5px] font-semibold text-purple-700">Alkhidmat Command</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 border border-slate-200 shadow-sm active:scale-90 transition hover:bg-slate-50"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Admin Command Sections */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Command Modules
              </p>

              <Link
                href="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconLayoutDashboard className="h-4 w-4 text-purple-600" />
                  Overview Dashboard
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/camps"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconTent className="h-4 w-4 text-emerald-600" />
                  Relief Camps &amp; Inundation
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/restock"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconPackage className="h-4 w-4 text-amber-600" />
                  Restock Approval Desk
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Priority
                </span>
              </Link>

              <Link
                href="/admin/complaints"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconMessageSquareWarning className="h-4 w-4 text-rose-500" />
                  Citizen Complaints &amp; Triage
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/reports"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconReportChart className="h-4 w-4 text-channel" />
                  Field Intelligence &amp; Reports
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Quick Portals & Tools */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100 bg-slate-50/50">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Tools
              </p>

              <Link
                href="/demo"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconSparkles className="h-4 w-4 text-violet-600" />
                  5 AI Agents Sandbox
                </span>
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">AI</span>
              </Link>

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconHome className="h-4 w-4 text-slate-600" />
                  Citizen Landing Page
                </span>
                <IconChevronRight className="h-3 w-3 text-slate-400" />
              </Link>
            </div>

            {/* Emergency Hotline Desk */}
            <div className="p-4 border-b border-slate-100">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direct Emergency Desks
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href="tel:1122"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2 text-[11.5px] font-bold text-white shadow-xs"
                >
                  <IconPhone className="h-3.5 w-3.5" />
                  Rescue 1122
                </a>
                <a
                  href="tel:080022222"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2 text-[11.5px] font-bold text-white shadow-xs"
                >
                  <IconPhone className="h-3.5 w-3.5" />
                  Alkhidmat HQ
                </a>
              </div>
            </div>

            {/* Logout Footer */}
            <div className="mt-auto p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-[13px] font-bold text-red-600 transition hover:bg-red-100 active:scale-98 disabled:opacity-50"
              >
                <IconLogOut className="h-4 w-4" />
                {loggingOut ? "Signing Out..." : "Sign Out of Admin Console"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
