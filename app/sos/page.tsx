import type { Metadata } from "next";
import { IconMenu, IconShieldPin } from "../components/icons";
import { Logo } from "../components/logo";
import { CitizenNav } from "../components/citizen-nav";
import { LanguageProvider } from "../components/language-context";
import { Translated, LanguagePill } from "../components/citizen-translated";
import { SosChannelsClient } from "./sos-channels-client";

export const metadata: Metadata = {
  title: "Need Help? — RippleNet AI",
};

export default function SosPage() {
  return (
    <LanguageProvider>
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">
        <header className="flex items-center gap-3 px-5 pt-1">
          <Logo className="h-11 w-11" />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-bold text-ink">RippleNet AI</p>
            <p className="text-[11px] font-medium text-slate-500">Alkhidmat Flood Relief</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguagePill />
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            >
              <IconMenu className="h-[22px] w-[22px]" />
            </button>
          </div>
        </header>

        <main className="pb-[110px]">
          <section className="px-5 pt-6">
            <Translated
              k="needHelp"
              as="h1"
              className="font-display text-[28px] font-extrabold leading-[1.15] tracking-tight text-ink"
            />
            <Translated k="hereForYou" as="p" className="mt-1.5 text-[14px] font-medium text-slate-500" />
          </section>

          <SosChannelsClient />

          <section className="mt-4 px-5">
            <div className="flex items-center gap-3 rounded-2xl bg-sky-50 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-channel shadow-sm">
                <IconShieldPin className="h-[22px] w-[22px]" />
              </span>
              <div className="leading-tight">
                <Translated k="locationAuto" as="p" className="text-[12.5px] font-semibold text-ink" />
                <Translated k="dataPrivacy" as="p" className="mt-1 text-[11px] text-slate-500" />
              </div>
            </div>
          </section>
        </main>

        <CitizenNav active="home" />
      </div>
    </LanguageProvider>
  );
}
