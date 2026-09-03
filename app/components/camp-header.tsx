"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import {
  IconMenu,
  IconX,
  IconClipboardCheck,
  IconUsers,
  IconPackage,
  IconFileQuestion,
  IconSparkles,
  IconHome,
  IconPhone,
  IconChevronRight,
  IconLogOut,
  IconShield,
} from "./icons";

export function CampHeader({
  campName = "Alkhidmat Health Camp",
  subtitle = "Camp Manager Field Base",
}: {
  campName?: string;
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
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-5 pb-2 bg-paper">
        {/* Left Side Hamburger ☰ Menu Button */}
        <button
          type="button"
          aria-label="Open Camp Manager Navigation Menu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink border border-slate-200/80 shadow-xs hover:bg-slate-50 transition active:scale-90"
        >
          <IconMenu className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </button>

        <div className="text-center leading-tight">
          <p className="font-display text-[15.5px] font-bold tracking-tight text-ink flex items-center justify-center gap-1.5">
            {campName}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-channel animate-pulse" />
          </p>
          <p className="text-[11px] font-medium text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell role="camp_manager" />
          <Image
            src="/images/avatar_imran.png"
            alt="Camp Manager profile"
            width={36}
            height={36}
            className="rounded-full object-cover ring-2 ring-channel/30 shadow-xs"
          />
        </div>
      </header>

      {/* Slide-Out Camp Manager Navigation Drawer (Opens from Left Side) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-start">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="relative w-full max-w-[340px] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/70">
              <div className="flex items-center gap-2.5">
                <Logo className="h-9 w-9" />
                <div className="leading-tight">
                  <p className="font-display text-[15px] font-bold text-ink">Camp Manager Hub</p>
                  <p className="text-[10.5px] font-semibold text-channel">Alkhidmat Field Operations</p>
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

            {/* Quick Navigation Sections */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operations
              </p>

              <Link
                href="/queue"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconClipboardCheck className="h-4.5 w-4.5 text-channel" />
                  Dispatch Queue
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/volunteers"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconUsers className="h-4.5 w-4.5 text-emerald-600" />
                  Volunteer Roster
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/stock"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconPackage className="h-4.5 w-4.5 text-amber-500" />
                  Stock Management
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/complaints"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconFileQuestion className="h-4.5 w-4.5 text-rose-500" />
                  Camp Complaints & Triage
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/demo"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconSparkles className="h-4.5 w-4.5 text-purple-600" />
                  Multi-Agent AI Pipeline
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">AI</span>
              </Link>
            </div>

            {/* Quick Portals Switcher */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100 bg-slate-50/50">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Portals &amp; Views
              </p>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconHome className="h-4 w-4 text-slate-600" />
                  Citizen Portal (Home)
                </span>
                <IconChevronRight className="h-3 w-3 text-slate-400" />
              </Link>

              <Link
                href="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconShield className="h-4 w-4 text-purple-600" />
                  Admin National HQ
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
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-2.5 text-left active:scale-95 transition"
                >
                  <IconPhone className="h-4 w-4 text-red-600 shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-red-900">Rescue 1122</p>
                    <p className="text-[10px] text-red-700">Toll-Free SOS</p>
                  </div>
                </a>

                <a
                  href="tel:080022677"
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-left active:scale-95 transition"
                >
                  <IconPhone className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-emerald-900">Alkhidmat</p>
                    <p className="text-[10px] text-emerald-700">0800-22677</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Logout Footer */}
            <div className="mt-auto p-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-700 shadow-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition active:scale-98 disabled:opacity-50"
              >
                <IconLogOut className="h-4 w-4" />
                {loggingOut ? "Signing Out…" : "Secure Sign Out"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
