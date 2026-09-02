"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Translated } from "../components/citizen-translated";
import {
  IconSearch,
  IconArrowRight,
  IconTruck,
  IconCheck,
  IconAlertTriangle,
  IconDroplet,
  IconSparkles,
} from "../components/icons";

interface SampleRequest {
  code: string;
  name: string;
  district: string;
  status: string;
  tone: string;
  tag: string;
}

const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    code: "RIP-2026-00001",
    name: "Fatima Bibi",
    district: "Badin",
    status: "In Transit",
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
    tag: "Medical & Clean Water Dispatched",
  },
  {
    code: "RIP-2026-00002",
    name: "Bashir Ahmed",
    district: "Nowshera",
    status: "Assigned",
    tone: "bg-sky-50 text-sky-700 ring-sky-200",
    tag: "Evacuation Boat Assigned",
  },
  {
    code: "RIP-2026-00005",
    name: "Muhammad Yousuf",
    district: "Badin",
    status: "Pending Triage",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
    tag: "Critical Diarrhea/Fever",
  },
  {
    code: "RIP-2026-00008",
    name: "Saima",
    district: "Badin",
    status: "Resolved",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    tag: "Relief Delivered",
  },
];

export function TrackSearch({ notFound = false }: { notFound?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("RIP-2026-00001");

  useEffect(() => {
    if (notFound) return;
    const last = localStorage.getItem("citizen_last_request");
    if (last) router.replace(`/status?code=${encodeURIComponent(last)}`);
  }, [notFound, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (code.trim() || "RIP-2026-00001").toUpperCase();
    router.push(`/status?code=${encodeURIComponent(trimmed)}`);
  };

  const selectCode = (c: string) => {
    setCode(c);
    router.push(`/status?code=${encodeURIComponent(c)}`);
  };

  return (
    <section className="px-5 pt-6 space-y-4">
      {/* Search Input Box */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <Translated k="searchTitle" as="h2" className="font-display text-[18px] font-bold text-ink" />
          <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[9.5px] font-bold text-channel ring-1 ring-channel/20">
            Live SOS Tracker
          </span>
        </div>

        <form onSubmit={submit} className="mt-3.5">
          <label className="block">
            <Translated
              k="requestId"
              as="span"
              className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400"
            />
            <div className="relative mt-1.5">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="RIP-2026-00001"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-12 text-[14px] font-bold tracking-wide text-ink outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300 focus:border-channel focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="submit"
                aria-label="Track request"
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-ink text-white shadow-md transition hover:bg-channel active:scale-95"
              >
                <IconSearch className="h-4 w-4" />
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-channel text-[13px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-[0.98]"
          >
            Track Live Request ({code})
            <IconArrowRight className="h-4 w-4" />
          </button>
        </form>

        {notFound && (
          <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600 ring-1 ring-red-200">
            <Translated k="notFound" />
          </p>
        )}
      </div>

      {/* Realistic Sample Request Quick-Selector */}
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/50 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <IconSparkles className="h-4 w-4 text-channel" />
            <p className="font-display text-[13px] font-bold text-ink">Sample Live Request IDs</p>
          </div>
          <span className="text-[10.5px] font-semibold text-slate-400">1-Tap to Inspect</span>
        </div>

        <div className="mt-3 space-y-2">
          {SAMPLE_REQUESTS.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => selectCode(s.code)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-xs transition-all hover:border-sky-300 hover:bg-sky-50/40 active:scale-[0.99]"
            >
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] font-bold text-ink">{s.code}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${s.tone}`}>
                    {s.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {s.name} · {s.district} · <span className="font-medium text-slate-700">{s.tag}</span>
                </p>
              </div>
              <IconArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      <Translated
        k="sosNote"
        as="p"
        className="mt-2 px-2 text-center text-[11.5px] leading-relaxed text-slate-400"
      />
    </section>
  );
}
