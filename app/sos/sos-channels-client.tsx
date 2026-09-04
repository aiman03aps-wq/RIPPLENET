"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronRight,
  IconKeypad,
  IconPhone,
  IconShieldPin,
  IconVideo,
  IconWhatsApp,
  IconX,
  IconCheck,
  IconSparkles,
  IconMic,
} from "../components/icons";
import { Translated } from "../components/citizen-translated";
import { useCitizenLocation } from "../components/use-citizen-location";

export function SosChannelsClient() {
  const router = useRouter();
  const { coords, districtName } = useCitizenLocation();
  const [ussdOpen, setUssdOpen] = useState(false);
  const [ussdStep, setUssdStep] = useState<"menu" | "people" | "submitting" | "done">("menu");
  const [ussdSelectedNeed, setUssdSelectedNeed] = useState("Medical & Clean Water");
  const [ussdPeople, setUssdPeople] = useState(4);
  const [ussdResultCode, setUssdResultCode] = useState("");

  const handleUssdSubmit = async () => {
    setUssdStep("submitting");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: "USSD Citizen (Keypad *313#)",
          phone: "0300 0003130",
          lat: coords?.lat ?? 33.5651,
          lng: coords?.lng ?? 73.0169,
          district: districtName?.split(",")[0]?.trim() || "Rawalpindi",
          needs: [ussdSelectedNeed, "No Clean Water"],
          peopleCount: ussdPeople,
          type: "water",
          priority: "critical",
        }),
      });
      const data = await res.json();
      if (data.request?.code) {
        localStorage.setItem("citizen_last_request", data.request.code);
        setUssdResultCode(data.request.code);
        setUssdStep("done");
      } else {
        setUssdStep("menu");
      }
    } catch {
      setUssdStep("menu");
    }
  };

  return (
    <>
      <section className="mt-7 flex flex-col gap-3 px-5" aria-label="Ways to send an SOS">
        {/* Video SOS */}
        <Link
          href="/sos/video"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <IconVideo className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="sendSosVideo" as="span" className="font-display text-[15px] font-bold text-ink" />
              <Translated
                k="recommended"
                as="span"
                className="rounded-full bg-sky-100 px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-sky-700"
              />
            </span>
            <Translated k="recordVideoDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </Link>

        {/* In-App Voice Note (Audio SOS - 7 Regional Languages) */}
        <Link
          href="/sos/audio"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <IconMic className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="sendVoiceNote" as="span" className="font-display text-[15px] font-bold text-ink" />
              <span className="rounded-full bg-emerald-100 px-2 py-[3px] text-[9px] font-bold text-emerald-800">
                7 Languages AI
              </span>
            </span>
            <Translated k="voiceNoteDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <span className="mt-1 block text-[11px] font-semibold text-emerald-700">Urdu · Sindhi · Pashto · Punjabi · Balochi · Hindko · English</span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </Link>

        {/* USSD Keypad Simulator */}
        <button
          type="button"
          onClick={() => {
            setUssdOpen(true);
            setUssdStep("menu");
          }}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <IconKeypad className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="ussd" as="span" className="font-display text-[15px] font-bold text-ink" />
              <span className="rounded-full bg-orange-100 px-2 py-[3px] text-[9px] font-bold text-orange-700">
                Dial *313#
              </span>
            </span>
            <Translated k="ussdDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <Translated k="noInternet" as="span" className="mt-1 block text-[11px] font-medium text-slate-400" />
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </button>

        {/* Toll-Free Hotline */}
        <a
          href="tel:0800444488"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <IconPhone className="h-[22px] w-[22px]" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <Translated k="callForHelp" as="span" className="font-display text-[15px] font-bold text-ink" />
            <Translated k="callDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <span className="mt-1 block text-[12.5px] font-semibold text-violet-600">0800 44 44 88</span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </a>
      </section>

      {/* USSD Keypad Interactive Dialog */}
      {ussdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[380px] rounded-3xl bg-slate-900 p-5 text-white shadow-2xl ring-1 ring-slate-700">
            {/* USSD Screen Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="font-mono text-[12px] font-bold text-emerald-400">USSD *313# (Alkhidmat SOS)</p>
              </div>
              <button
                type="button"
                onClick={() => setUssdOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Step: Menu */}
            {ussdStep === "menu" && (
              <div className="mt-4 space-y-3 font-mono text-[13px]">
                <p className="text-slate-300">Select Emergency Help needed:</p>
                <div className="space-y-1.5">
                  {[
                    { key: "1", label: "1. Medical & Water (Diarrhea/Fever)" },
                    { key: "2", label: "2. Clean Drinking Water" },
                    { key: "3", label: "3. Food Ration Pack" },
                    { key: "4", label: "4. Emergency Boat Rescue / Evac" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setUssdSelectedNeed(label);
                        setUssdStep("people");
                      }}
                      className="w-full rounded-xl bg-slate-800/80 p-2.5 text-left text-cyan-300 hover:bg-slate-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: People count */}
            {ussdStep === "people" && (
              <div className="mt-4 space-y-3 font-mono text-[13px]">
                <p className="text-slate-300">How many people need relief?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setUssdPeople(n)}
                      className={`rounded-xl py-2.5 text-center font-bold ${
                        ussdPeople === n ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUssdSubmit}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Send USSD Distress Signal
                </button>
              </div>
            )}

            {/* Step: Submitting */}
            {ussdStep === "submitting" && (
              <div className="mt-6 py-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                <p className="mt-3 font-mono text-[12.5px] text-slate-300">
                  Transmitting USSD packet to nearest base camp...
                </p>
              </div>
            )}

            {/* Step: Done */}
            {ussdStep === "done" && (
              <div className="mt-4 text-center font-mono space-y-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <IconCheck className="h-6 w-6" strokeWidth={3} />
                </span>
                <p className="font-bold text-[14px] text-emerald-400">Distress Signal Received!</p>
                <p className="text-[11.5px] text-slate-300">
                  Your SOS Code: <span className="font-bold text-white">{ussdResultCode}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Tower location triangulated. 5 AI Agents routed request to nearest camp.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUssdOpen(false);
                      const dist = districtName?.split(",")[0]?.trim() || "Rawalpindi";
                      const la = coords?.lat ?? 33.5651;
                      const ln = coords?.lng ?? 73.0169;
                      router.push(`/status?code=${encodeURIComponent(ussdResultCode)}&district=${encodeURIComponent(dist)}&lat=${la}&lng=${ln}`);
                    }}
                    className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-[12px] font-bold text-slate-950"
                  >
                    Track Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setUssdOpen(false)}
                    className="flex-1 rounded-xl bg-slate-800 py-2.5 text-[12px] font-bold text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
