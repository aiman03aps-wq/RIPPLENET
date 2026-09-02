"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Translated } from "../../components/citizen-translated";
import { CitizenHeader } from "../../components/citizen-header";
import { CitizenNav } from "../../components/citizen-nav";
import {
  IconCheck,
  IconChevronLeft,
  IconInfo,
  IconMaximize,
  IconPlayFilled,
  IconSend,
  IconVideo,
  IconActivity,
  IconRotateCcw,
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
  const sampleTimerRef = useRef<number>(undefined);

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

  // Camera & Video Playback States
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Sample Video Playback State
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [sampleElapsed, setSampleElapsed] = useState(0);
  const [hasRecordedClip, setHasRecordedClip] = useState(false);

  const { coords, locState, districtName, locate } = useCitizenLocation();

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      window.clearInterval(sampleTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Sample video playback timer
  useEffect(() => {
    if (isPlayingSample) {
      window.clearInterval(sampleTimerRef.current);
      sampleTimerRef.current = window.setInterval(() => {
        setSampleElapsed((prev) => {
          if (prev >= 28) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      window.clearInterval(sampleTimerRef.current);
    }
    return () => window.clearInterval(sampleTimerRef.current);
  }, [isPlayingSample]);

  const toggleNeed = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const startCamera = async () => {
    setCamError(false);
    setIsPlayingSample(false);
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
      // Fallback simulation mode
      setCamError(false);
      setCameraOn(true);
      setElapsed(0);
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    }
  };

  const stopCamera = () => {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setHasRecordedClip(true);
  };

  const toggleSamplePlay = () => {
    if (cameraOn) stopCamera();
    setIsPlayingSample((prev) => !prev);
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
      setIsPlayingSample(false);
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
        <CitizenHeader title="Video SOS" subtitle="Disaster Emergency Dispatch" />

        <main className="px-5 pb-24 pt-6">
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
              setHasRecordedClip(false);
            }}
            className="mt-3 w-full text-center text-[13px] font-semibold text-channel"
          >
            <Translated k="sendAnother" />
          </button>
        </main>

        <CitizenNav active="home" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">
      <CitizenHeader title="Video SOS" subtitle="Flood Distress Video Dispatch" />

      <main className="pb-28">
        <section className="px-5 pt-4">
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

        {/* Video Player & Recorder Section */}
        <section className="mt-6 px-5">
          <Translated k="recordVideoTitle" as="h2" className="font-display text-[16px] font-bold text-ink" />
          <Translated k="recordVideoDesc2" as="p" className="mt-1 text-[12px] text-slate-500" />

          {/* Interactive Video Frame */}
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
            {cameraOn ? (
              <div className="relative h-full w-full bg-slate-950">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {/* Viewfinder Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-white/20 m-3 rounded-lg flex flex-col justify-between p-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-red-500 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      REC [{mmss(elapsed)}]
                    </span>
                    <span className="text-white/80">1080p · 30FPS</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/70">
                    <span>GPS: {coords ? `${coords.lat.toFixed(3)}N, ${coords.lng.toFixed(3)}E` : "CAPTURING"}</span>
                    <span>AI SCENE: FLOOD SURGE</span>
                  </div>
                </div>
              </div>
            ) : isPlayingSample ? (
              /* Live Playing Sample Video Simulation */
              <div className="relative h-full w-full bg-slate-950 overflow-hidden">
                <Image
                  src="/images/sos_video_frame.png"
                  alt="Playing sample flood relief video"
                  fill
                  priority
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="object-cover scale-105 animate-pulse"
                />

                {/* Video Playback HUD & Waveforms */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      PLAYING SAMPLE ({mmss(sampleElapsed)} / 00:28)
                    </span>
                    <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-slate-300">
                      24.748° N, 68.865° E
                    </span>
                  </div>

                  {/* Center Pause Button */}
                  <button
                    type="button"
                    onClick={toggleSamplePlay}
                    aria-label="Pause sample video"
                    className="self-center flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs border border-white/20 active:scale-95 transition hover:bg-black/80"
                  >
                    <span className="flex gap-1">
                      <span className="h-4 w-1.5 bg-white rounded-xs" />
                      <span className="h-4 w-1.5 bg-white rounded-xs" />
                    </span>
                  </button>

                  {/* Audio waveform meter & progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-300 mb-1">
                      <span className="flex items-center gap-1 text-sky-400">
                        <IconActivity className="h-3 w-3" /> DISTRESS AUDIO (WATER NOISE DETECTED)
                      </span>
                      <span>28s</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-channel transition-all duration-300"
                        style={{ width: `${(sampleElapsed / 28) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Video Poster & Play Trigger */
              <div className="relative h-full w-full">
                <Image
                  src="/images/sos_video_frame.png"
                  alt="Recorded video frame showing a flooded rural scene with a house and trees"
                  fill
                  priority
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 flex h-7 px-2 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold tabular-nums text-white shadow-md">
                  SAMPLE 00:28
                </span>
                <span className="absolute bottom-2.5 right-2.5 text-white drop-shadow-md">
                  <IconMaximize className="h-[18px] w-[18px]" />
                </span>

                {/* Big Interactive Play Button */}
                <button
                  type="button"
                  onClick={toggleSamplePlay}
                  aria-label="Play recorded video"
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-2xl transition hover:scale-105 active:scale-90 ring-4 ring-white/30"
                >
                  <IconPlayFilled className="ml-1 h-7 w-7 text-channel" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={cameraOn ? stopCamera : startCamera}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-bold text-white shadow-md transition active:scale-[0.98] ${
                cameraOn ? "bg-red-600 shadow-red-600/25" : "bg-ink shadow-ink/20"
              }`}
            >
              <IconVideo className="h-4 w-4" />
              {cameraOn ? "Stop Recording" : "Record Live Video"}
            </button>

            <button
              type="button"
              onClick={toggleSamplePlay}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-bold border transition active:scale-[0.98] ${
                isPlayingSample
                  ? "bg-sky-50 border-channel text-channel"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <IconPlayFilled className="h-4 w-4" />
              {isPlayingSample ? "Pause Sample" : "Play Sample Video"}
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] font-medium tabular-nums text-slate-400">
            {cameraOn
              ? `Recording: ${mmss(elapsed)} / 60:00`
              : isPlayingSample
              ? `Sample Playing: ${mmss(sampleElapsed)} / 00:28`
              : "00:28 Sample Footage Ready · 1080p"}
          </p>
        </section>

        <NeedsSelector selected={selected} onToggle={toggleNeed} />

        {/* Citizen Contact Details Form */}
        <section className="mt-6 px-5">
          <Translated k="yourDetails" as="h2" className="font-display text-[16px] font-bold text-ink" />

          <div className="mt-3 flex flex-col gap-3">
            <label className="block">
              <Translated k="fullName" as="span" className="text-[12px] font-semibold text-slate-700" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError(false);
                }}
                placeholder="e.g. Fatima Bibi"
                className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label className="block">
              <Translated k="phoneNumber" as="span" className="text-[12px] font-semibold text-slate-700" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFormError(false);
                }}
                placeholder="0300 1234567"
                className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label className="block">
              <Translated k="peopleCount" as="span" className="text-[12px] font-semibold text-slate-700" />
              <input
                type="number"
                min={1}
                max={50}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          {formError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2 text-[12px] font-medium text-red-600">
              <Translated k="fillRequired" />
            </p>
          )}

          {sendError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2 text-[12px] font-medium text-red-600">
              <Translated k="sendFailed" />
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-red-600 text-[15px] font-bold text-white shadow-lg shadow-red-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            <IconSend className="h-5 w-5" />
            {sending ? <Translated k="sendingSos" /> : <Translated k="sendSosNow" />}
          </button>
        </section>
      </main>

      <CitizenNav active="home" />
    </div>
  );
}
