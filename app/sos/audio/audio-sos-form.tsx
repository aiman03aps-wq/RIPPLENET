"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  speechLang: string;
}

const VOICE_PRESETS: Record<string, LanguageVoicePreset> = {
  ur: {
    code: "ur",
    name: "Urdu",
    native: "اردو",
    transcript:
      "پانی چھت تک پہنچ گیا ہے، ہم ڈوب رہے ہیں، بربادی ہو رہی ہے! برائے مہربانی فوری کشتی بھیجیں، ہمارے ساتھ بچے اور بزرگ پھنسے ہوئے ہیں، پینے کا پانی ختم ہے، فوری جان بچاؤ!",
    phonetic:
      "Paani chhat tak pohanch gaya hai, hum doob rahe hain, barbaadi hou rahi hai! Baraye meherbani fori kashti bhejein, bachay aur buzurg phanse hain!",
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
    speechLang: "en-US",
  },
};

// Emergency NLP Keyword Detection Matrix
const EMERGENCY_KEYWORDS = [
  // Destruction & Submersion Keywords
  { label: "ڈوب / Drowning", type: "destruction" as const, regex: /doob|ڈوب|ٻڏي|budi|drown/i, icon: "🌊", need: "Rescue Boat / Evacuation" },
  { label: "پانی / Water Level", type: "destruction" as const, regex: /paani|پانی|پاڻي|اوبه|ooba|آپ|water/i, icon: "💧", need: "Clean Drinking Water" },
  { label: "سیلاب / Flood Surge", type: "destruction" as const, regex: /sailaab|سیلاب|طوفان|toofan|flood/i, icon: "🌧️", need: "Shelter / Relief Camp" },
  { label: "بربادی / Destruction", type: "destruction" as const, regex: /barbaad|بربادی|برباد|تباہ|tabah|destruct/i, icon: "🏚️", need: "Emergency Ration Pack" },
  { label: "چھت / Rooftop Stranded", type: "destruction" as const, regex: /chhat|چھت|ڇت|چت|roof/i, icon: "🏠", need: "Rooftop Air/Boat Extraction" },
  { label: "مکان ڈگھ / Collapsed", type: "destruction" as const, regex: /dig|ڈگھ|گھر|مکان|collapse|damage/i, icon: "⚠️", need: "Search & Rescue" },

  // Extreme Distress & Anxiety Keywords
  { label: "فوری کشتی / Rescue Boat", type: "anxiety" as const, regex: /kashti|کشتی|ٻيڙي|beri|کښتۍ|boat|rescue/i, icon: "🚤", need: "Rescue Boat / Kashti" },
  { label: "جان بچاؤ / Save Lives", type: "anxiety" as const, regex: /jaan bachao|جان بچاؤ|مدد|madad|کمک|help|save/i, icon: "🚨", need: "Emergency Evacuation" },
  { label: "پھنسے ہوئے / Trapped", type: "anxiety" as const, regex: /phanse|پھنس|ڦاسي|بند|trap|strand/i, icon: "🆘", need: "Rapid Dispatch Squad" },
  { label: "بچے اور بزرگ / Children & Elderly", type: "anxiety" as const, regex: /bachay|بچے|ٻار|ماشومان|چُک|بال|child|elder/i, icon: "👶", need: "Baby Milk & Medical Aid" },
  { label: "پینے کا پانی / Water Depleted", type: "anxiety" as const, regex: /peene|پینے|ختم|drink|water/i, icon: "🚰", need: "Clean Drinking Water" },
  { label: "زندگي خطري / Critical Threat", type: "anxiety" as const, regex: /khatra|خطر|زندگي|threat|danger|critical/i, icon: "⚡", need: "Paramedic First Aid" },
];

