import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconChevronLeft,
  IconClipboardCheck,
  IconDownload,
  IconHeart,
  IconLayoutDashboard,
  IconMessageSquareWarning,
} from "../../components/icons";
import { Logo } from "../../components/logo";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login — RippleNet AI",
};

const features = [
  {
    title: "System-wide overview",
    desc: "Monitor all camps and requests",
    Icon: IconLayoutDashboard,
  },
  {
    title: "Restock approvals",
    desc: "Review and approve restock requests",
    Icon: IconClipboardCheck,
  },
  {
    title: "Complaints & reports",
    desc: "Oversee complaints and generate reports",
    Icon: IconMessageSquareWarning,
  },
  {
    title: "Data export",
    desc: "Export operational data and insights",
    Icon: IconDownload,
  },
] as const;

export default function AdminLoginPage() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-hidden bg-ink shadow-xl">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/images/admin_login_bg.png"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/45 to-white/80" />
      </div>

      <div className="relative flex min-h-dvh flex-col px-5 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-ink shadow-xs backdrop-blur-sm transition hover:bg-white active:scale-95"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            Citizen Home
          </Link>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink shadow-xs backdrop-blur-sm">
            Admin Portal
          </span>
        </div>

        <header className="mt-3 flex flex-col items-center">
          <Logo className="h-16 w-16 shadow-md" />
          <p className="mt-3 font-display text-[22px] font-bold tracking-tight text-ink">
            RippleNet AI
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-500">
            Alkhidmat Flood Relief
          </p>
        </header>

        <main className="mt-6 w-full rounded-[28px] bg-white px-5 pb-6 pt-6 shadow-2xl shadow-black/15">
          <h1 className="text-center font-display text-[24px] font-extrabold tracking-tight text-ink">
            Welcome Admin
          </h1>
          <p className="mt-1 text-center text-[13px] text-slate-500">
            Sign in to oversee camps and operations
          </p>

          <AdminLoginForm />

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-[11.5px]">
            <Link href="/" className="font-bold text-sky-600 hover:underline">
              ← Return to Citizen Home
            </Link>
            <span className="text-slate-400">Headquarters</span>
          </div>
        </main>

        <section
          className="mt-5 w-full rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-black/10"
          aria-label="Admin access features"
        >
          <h2 className="text-center font-display text-[15px] font-bold text-ink">
            Admin Access
          </h2>
          <div className="mt-4">
            {features.map(({ title, desc, Icon }, i) => (
              <div
                key={title}
                className={`flex items-start gap-3 py-3 ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-channel">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">{title}</p>
                  <p className="text-[11.5px] text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mx-auto mt-auto flex items-center gap-1 pt-6 text-center text-[11px] font-medium text-slate-500">
          Serving humanity in times of crisis
          <IconHeart className="h-3 w-3 text-rose-400" fill="currentColor" />
        </p>
      </div>
    </div>
  );
}
