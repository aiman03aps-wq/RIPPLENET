import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconChevronLeft } from "../../components/icons";
import { VolunteerLoginForm } from "./login-form";
import {
  FeatureIconReachFaster,
  FeatureIconSaveLives,
  FeatureIconStayConnected,
} from "./volunteer-icons";

export const metadata: Metadata = {
  title: "Volunteer Login — RippleNet AI",
};

const features = [
  { title: "Save Lives", desc: "Your help brings hope", Icon: FeatureIconSaveLives },
  { title: "Reach Faster", desc: "AI routes, smarter delivery", Icon: FeatureIconReachFaster },
  { title: "Stay Connected", desc: "Real-time updates & support", Icon: FeatureIconStayConnected },
] as const;

export default function VolunteerLoginPage() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">
      <header className="relative h-[250px]">
        <Image
          src="/images/volunteer_login_banner_v2.png"
          alt="Alkhidmat volunteer standing in a flooded village"
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 top-0 flex flex-col items-center bg-gradient-to-b from-white/90 via-white/50 to-transparent px-5 pb-10 pt-7">
          <div className="flex w-full items-center justify-between">
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-channel shadow-xs backdrop-blur-sm">
              Volunteer
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-ink shadow-xs backdrop-blur-sm transition hover:bg-white active:scale-95"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <p className="mt-2 font-display text-[20px] font-bold tracking-tight text-ink">
            RippleNet AI
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Alkhidmat Relief</p>
        </div>
      </header>

      <main className="px-5 pb-10 pt-6">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          Welcome Volunteer!
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">Login to view your assigned tasks</p>

        <VolunteerLoginForm />

        <section className="mt-7 grid grid-cols-3 gap-2.5" aria-label="Why volunteer on RippleNet">
          {features.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/70 px-2 py-3.5 text-center"
            >
              <Icon className="h-8 w-8" />
              <p className="mt-2 text-[10.5px] font-bold leading-tight text-ink">{title}</p>
              <p className="mt-1 text-[8.5px] leading-snug text-slate-400">{desc}</p>
            </div>
          ))}
        </section>

        <p className="mt-6 text-center text-[11px] font-medium text-slate-400">
          No account? Contact your camp admin
        </p>
      </main>
    </div>
  );
}