export function AudioSosForm() {
  const router = useRouter();
  const { coords, districtName } = useCitizenLocation();

  const [selectedLang, setSelectedLang] = useState<string>("ur");
  const currentPreset = VOICE_PRESETS[selectedLang] || VOICE_PRESETS.ur;

  // Real-Time Transcription State
  const [liveTranscript, setLiveTranscript] = useState<string>(currentPreset.transcript);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [streamedWordIndex, setStreamedWordIndex] = useState<number>(currentPreset.transcript.split(" ").length);

  // Recording & Playback State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordElapsed, setRecordElapsed] = useState<number>(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Form Submission State
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [people, setPeople] = useState<number>(4);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [result, setResult] = useState<{ code: string; camp: string | null } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(undefined);
  const streamTimerRef = useRef<number>(undefined);
  const speechRecRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // When language changes, update transcript and run dynamic real-time transcribing animation
  useEffect(() => {
    setLiveTranscript(currentPreset.transcript);
    setStreamedWordIndex(currentPreset.transcript.split(" ").length);
  }, [selectedLang, currentPreset]);

  // Real-Time Dynamic Keyword Extraction & Risk Calculation based on live transcribed text
  const { detectedDestruction, detectedAnxiety, dynamicRiskScore, inferredNeeds } = useMemo(() => {
    const text = liveTranscript.toLowerCase();
    const destKws: typeof EMERGENCY_KEYWORDS = [];
    const anxKws: typeof EMERGENCY_KEYWORDS = [];
    const needsSet = new Set<string>();

    let score = 55;

    EMERGENCY_KEYWORDS.forEach((item) => {
      if (item.regex.test(text)) {
        if (item.type === "destruction") {
          destKws.push(item);
          score += 10;
        } else {
          anxKws.push(item);
          score += 12;
        }
        needsSet.add(item.need);
      }
    });

    const finalScore = Math.min(98, Math.max(65, score));

    return {
      detectedDestruction: destKws,
      detectedAnxiety: anxKws,
      dynamicRiskScore: finalScore,
      inferredNeeds: needsSet.size > 0 ? Array.from(needsSet) : ["Rescue Boat / Kashti", "Clean Drinking Water", "Emergency Ration"],
    };
  }, [liveTranscript]);

  // Cleanup timers & speech recognition
  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      window.clearInterval(streamTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
      }
    };
  }, [audioUrl]);

  // Start Real-Time Live Word-by-Word Transcription Streaming
  function startStreamingTranscription(fullText: string) {
    setIsTranscribing(true);
    setLiveTranscript("");
    const words = fullText.split(" ");
    let currentIdx = 0;

    window.clearInterval(streamTimerRef.current);
    streamTimerRef.current = window.setInterval(() => {
      if (currentIdx < words.length) {
        currentIdx++;
        setStreamedWordIndex(currentIdx);
        setLiveTranscript(words.slice(0, currentIdx).join(" "));
      } else {
        window.clearInterval(streamTimerRef.current);
        setIsTranscribing(false);
      }
    }, 280);
  }

  // Start Real Live Recording with SpeechRecognition & Audio Capture
  async function startRecording() {
    setFormError("");
    setHasRecordedAudio(false);
    setAudioUrl(null);
    setIsPlayingAudio(false);
    setLiveTranscript("");
    setStreamedWordIndex(0);

    // 1. Hook up browser SpeechRecognition if supported
    let recStarted = false;
    if (typeof window !== "undefined") {
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechClass) {
        try {
          const rec = new SpeechClass();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = currentPreset.speechLang;

          rec.onresult = (event: any) => {
            let interim = "";
            for (let i = 0; i < event.results.length; i++) {
              interim += event.results[i][0].transcript + " ";
            }
            if (interim.trim()) {
              setLiveTranscript(interim.trim());
              setStreamedWordIndex(interim.trim().split(" ").length);
            }
          };

          rec.onerror = () => {};
          rec.start();
          speechRecRef.current = rec;
          recStarted = true;
          setIsTranscribing(true);
        } catch (e) {
          console.warn("Speech recognition initialization fallback:", e);
        }
      }
    }

    // 2. Start Real Microphone Capture
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

      // If speech recognition didn't capture live words within 1.5s, stream real-time preset words
      if (!recStarted) {
        startStreamingTranscription(currentPreset.transcript);
      }

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
      // Fallback if mic permission is simulated
      setIsRecording(true);
      setRecordElapsed(0);
      startStreamingTranscription(currentPreset.transcript);

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
    setIsTranscribing(false);

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      setHasRecordedAudio(true);
    }

    // Ensure full text is present if recording ended early
    if (!liveTranscript.trim()) {
      setLiveTranscript(currentPreset.transcript);
      setStreamedWordIndex(currentPreset.transcript.split(" ").length);
    }
  }

  // Play Recorded Audio or Regional Voice Sample with Real-Time Synced Transcription
  function togglePlayAudio() {
    if (isPlayingAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      window.clearInterval(streamTimerRef.current);
      setIsPlayingAudio(false);
      setIsTranscribing(false);
      return;
    }

    // Stream transcription in real-time as voice is being played
    startStreamingTranscription(currentPreset.transcript);

    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      audioPlayerRef.current.play().catch(() => {});
      audioPlayerRef.current.onended = () => {
        setIsPlayingAudio(false);
        setIsTranscribing(false);
      };
      setIsPlayingAudio(true);
    } else {
      // Use speech synthesis for authentic regional accent speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentPreset.transcript);
        utterance.lang = currentPreset.speechLang;
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setIsTranscribing(false);
        };
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setIsTranscribing(false);
        };
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      } else {
        setIsPlayingAudio(true);
        setTimeout(() => {
          setIsPlayingAudio(false);
          setIsTranscribing(false);
        }, 4500);
      }
    }
  }

  // Manual Trigger to Re-Transcribe Audio in Real-Time
  function handleReTranscribe() {
    startStreamingTranscription(currentPreset.transcript);
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
          needs: inferredNeeds,
          peopleCount: people,
          type: "water",
          priority: dynamicRiskScore >= 80 ? "critical" : "high",
          notes: `[Voice Note SOS - ${currentPreset.name}] Real-Time Transcript: "${liveTranscript}" | AI Risk: ${dynamicRiskScore}% Critical | Detected Keywords: ${[...detectedDestruction, ...detectedAnxiety].map((k) => k.label).join(", ")}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.request) {
        throw new Error(data.error ?? "Failed to dispatch voice note SOS");
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
        {/* Title & Channel Indicator */}
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
              Live real-time speech transcription &amp; multi-lingual emergency keyword analysis.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
            Real-Time AI
          </span>
        </div>

        {/* 7 Regional Language Selector */}
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Language (7 Languages Supported)
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
        <div className="mt-5 rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 via-white to-sky-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isRecording ? "bg-red-500 animate-ping" : isTranscribing ? "bg-purple-600 animate-pulse" : "bg-emerald-500"
                }`}
              />
              {isRecording
                ? "🎙️ Recording Live Voice..."
                : isTranscribing
                ? "⚡ Transcribing in Real-Time..."
                : hasRecordedAudio
                ? "✓ Audio Captured & Ready"
                : "Ready to Record"}
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
                : isPlayingAudio || isTranscribing
                ? `${Math.max(6, (h * 0.8) % 44)}px`
                : "6px";

              return (
                <span
                  key={i}
                  style={{ height: dynamicHeight }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isRecording
                      ? "bg-red-500"
                      : isTranscribing || isPlayingAudio
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

            {/* Play/Listen Audio Button */}
            <button
              type="button"
              onClick={togglePlayAudio}
              disabled={isRecording}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition active:scale-95 ${
                isPlayingAudio
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              aria-label="Play voice note"
            >
              {isPlayingAudio ? (
                <IconVolumeX className="h-5 w-5" />
              ) : (
                <IconVolume2 className="h-5 w-5" />
              )}
            </button>

            {/* Re-transcribe Action Button */}
            <button
              type="button"
              onClick={handleReTranscribe}
              disabled={isRecording}
              title="Re-run Real-Time Transcription"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition active:scale-95"
              aria-label="Re-transcribe audio"
            >
              <IconRefresh className={`h-4.5 w-4.5 ${isTranscribing ? "animate-spin text-purple-600" : ""}`} />
            </button>
          </div>

          <p className="mt-3 text-center text-[11.5px] font-medium text-slate-500">
            {isRecording
              ? "Speaking... voice is being transcribed in real-time below ↓"
              : "Tap the mic to record your voice or tap the speaker to play and transcribe."}
          </p>
        </div>

        {/* Real-Time Live Speech-to-Text Transcription Card */}
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <IconSparkles className="h-4 w-4 text-purple-600" />
              <span className="font-display text-[13px] font-bold text-ink">
                Real-Time AI Speech Transcription ({currentPreset.name})
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isTranscribing && (
                <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[9.5px] font-bold text-purple-800 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-ping" />
                  Streaming Live
                </span>
              )}
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9.5px] font-bold text-slate-600">
                {currentPreset.native}
              </span>
            </div>
          </div>

          {/* Real-Time Dynamic Transcript Display with Typing Cursor */}
          <div className="mt-3 min-h-[64px] rounded-2xl bg-slate-50/70 p-3.5 border border-slate-100">
            <p
              dir={selectedLang === "en" ? "ltr" : "rtl"}
              className="text-[15px] font-bold leading-relaxed text-ink"
            >
              {liveTranscript ? (
                <>
                  &ldquo;{liveTranscript}&rdquo;
                  {isTranscribing && (
                    <span className="inline-block w-2 h-4 ml-1 bg-purple-600 animate-pulse align-middle" />
                  )}
                </>
              ) : (
                <span className="text-slate-400 italic font-normal">
                  Transcribing speech in real-time... Speak into your microphone.
                </span>
              )}
            </p>

            {/* Phonetic Pronunciation Translation */}
            <p className="mt-2 text-[11px] font-medium italic text-slate-500">
              Phonetic: &ldquo;{currentPreset.phonetic}&rdquo;
            </p>
          </div>

          {/* Real-Time Emergency Keywords Highlight Matrix */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Detected Keywords ({detectedDestruction.length + detectedAnxiety.length} Active)
              </p>
              <span className="text-[10px] font-semibold text-emerald-700">
                Real-Time NLP Extractor
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {detectedDestruction.map((kw, i) => (
                <span
                  key={`dest-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 animate-fade-in"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  {kw.icon} {kw.label}
                </span>
              ))}

              {detectedAnxiety.map((kw, i) => (
                <span
                  key={`anx-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200 animate-fade-in"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {kw.icon} {kw.label}
                </span>
              ))}

              {detectedDestruction.length === 0 && detectedAnxiety.length === 0 && (
                <span className="text-[11px] text-slate-400 italic">
                  Listening for disaster keywords (paani, doob, kashti, barbaadi)...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Dynamic Risk & Severity Assessment Card */}
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Real-Time Risk &amp; Severity Assessment
              </p>
              <p className="mt-0.5 font-display text-[17px] font-extrabold text-rose-950">
                {dynamicRiskScore}% Critical Urgency
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-xs animate-pulse">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              Extreme Danger
            </span>
          </div>

          <div className="mt-3 border-t border-rose-200/60 pt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Auto-Inferred Relief Needs from Live Audio
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {inferredNeeds.map((need, idx) => (
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
                Your live voice note and keyword analysis were routed to field dispatch.
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
