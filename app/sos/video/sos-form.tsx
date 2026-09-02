"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Translated } from "../../components/citizen-translated";
import { CitizenHeader } from "../../components/citizen-header";
import { CitizenNav } from "../../components/citizen-nav";
import {
  IconCheck,
  IconMaximize,
  IconPlayFilled,
  IconSend,
  IconVolume2,
  IconVolumeX,
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioNode | null>(null);

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

  // Real Camera Recording State
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Sample Video Playback State (Steady, Non-Blinking)
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [sampleElapsed, setSampleElapsed] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);

  const { coords, locState, districtName, locate } = useCitizenLocation();

  // Multi-layered Rushing Flood Water Ambient Sound Generator
  async function startFloodAudio() {
    try {
      if (audioMuted) return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      stopFloodAudio();

      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Turbulent brownian noise + high frequency splash
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.6 + white * 0.28;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter 1: Resonant water body peak
      const peaking = ctx.createBiquadFilter();
      peaking.type = "peaking";
      peaking.frequency.setValueAtTime(360, ctx.currentTime);
      peaking.gain.setValueAtTime(7, ctx.currentTime);
      peaking.Q.setValueAtTime(1.8, ctx.currentTime);

      // Filter 2: Low-pass rushing surge
      const lowPass = ctx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.setValueAtTime(750, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, ctx.currentTime);

      noiseSource.connect(peaking);
      peaking.connect(lowPass);
      lowPass.connect(masterGain);
      masterGain.connect(ctx.destination);

      noiseSource.start();
      audioSourceRef.current = noiseSource;
    } catch {
      // Audio autoplay permission fallback
    }
  }

  function stopFloodAudio() {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        audioSourceRef.current = null;
      }
    } catch {}
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      window.clearInterval(sampleTimerRef.current);
      stopFloodAudio();
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
      stopFloodAudio();
      window.clearInterval(sampleTimerRef.current);
    }
    return () => {
      stopFloodAudio();
      window.clearInterval(sampleTimerRef.current);
    };
  }, [isPlayingSample, audioMuted]);

  const toggleNeed = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  // Real Camera Recording Start (Direct device camera)
  const startCamera = async () => {
    setCamError(false);
    setIsPlayingSample(false);
    stopFloodAudio();
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

  const toggleSamplePlay = async () => {
    if (cameraOn) stopCamera();
    const willPlay = !isPlayingSample;
    setIsPlayingSample(willPlay);
    if (willPlay && !audioMuted) {
      await startFloodAudio();
    } else {
      stopFloodAudio();
    }
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
      stopFloodAudio();
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

        {/* Video Player & Camera Section */}
        <section className="mt-6 px-5">
          <Translated k="recordVideoTitle" as="h2" className="font-display text-[16px] font-bold text-ink" />
          <Translated k="recordVideoDesc2" as="p" className="mt-1 text-[12px] text-slate-500" />

          {/* Video Viewport */}
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : isPlayingSample ? (
              /* Steady, Crisp Sample Video Playback with Sound */
              <div className="relative h-full w-full bg-slate-950">
                <Image
                  src="/images/sos_video_frame.png"
                  alt="Sample flood emergency video"
                  fill
                  priority
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/50 flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-bold">
                      Playing Sample
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !audioMuted;
                        setAudioMuted(next);
                        if (next) stopFloodAudio();
                        else startFloodAudio();
                      }}
                      aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                    >
                      {audioMuted ? <IconVolumeX className="h-3.5 w-3.5" /> : <IconVolume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Play/Pause center toggle */}
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

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-200 mb-1">
                      <span>Flood Audio Active</span>
                      <span>{mmss(sampleElapsed)} / 00:28</span>
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
              /* Default Static Frame */
              <div className="relative h-full w-full">
                <Image
                  src="/images/sos_video_frame.png"
                  alt="Recorded video frame showing a flooded rural scene with a house and trees"
                  fill
                  priority
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={toggleSamplePlay}
                  aria-label="Play sample video"
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-2xl transition hover:scale-105 active:scale-90"
                >
                  <IconPlayFilled className="ml-0.5 h-6 w-6 text-channel" />
                </button>
              </div>
            )}

            <span className="absolute left-2.5 top-2.5 flex h-8 min-w-[32px] px-2 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold tabular-nums text-white shadow">
              {cameraOn ? mmss(elapsed) : "00:28"}
            </span>
            <span className="absolute bottom-2.5 right-2.5 text-white drop-shadow-md">
              <IconMaximize className="h-[18px] w-[18px]" />
            </span>
          </div>

          {/* Clean Camera Recording Button (Original Simple Workflow) */}
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
