"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Translated, LanguagePill } from "../../components/citizen-translated";
import {
  IconCheck,
  IconChevronLeft,
  IconInfo,
  IconMaximize,
  IconPlayFilled,
  IconSend,
} from "../../components/icons";
import { NeedsSelector } from "./needs-selector";
import { useCitizenLocation } from "../../components/use-citizen-location";

function inferType(needs: string[]): string {
  if (needs.includes("Food")) return "food";
  if (needs.includes("No Clean Water")) return "water";
  return "medical";
}

function inferPriority(needs: string[]): string {
  return needs.includes("Pregnant Woman") || needs.includes("Injury")
    ? "critical"
    : "high";
}

export function SosForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number>(undefined);

  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("1");

  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    camp: string | null;
    distanceKm: number | null;
  } | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const { coords, locState, districtName, locate } = useCitizenLocation();

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleNeed = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const startCamera = async () => {
    setCamError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setElapsed(0);
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setCamError(true);
    }
  };

  const stopCamera = () => {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !coords) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setSendError(false);
    setSending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: name.trim(),
          phone: phone.trim(),
          lat: coords.lat,
          lng: coords.lng,
          district: districtName.split(",")[0],
          needs: selected,
          peopleCount: Math.max(1, Number(people) || 1),
          type: inferType(selected),
          priority: inferPriority(selected),
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      localStorage.setItem("citizen_last_request", data.request.code);
      stopCamera();
      setResult({
        code: data.request.code,
        camp: data.routedToCamp,
        distanceKm: data.distanceToCampKm,
      });
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (result) {
    return (
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">
        <header className="flex items-center gap-3 px-5 pt-1">
          <div className="leading-tight">
            <Translated k="videoSosTitle" as="h1" className="font-display text-[17px] font-bold text-ink" />
            <Translated k="recordSend" as="p" className="text-[11px] font-medium text-slate-500" />
          </div>
          <div className="ml-auto">
            <LanguagePill />
          </div>
        </header>

        <main className="px-5 pb-12 pt-6">
          <div className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <IconCheck className="h-8 w-8" strokeWidth={3} />
            </span>
            <Translated k="sosSent" as="h2" className="mt-4 font-display text-[22px] font-extrabold text-ink" />
            <Translated k="sosSentDesc" as="p" className="mt-1.5 max-w-[280px] text-[12.5px] leading-relaxed text-slate-600" />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <Translated k="requestId" as="p" className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
            <p className="mt-1 font-display text-[18px] font-bold tracking-wide text-ink">{result.code}</p>
            {result.camp && (
              <p className="mt-2 text-[12px] text-slate-600">
                <Translated k="routedTo" />{" "}
                <span className="font-bold text-ink">{result.camp}</span>
                {result.distanceKm != null && (
                  <span className="font-semibold text-slate-500"> · {result.distanceKm} km</span>
                )}
              </p>
            )}
            <Translated k="saveCode" as="p" className="mt-1.5 text-[11px] text-slate-400" />
          </div>

          <Link
            href={`/status?code=${encodeURIComponent(result.code)}`}
            className="mt-5 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-ink text-[15px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
          >
            <IconSend className="h-5 w-5" />
            <Translated k="trackRequest" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setSelected([]);
              setName("");
              setPhone("");
              setPeople("1");
            }}
            className="mt-3 w-full text-center text-[13px] font-semibold text-channel"
          >
            <Translated k="sendAnother" />
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">

      <header className="flex items-center gap-3 px-5 pt-1">
        <Link
          href="/sos"
          aria-label="Back to SOS options"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="leading-tight">
          <Translated k="videoSosTitle" as="h1" className="font-display text-[17px] font-bold text-ink" />
          <Translated k="recordSend" as="p" className="text-[11px] font-medium text-slate-500" />
        </div>
        <div className="ml-auto">
          <LanguagePill />
        </div>
      </header>

      <main className="pb-12">
        <section className="px-5 pt-5">
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl p-3.5 ${
              locState === "locating" ? "bg-sky-50" : "bg-emerald-50"
            }`}
          >
            <div className="leading-tight">
              <p
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  locState === "locating" ? "text-channel" : "text-emerald-600"
                }`}
              >
                <Translated
                  k={
                    locState === "locating"
                      ? "locatingYou"
                      : locState === "gps"
                        ? "locationCaptured"
                        : "locationFallback"
                  }
                />
              </p>
              <p className="mt-1 text-[13px] font-semibold text-ink">
                {districtName || "Pakistan"}
                {coords && (
                  <span className="ml-1.5 text-[11px] font-medium tabular-nums text-slate-500">
                    {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={locate}
              className="shrink-0 text-[12px] font-semibold text-channel"
            >
              <Translated k="retry" />
            </button>
          </div>
        </section>

        <section className="mt-6 px-5">
          <Translated k="recordVideoTitle" as="h2" className="font-display text-[16px] font-bold text-ink" />
          <Translated k="recordVideoDesc2" as="p" className="mt-1 text-[12px] text-slate-500" />

          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src="/images/sos_video_frame.png"
                alt="Recorded video frame showing a flooded rural scene with a house and trees"
                fill
                priority
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
              />
            )}
            <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold tabular-nums text-white shadow">
              {cameraOn ? mmss(elapsed) : "00:28"}
            </span>
            <span className="absolute bottom-2.5 right-2.5 text-white drop-shadow-md">
              <IconMaximize className="h-[18px] w-[18px]" />
            </span>
            {!cameraOn && (
              <button
                type="button"
                aria-label="Play recorded video"
                className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-xl transition active:scale-95"
              >
                <IconPlayFilled className="ml-0.5 h-6 w-6" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={cameraOn ? stopCamera : startCamera}
            className={`mt-3 flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-white shadow-lg transition active:scale-[0.98] ${
              cameraOn ? "bg-red-500 shadow-red-500/20" : "bg-ink shadow-ink/20"
            }`}
          >
            <Translated k={cameraOn ? "stopRecordingBtn" : "recordVideoBtn"} />
          </button>
          <p className="mt-2 text-center text-[11px] font-medium tabular-nums text-slate-400">
            {cameraOn ? `${mmss(elapsed)} / 60:00` : "00:00 / 60:00"}
          </p>
          {camError && (
            <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11.5px] font-medium text-amber-800">
              <Translated k="cameraUnavailable" />
            </p>
          )}
        </section>

        <NeedsSelector selected={selected} onToggle={toggleNeed} />

        <section className="mt-6 px-5">
          <div className="flex flex-col gap-3">
            <label className="block">
              <Translated k="yourName" as="span" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fatima Bibi"
                autoComplete="name"
                className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <Translated k="phoneLabel" as="span" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                autoComplete="tel"
                className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold tabular-nums text-ink outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <Translated k="peopleLabel" as="span" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500" />
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-bold tabular-nums text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 px-5">
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5">
            <IconInfo className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-500" />
            <Translated k="sosNote" as="p" className="text-[12px] leading-[1.5] text-amber-900" />
          </div>

          {(formError || sendError) && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              <Translated k={formError ? "formError" : "sendFailed"} />
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="mt-4 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-ink text-[15px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98] disabled:opacity-60"
          >
            <IconSend className="h-5 w-5" />
            <Translated k={sending ? "sending" : "sendSosBtn"} />
          </button>
          <Translated k="safetyPolicy" as="p" className="mt-2.5 text-center text-[11px] text-slate-400" />
        </section>
      </main>
    </div>
  );
}
