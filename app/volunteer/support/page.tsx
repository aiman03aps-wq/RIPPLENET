import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthGuard } from "../../components/auth-guard";
import { VolunteerNav } from "../../components/volunteer-nav";
import {
  IconPhone,
  IconAlertTriangle,
  IconShield,
  IconTruck,
  IconActivity,
  IconWaterKit,
  IconChevronRight,
  IconSparkles,
  IconCheck,
} from "../../components/icons";
import { prisma } from "../../../lib/db";
import { getSession } from "../../../lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteer Field Support — RippleNet AI",
};

export default async function VolunteerSupportPage() {
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const camp = session.campId
    ? await prisma.camp.findUnique({ where: { id: session.campId } })
    : null;

  const campPhone = camp?.phone ?? "0300 1234567";

  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        <header className="px-5 pt-7 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
                  Field Support
                </h1>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-violet-800">
                  Volunteer Operations
                </span>
              </div>
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                {camp ? `${camp.name}` : "Alkhidmat Field Operations"} Dispatch Desk
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-channel text-white shadow-md">
              <IconShield className="h-5 w-5" />
            </span>
          </div>
        </header>

        <main className="px-5 pb-24 space-y-4">
          {/* Volunteer Mayday / Emergency Escalation */}
          <div className="rounded-3xl border border-red-200 bg-gradient-to-b from-red-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
                <IconAlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-[15px] font-bold text-red-950">
                  Volunteer Emergency SOS (Mayday)
                </h2>
                <p className="text-[11px] text-red-700">
                  Trapped in rising water, boat capsize, or severe injury
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${campPhone.replace(/\s+/g, "")}`}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-red-600 text-[12px] font-bold text-white shadow-md shadow-red-600/25 transition active:scale-95"
              >
                <IconPhone className="h-4 w-4" />
                Base Camp Emergency
              </a>
              <a
                href="tel:1122"
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-900 text-[12px] font-bold text-white shadow-md transition active:scale-95"
              >
                Call Rescue 1122
              </a>
            </div>
          </div>

          {/* Operational Support Hotlines */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
            <h2 className="font-display text-[15px] font-bold text-ink">Field Operations Hotlines</h2>

            <div className="space-y-2">
              {/* Camp Dispatcher */}
              <a
                href={`tel:${campPhone.replace(/\s+/g, "")}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition hover:bg-sky-50/60 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-channel">
                    <IconPhone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">Camp Dispatch Coordinator</p>
                    <p className="text-[11px] text-slate-500">Route reassignment, address clarification ({campPhone})</p>
                  </div>
                </div>
                <IconChevronRight className="h-4 w-4 text-slate-300" />
              </a>

              {/* Medical / Outbreak Clinical Desk */}
              <a
                href="tel:080044448"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition hover:bg-rose-50/60 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <IconActivity className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">Medical &amp; Triage Officer</p>
                    <p className="text-[11px] text-slate-500">Clinical guidance: Cholera, snake bite, neonatal (0800 44448)</p>
                  </div>
                </div>
                <IconChevronRight className="h-4 w-4 text-slate-300" />
              </a>

              {/* Vehicle / Fuel Support */}
              <a
                href="tel:02138659999"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition hover:bg-amber-50/60 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <IconTruck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">Transport &amp; Fleet Recovery</p>
                    <p className="text-[11px] text-slate-500">4x4 recovery, boat tow, fuel dispatch (021 38659999)</p>
                  </div>
                </div>
                <IconChevronRight className="h-4 w-4 text-slate-300" />
              </a>

              {/* PDMA Disaster Control Center */}
              <a
                href="tel:1736"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition hover:bg-purple-50/60 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <IconShield className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">PDMA Disaster Command Center</p>
                    <p className="text-[11px] text-slate-500">Government disaster relief hotline (1736)</p>
                  </div>
                </div>
                <IconChevronRight className="h-4 w-4 text-slate-300" />
              </a>
            </div>
          </div>

          {/* Water Purification & ORS Protocol Field Guide */}
          <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-channel text-white">
                <IconWaterKit className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[13.5px] font-bold text-ink">
                  Water Purification &amp; ORS Guide
                </h3>
                <p className="text-[10.5px] text-slate-500">Emergency hydration &amp; decontamination protocol</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11.5px] text-slate-700">
              <p className="flex items-start gap-1.5">
                <span className="font-bold text-channel">1.</span>
                <span>Use water purification tabs in 20L clean containers (wait 30 minutes before drinking).</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="font-bold text-channel">2.</span>
                <span>Mix 1 packet of ORS in 1 Liter of clean potable water; stir until completely dissolved.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="font-bold text-channel">3.</span>
                <span>Distribute Zinc tablets alongside ORS for children under 5 with acute diarrhea.</span>
              </p>
            </div>
          </div>

          {/* Safety Protocols */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="font-display text-[13.5px] font-bold text-ink">Field Safety Rules</h3>
            <ul className="mt-2.5 space-y-1 text-[11.5px] text-slate-600 list-disc list-inside">
              <li>Always wear high-visibility life jackets during boat transit.</li>
              <li>Do not drive 4x4 trucks across flowing water deeper than 1.5 feet.</li>
              <li>Keep all oral medication packages in waterproof dry bags.</li>
              <li>Report any newly submerged road cut to Route Agent in real time.</li>
            </ul>
          </div>
        </main>

        <VolunteerNav active="support" />
      </div>
    </AuthGuard>
  );
}
