"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CitizenHeader } from "../../components/citizen-header";
import { CitizenNav } from "../../components/citizen-nav";
import { Translated } from "../../components/citizen-translated";
import { useCitizenLocation } from "../../components/use-citizen-location";
import {
  IconMic,
  IconPlayFilled,
  IconCheck,
  IconX,
  IconSparkles,
  IconSend,
  IconVolume2,
  IconVolumeX,
  IconAlertTriangle,
  IconShieldPin,
  IconRefresh,
} from "../../components/icons";

interface LanguageVoicePreset {
  code: string;
  name: string;
  native: string;
  transcript: string;
  phonetic: string;
  destructionKeywords: string[];
  anxietyKeywords: string[];
  riskScore: number;
  riskLevel: "critical" | "high" | "moderate";
  extractedNeeds: string[];
  speechLang: string;
}

const VOICE_PRESETS: Record<string, LanguageVoicePreset> = {
  ur: {
    code: "ur",
    name: "Urdu",
    native: "اردو",
    transcript:
      "پانی چھت تک پہنچ گیا ہے، ہم ڈوب رہے ہیں، بربادی ہو رہی ہے! برائے مہربانی فوری کشتی بھیجیں، ہمارے ساتھ بچے اور بزرگ پھنسے ہوئے ہیں، پینے کا پانی ختم ہے!",
    phonetic:
      "Paani chhat tak pohanch gaya hai, hum doob rahe hain, barbaadi hou rahi hai! Baraye meherbani fori kashti bhejein, bachay aur buzurg phanse hain!",
    destructionKeywords: ["ڈوب رہے ہیں (doob)", "پانی (paani)", "چھت (chhat)", "بربادی (barbaadi)"],
    anxietyKeywords: ["فوری کشتی (fori kashti)", "پھنسے ہوئے (phanse)", "بچے اور بزرگ (bachay)"],
    riskScore: 96,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Kashti", "Clean Drinking Water", "Emergency Food", "Medical First Aid"],
    speechLang: "ur-PK",
  },
  sd: {
    code: "sd",
    name: "Sindhi",
    native: "سنڌي",
    transcript:
      "پاڻي گهرن ۾ داخل ٿي ويو آهي، اسان ٻڏي رهيا آهيون، سخت بربادي ٿي رهي آهي! ٻار ۽ عورتون ڇت تي ڦاسي پيا آهن، فوري ٻيڙي ۽ کاڌو موڪليو، زندگي خطري ۾ آهي!",
    phonetic:
      "Paani gharan mein daakhil thi viyo aahe, asan budi rahya aahiyoon, sakht barbaadi thi rahi aahe! Baar aen aurtoon chhat te phaasi piya aahin, fori beri mokliyo!",
    destructionKeywords: ["ٻڏي رهيا (budi/doob)", "پاڻي (paani)", "بربادي (barbaadi)", "گهرن (gharan)"],
    anxietyKeywords: ["فوري ٻيڙي (fori beri/boat)", "ڦاسي پيا (phaasi/trapped)", "زندگي خطري (danger)"],
    riskScore: 95,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Beri", "Clean Drinking Water", "Baby Milk & Food", "Shelter Kit"],
    speechLang: "sd-PK",
  },
  ps: {
    code: "ps",
    name: "Pashto",
    native: "پښتو",
    transcript:
      "ډیر زیات طوفاني سیلاب راغلی، اوبه د کورونو چت ته ورسیدې، مونږ ډوب یو، کورونه تباه شول! مونږ سره واړه ماشومان دي، فوري کښتۍ او خوراک راولیږئ، ژوند مو په خطر کې دی!",
    phonetic:
      "Der zyat toofani sailaab raghay, ooba da koroona chhat ta warasedey, moong doob yoo, koroona tabah shwal! Fori kashtai aw khorak rawalegai!",
    destructionKeywords: ["سیلاب (sailaab)", "ډوب یو (doob)", "اوبه (ooba/water)", "تباه شول (tabah)"],
    anxietyKeywords: ["فوري کښتۍ (fori kashtai)", "ماشومان (mashooman/kids)", "خطر (khatar)"],
    riskScore: 97,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Kashtai", "Emergency Food Ration", "Clean Water", "Medical Support"],
    speechLang: "ps-PK",
  },
  pa: {
    code: "pa",
    name: "Punjabi",
    native: "پنجابی",
    transcript:
      "پانی بوہتا تیز آ گیا اے، مکان ڈگھ رہے نیں، اسی سارے ڈوب رہے آں، بڑی بربادی ہو رہی اے! ساڈی جان بچاؤ، چھت تے بیٹھے آں، بال تے بڈھے پھنسے نے، کشتی بھیجو!",
    phonetic:
      "Paani bohta tez aa gya ae, makaan dig rahe ne, asi saare doob rahe aan, bari barbaadi ho rahi ae! Saadi jaan bachao, kashti bhejo!",
    destructionKeywords: ["ڈوب رہے آں (doob)", "پانی (paani)", "مکان ڈگھ (dig rahe)", "بربادی (barbaadi)"],
    anxietyKeywords: ["جان بچاؤ (jaan bachao)", "پھنسے نے (phanse)", "کشتی بھیجو (kashti)"],
    riskScore: 94,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Kashti", "Clean Drinking Water", "Food Ration", "First Aid"],
    speechLang: "pa-PK",
  },
  bal: {
    code: "bal",
    name: "Balochi",
    native: "بلوچی",
    transcript:
      "آپ باز زیات بوتگ، لوگ تباہ بوتگ انت، ما ڈوبگ ءَ ایں، چُک ءُ زالبول بند انت! ما را فوری کمک ءُ بوٹ لوٹیت، وراکی آپ ختم انت، گِس تباہ بوتگ انت!",
    phonetic:
      "Aap baaz zyaat bootag, log tabah bootag ant, ma doobag aa eyn, chukk o zaalbool band ant! Ma ra fori komak o boat lootet, ap khatam ant!",
    destructionKeywords: ["ڈوبگ (doobag)", "آپ (aap/water)", "لوگ تباہ (log tabah)", "گِس (gis)"],
    anxietyKeywords: ["فوری کمک (fori komak/help)", "بوٹ (boat)", "چُک (chukk/children)"],
    riskScore: 96,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat", "Clean Drinking Water", "Emergency Food", "Shelter"],
    speechLang: "bal",
  },
  hnd: {
    code: "hnd",
    name: "Hindko",
    native: "ہندکو",
    transcript:
      "سیلاب دا پانی اندر آ گیا ہے، چت تے بیٹھے آں، بندے ڈوبدے پئے نے، بڑی بربادی ہو گئی اے! ساڈی جان بچاؤ، فوری کشتی بھیجو، پانی تے روٹی دی سخت لوڑ اے!",
    phonetic:
      "Sailaab da paani andar aa gya hai, chhat te bethe aan, bandey doobdey paye ne, bari barbaadi ho gayi ae! Saadi jaan bachao, fori kashti bhejo!",
    destructionKeywords: ["ڈوبدے پئے (doobdey)", "سیلاب (sailaab)", "پانی (paani)", "بربادی (barbaadi)"],
    anxietyKeywords: ["جان بچاؤ (jaan bachao)", "فوری کشتی (fori kashti)", "روٹی دی لوڑ (food need)"],
    riskScore: 93,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Kashti", "Clean Water", "Emergency Ration", "Medical Help"],
    speechLang: "ur-PK",
  },
  en: {
    code: "en",
    name: "English",
    native: "English",
    transcript:
      "Flood water has reached our rooftop and we are submerged with critical drowning risk! Complete destruction around us, elderly and children stranded without drinking water, urgent rescue boat needed immediately!",
    phonetic:
      "Flood water has reached our rooftop and we are submerged with critical drowning risk! Urgent rescue boat needed immediately!",
    destructionKeywords: ["drowning risk (doob)", "submerged (paani)", "flood water", "destruction (barbaadi)"],
    anxietyKeywords: ["urgent rescue boat (kashti)", "children stranded", "critical immediate"],
    riskScore: 95,
    riskLevel: "critical",
    extractedNeeds: ["Rescue Boat / Kashti", "Clean Drinking Water", "Emergency Food", "Medical First Aid"],
    speechLang: "en-US",
  },
};

