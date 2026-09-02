"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import {
  IconMenu,
  IconX,
  IconHome,
  IconAlertTriangle,
  IconVideo,
  IconMapPin,
  IconClock,
  IconShield,
  IconSparkles,
  IconPhone,
  IconUsers,
  IconActivity,
  IconChevronRight,
} from "./icons";
import { useLanguage } from "./language-context";

export function CitizenHeader({
  title = "RippleNet AI",
  subtitle = "Alkhidmat Flood Relief",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-5 pt-3 pb-2 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Functioning Hamburger Menu Button (Three lines on left side) */}
          <button
            type="button"
            aria-label="Open Navigation Menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-ink hover:bg-slate-100 active:scale-90 transition border border-slate-200/80 shadow-sm shrink-0"
          >
            <IconMenu className="h-[20px] w-[20px]" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5 transition active:scale-95 group"
            title="Go to RippleNet Home"
          >
            <Logo className="h-9 w-9 shrink-0 group-hover:opacity-90" />
            <div className="leading-tight">
              <p className="font-display text-[15.5px] font-bold text-ink tracking-tight flex items-center gap-1.5">
                {title}
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[11px] font-medium text-slate-500">{subtitle}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Slide-out Navigation Drawer on Left Side */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-start">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="relative w-full max-w-[340px] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/50">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <Logo className="h-9 w-9" />
                <div className="leading-tight">
                  <p className="font-display text-[15px] font-bold text-ink">RippleNet AI</p>
                  <p className="text-[10.5px] font-medium text-slate-500">Emergency Dispatch</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 border border-slate-200 shadow-sm active:scale-90"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Navigation */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Citizen Services
              </p>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconHome className="h-4 w-4 text-channel" />
                  Landing Page
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/sos"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconAlertTriangle className="h-4 w-4 text-red-500" />
                  Request Emergency SOS
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Urgent</span>
              </Link>

              <Link
                href="/sos/video"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconVideo className="h-4 w-4 text-indigo-500" />
                  Record SOS Video / Audio
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/status"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconClock className="h-4 w-4 text-channel" />
                  Track Relief Request
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/camps"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconMapPin className="h-4 w-4 text-emerald-600" />
                  Relief Camps Map & Directory
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/complaints"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconActivity className="h-4 w-4 text-amber-500" />
                  File Camp Complaint / Feedback
                </span>
                <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/demo"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-channel transition"
              >
                <span className="flex items-center gap-2.5">
                  <IconSparkles className="h-4 w-4 text-violet-500" />
                  Interactive Multi-Agent Demo
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">AI</span>
              </Link>
            </div>

            {/* Portal Access */}
            <div className="p-4 flex flex-col gap-1 border-b border-slate-100 bg-slate-50/50">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Staff & Responder Portals
              </p>
              <Link
                href="/volunteer/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconUsers className="h-4 w-4 text-emerald-600" />
                  Volunteer Field Portal
                </span>
                <IconChevronRight className="h-3 w-3 text-slate-400" />
              </Link>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconShield className="h-4 w-4 text-channel" />
                  Camp Manager Console
                </span>
                <IconChevronRight className="h-3 w-3 text-slate-400" />
              </Link>

              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <span className="flex items-center gap-2">
                  <IconSparkles className="h-4 w-4 text-purple-600" />
                  Admin HQ Command Center
                </span>
                <IconChevronRight className="h-3 w-3 text-slate-400" />
              </Link>
            </div>

            {/* Verified Emergency Hotlines */}
            <div className="p-4 mt-auto">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                24/7 Verified Emergency Call
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href="tel:1122"
                  className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-left text-red-700 font-bold active:scale-95 transition"
                >
                  <IconPhone className="h-4 w-4 shrink-0 text-red-600" />
                  <div className="leading-tight">
                    <p className="text-[12px]">Rescue</p>
                    <p className="text-[14px]">1122</p>
                  </div>
                </a>
                <a
                  href="tel:080044448"
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-left text-emerald-800 font-bold active:scale-95 transition"
                >
                  <IconPhone className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="leading-tight">
                    <p className="text-[10px]">Alkhidmat</p>
                    <p className="text-[11px]">0800 44448</p>
                  </div>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
