"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconClock,
  IconGlobe,
  IconHome,
  IconPhone,
  IconMic,
  IconX,
} from "./icons";
import { useLanguage } from "./language-context";
import { useCitizenLocation } from "./use-citizen-location";
import { languages } from "../../lib/citizen-translations";

export type CitizenTab = "home" | "status" | "contact" | "language";

export interface NavCamp {
  name: string;
  phone: string;
  district?: string;
}

const navItems = [
  { id: "home" as const, labelKey: "home", Icon: IconHome },
  { id: "status" as const, labelKey: "status", Icon: IconClock },
  { id: "contact" as const, labelKey: "contactCard", Icon: IconPhone },
  { id: "language" as const, labelKey: "language", Icon: IconGlobe },
];

const DEFAULT_CAMP: NavCamp = {
  name: "Alkhidmat Central Relief Base",
  phone: "051 5551234",
  district: "Islamabad / Rawalpindi",
};

export function CitizenNav({ active, camp }: { active?: CitizenTab; camp?: NavCamp }) {
  const { lang, setLang, t, openPicker, setOpenPicker } = useLanguage();
  const { coords, districtName } = useCitizenLocation();
  const [contactOpen, setContactOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeCamp, setActiveCamp] = useState<NavCamp>(camp ?? DEFAULT_CAMP);
  const showLang = langOpen || openPicker;
  const closeLang = () => { setLangOpen(false); setOpenPicker(false); };

  useEffect(() => {
    if (camp) {
      setActiveCamp(camp);
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qDist = params.get("district");
      const qLat = params.get("lat");
      const qLng = params.get("lng");
      const qCode = params.get("code");

      if (qCode && !qDist && !qLat) {
        fetch(`/api/requests/${encodeURIComponent(qCode)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.request?.camp) {
              setActiveCamp({
                name: d.request.camp.name,
                phone: d.request.camp.phone,
                district: d.request.camp.district,
              });
            }
          })
          .catch(() => {});
        return;
      }

      let url = "/api/camps?limit=1";
      if (qDist) {
        url += `&district=${encodeURIComponent(qDist)}`;
      } else if (qLat && qLng) {
        url += `&lat=${qLat}&lng=${qLng}`;
      } else if (coords?.lat && coords?.lng) {
        url += `&lat=${coords.lat}&lng=${coords.lng}`;
      } else if (districtName) {
        const rawDist = districtName.split(",")[0].trim();
        url += `&district=${encodeURIComponent(rawDist)}`;
      }

      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.camps) && d.camps.length > 0) {
            const c = d.camps[0];
            setActiveCamp({ name: c.name, phone: c.phone, district: c.district });
          }
        })
        .catch(() => {});
    }
  }, [camp, coords, districtName]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] border-t border-slate-200/70 bg-white/95 pb-[max(10px,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="grid grid-cols-4 px-6 pt-2">
          {navItems.map(({ id, labelKey, Icon }) => {
            const isActive = id === active;
            const colorClass = isActive ? "text-channel" : "text-slate-400";

            if (id === "contact") {
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 ${colorClass}`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                  <span className="text-[9px] font-semibold">{t(labelKey)}</span>
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-channel" />
                  )}
                </button>
              );
            }

            if (id === "language") {
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLangOpen(true)}
                  className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 ${colorClass}`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                  <span className="text-[9px] font-semibold">{t(labelKey)}</span>
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-channel" />
                  )}
                </button>
              );
            }

            const href = id === "home" ? "/sos" : "/status";
            return (
              <Link
                key={id}
                href={href}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 ${colorClass}`}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[9px] font-semibold">{t(labelKey)}</span>
                {isActive && (
                  <span className="absolute -top-2 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-channel" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Contact Card Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setContactOpen(false)}
          />
          <div className="relative mx-auto w-full max-w-[480px] animate-slide-up rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-ink">
                {t("emergencyContacts")}
              </h2>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <IconPhone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {t("districtHotline")}
                  </p>
                  <p className="mt-0.5 text-[15px] font-bold tabular-nums text-ink">
                    0800 44 44 88
                  </p>
                </div>
                <a
                  href="tel:0800444488"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition active:scale-95"
                >
                  <IconPhone className="h-[18px] w-[18px]" />
                </a>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <IconMic className="h-[22px] w-[22px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {t("sendVoiceNote")}
                  </p>
                  <p className="mt-0.5 text-[13.5px] font-bold text-ink">
                    7 Languages AI Voice SOS
                  </p>
                </div>
                <Link
                  href="/sos/audio"
                  onClick={() => setContactOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition active:scale-95"
                >
                  <IconMic className="h-[18px] w-[18px]" />
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <IconPhone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {activeCamp?.district ? `${activeCamp.district} Relief Base` : t("baseCamp")}
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-ink">
                    {activeCamp?.name || t("campName")}
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-slate-500">
                    {activeCamp?.phone || "051 5551234"}
                  </p>
                </div>
                <a
                  href={`tel:${(activeCamp?.phone || "0515551234").replace(/\s+/g, "")}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition active:scale-95"
                >
                  <IconPhone className="h-[18px] w-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Picker Modal */}
      {showLang && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeLang}
          />
          <div className="relative mx-auto w-full max-w-[480px] animate-slide-up rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-ink">
                {t("selectLanguage")}
              </h2>
              <button
                type="button"
                onClick={closeLang}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {languages.map(({ code, name, native }) => {
                const isSelected = code === lang;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLang(code);
                      closeLang();
                    }}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                      isSelected
                        ? "border-channel bg-sky-50 text-ink"
                        : "border-slate-100 bg-white text-ink hover:border-slate-200"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-channel bg-channel"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[14px] font-bold">{name}</span>
                      <span className="ml-2 font-urdu text-[14px] text-slate-500">
                        {native}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