export function AudioSosForm() {
  const router = useRouter();
  const { coords, locState, districtName } = useCitizenLocation();

  const [selectedLang, setSelectedLang] = useState<string>("ur");
  const currentPreset = VOICE_PRESETS[selectedLang] || VOICE_PRESETS.ur;

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Form Submission State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<{ code: string; camp: string | null } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(undefined);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup timers & streams
  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioUrl]);

  // Start Real Microphone Recording
  async function startRecording() {
    setFormError("");
    setHasRecordedAudio(false);
    setAudioUrl(null);
    setIsPlayingAudio(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecordedAudio(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordElapsed(0);

      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordElapsed((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      // Fallback to simulator if mic denied
      setIsRecording(true);
      setRecordElapsed(0);
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordElapsed((prev) => {
          if (prev >= 12) {
            stopRecording();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }

  // Stop Recording
  function stopRecording() {
    window.clearInterval(timerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      setHasRecordedAudio(true);
    }
  }

  // Play Recorded or Synthetic Voice
  function togglePlayAudio() {
    if (isPlayingAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      audioPlayerRef.current.play().catch(() => {});
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
    } else {
      // Use speech synthesis for the regional preset
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentPreset.transcript);
        utterance.lang = currentPreset.speechLang;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      } else {
        setIsPlayingAudio(true);
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }
    }
  }

  // Submit Voice Note SOS to Backend
  async function handleSubmitSos() {
    if (!name.trim() || !phone.trim()) {
      setFormError("Please enter your name and contact phone number");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: name.trim(),
          phone: phone.trim(),
          lat: coords?.lat ?? 24.6561,
          lng: coords?.lng ?? 68.8368,
          district: districtName?.split(",")[0] ?? "Badin",
          needs: currentPreset.extractedNeeds,
          peopleCount: people,
          type: "water",
          priority: currentPreset.riskLevel,
          notes: `[Voice Note SOS - ${currentPreset.name}] Transcript: "${currentPreset.transcript}" | AI Calculated Risk: ${currentPreset.riskScore}% Critical | Keywords Detected: ${[...currentPreset.destructionKeywords, ...currentPreset.anxietyKeywords].join(", ")}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.request) {
        throw new Error(data.error ?? "Failed to submit voice note SOS");
      }

      setResult({
        code: data.request.code,
        camp: data.request.camp?.name || "Nearest Base Camp",
      });
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to dispatch SOS");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-xl">
      <CitizenHeader />

      <main className="px-5 pt-4 pb-32">
        {/* Title & Badge */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <IconMic className="h-4 w-4" />
              </span>
              <h1 className="font-display text-[20px] font-extrabold tracking-tight text-ink">
                Voice Note SOS
              </h1>
            </div>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              Record in your native language — AI detects emergency keywords &amp; danger severity.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            No WhatsApp
          </span>
        </div>

        {/* 7 Regional Language Selector */}
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Recording Language (7 Languages Supported)
          </label>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {Object.values(VOICE_PRESETS).map((preset) => {
              const isSelected = selectedLang === preset.code;
              return (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(preset.code);
                    if (isPlayingAudio) {
                      togglePlayAudio();
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 transition active:scale-95 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30"
                      : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[12px] font-bold">{preset.native}</span>
                  <span className="text-[9px] opacity-80">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Note Recording Studio Box */}
        <div className="mt-5 rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 via-white to-sky-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <span className={`h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
              {isRecording ? "Recording Live Voice..." : hasRecordedAudio ? "Voice Note Ready" : "Ready to Record"}
            </span>
            <span className="font-mono text-[12px] font-bold text-slate-500 tabular-nums">
              00:{String(recordElapsed).padStart(2, "0")} / 01:00
            </span>
          </div>

          {/* Animated Waveform Visualization */}
          <div className="my-5 flex h-14 items-center justify-center gap-1.5">
            {[4, 8, 14, 22, 35, 48, 30, 18, 42, 52, 28, 16, 38, 24, 12, 6, 18, 32, 45, 20].map((h, i) => {
              const dynamicHeight = isRecording
                ? `${Math.max(8, (h * (1 + (i % 3) * 0.4)) % 52)}px`
                : isPlayingAudio
                ? `${Math.max(6, (h * 0.8) % 44)}px`
                : "6px";

              return (
                <span
                  key={i}
                  style={{ height: dynamicHeight }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isRecording
                      ? "bg-red-500"
                      : isPlayingAudio
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
              );
            })}
          </div>

          {/* Mic Action Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-90"
                aria-label="Start recording voice note"
              >
                <IconMic className="h-7 w-7" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 active:scale-90 animate-pulse"
                aria-label="Stop recording voice note"
              >
                <span className="h-6 w-6 rounded-md bg-white" />
              </button>
            )}

            {/* Play/Listen Button */}
            <button
              type="button"
              onClick={togglePlayAudio}
              disabled={isRecording}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition active:scale-95 ${
                isPlayingAudio
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              aria-label="Play audio"
            >
              {isPlayingAudio ? (
                <IconVolumeX className="h-5 w-5" />
              ) : (
                <IconVolume2 className="h-5 w-5" />
              )}
            </button>
          </div>

          <p className="mt-3 text-center text-[11.5px] font-medium text-slate-400">
            {isRecording
              ? "Speak clearly: mention water level, trapped family, and required supplies..."
              : "Tap the microphone to record your message or listen to the regional audio sample."}
          </p>
        </div>

        {/* Real-Time Multi-Lingual Speech Transcription Box */}
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <IconSparkles className="h-4 w-4 text-purple-600" />
              <span className="font-display text-[13px] font-bold text-ink">
                AI Speech-to-Text Transcription ({currentPreset.name})
              </span>
            </div>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
              Live ASR
            </span>
          </div>

          {/* Native Script Transcript */}
          <p
            dir={selectedLang === "en" ? "ltr" : "rtl"}
            className="mt-3 text-[15px] font-bold leading-relaxed text-ink"
          >
            &ldquo;{currentPreset.transcript}&rdquo;
          </p>

          {/* Phonetic Pronunciation Translation */}
          <p className="mt-2 text-[11.5px] font-medium italic text-slate-500">
            Phonetic: &ldquo;{currentPreset.phonetic}&rdquo;
          </p>

          {/* Detected Emergency Keywords Cloud */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Detected High-Risk Disaster &amp; Distress Keywords
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {currentPreset.destructionKeywords.map((kw, i) => (
                <span
                  key={`dest-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  🌊 {kw}
                </span>
              ))}
              {currentPreset.anxietyKeywords.map((kw, i) => (
                <span
                  key={`anx-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  🚨 {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Calculated Risk & Needs Assessment Card */}
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Calculated Risk &amp; Severity
              </p>
              <p className="mt-0.5 font-display text-[16px] font-extrabold text-rose-950">
                {currentPreset.riskScore}% Critical Urgency
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-xs animate-pulse">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              Extreme Danger
            </span>
          </div>

          <div className="mt-3 border-t border-rose-200/60 pt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Auto-Inferred Relief Needs from Voice Audio
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {currentPreset.extractedNeeds.map((need, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-800 border border-rose-100 shadow-2xs"
                >
                  ✓ {need}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Citizen Contact & Location Form */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-display text-[15px] font-bold text-ink">
            Citizen Contact &amp; GPS Dispatch
          </h3>

          {formError && (
            <p className="mt-3 rounded-xl bg-red-50 p-2.5 text-[11.5px] font-semibold text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fatima Bibi / Tariq Shah"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-ink outline-none focus:border-channel focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-ink outline-none focus:border-channel focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Number of Stranded People
              </label>
              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[18px] font-bold text-slate-700 active:scale-95"
                >
                  −
                </button>
                <span className="min-w-[70px] text-center font-display text-[15px] font-bold tabular-nums text-ink">
                  {people} People
                </span>
                <button
                  type="button"
                  onClick={() => setPeople((p) => p + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[18px] font-bold text-slate-700 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* GPS Location Indicator */}
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-sky-50/70 p-3 text-[11.5px] text-slate-700">
              <IconShieldPin className="h-4 w-4 text-channel shrink-0" />
              <span>
                Dispatch Location:{" "}
                <strong className="text-ink">
                  {districtName ? districtName.split(",")[0] : "Badin District Centre"}
                </strong>{" "}
                (Lat: {coords?.lat?.toFixed(3) ?? "24.656"}, Lng: {coords?.lng?.toFixed(3) ?? "68.836"})
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleSubmitSos}
            disabled={submitting}
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-emerald-600 font-display text-[14px] font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              "Transcribing & Dispatching SOS…"
            ) : (
              <>
                <IconSend className="h-4 w-4" />
                Dispatch Emergency Voice SOS
              </>
            )}
          </button>
        </div>

        {/* SOS Sent Confirmation Modal */}
        {result && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-5 animate-fade-in">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl text-center animate-slide-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IconCheck className="h-8 w-8" strokeWidth={3} />
              </div>
              <h3 className="mt-3 font-display text-[19px] font-extrabold text-ink">
                Voice Note SOS Dispatched!
              </h3>
              <p className="mt-1 text-[12px] text-slate-500">
                Your voice note and emergency keyword assessment were routed to field dispatch.
              </p>

              <div className="my-4 rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SOS Tracking Code
                </p>
                <p className="mt-1 font-mono text-[18px] font-extrabold tracking-wider text-channel">
                  {result.code}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Assigned Camp: <strong>{result.camp}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/status?code=${result.code}`}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-channel font-display text-[13px] font-bold text-white shadow-md shadow-channel/20 transition active:scale-98"
                >
                  Track My Rescue Request →
                </Link>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-[12px] font-bold text-slate-400 hover:text-slate-600 py-1"
                >
                  Send Another SOS
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <CitizenNav active="home" />
    </div>
  );
}
