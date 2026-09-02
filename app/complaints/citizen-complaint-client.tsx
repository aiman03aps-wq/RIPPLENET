"use client";

import { useState } from "react";
import Link from "next/link";
import { CitizenHeader } from "../components/citizen-header";
import { CitizenNav } from "../components/citizen-nav";
import { LanguageProvider, useLanguage } from "../components/language-context";
import {
  IconCheck,
  IconSend,
  IconAlertTriangle,
  IconPhone,
  IconSparkles,
} from "../components/icons";

interface CampOption {
  id: number;
  name: string;
  district: string;
}

function CitizenComplaintInner({ camps }: { camps: CampOption[] }) {
  const { t, lang } = useLanguage();
  const [citizenName, setCitizenName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCampId, setSelectedCampId] = useState<string>("");
  const [category, setCategory] = useState("delivery");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const isRtl = lang !== "en";

  const complaintCategories = [
    { id: "delivery", label: t("catDelivery"), icon: "🚚" },
    { id: "medical", label: t("catMedical"), icon: "💊" },
    { id: "food_water", label: t("catFoodWater"), icon: "💧" },
    { id: "service", label: t("catService"), icon: "👤" },
    { id: "other", label: t("catOther"), icon: "📋" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim() || !message.trim()) {
      setError(t("formErrorComplaint"));
      return;
    }
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: citizenName.trim(),
          phone: phone.trim(),
          campId: selectedCampId ? Number(selectedCampId) : undefined,
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit complaint");
      }

      setSubmittedCode(data.complaint?.code || "CMP-2026-0001");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("formErrorComplaint"));
    } finally {
      setBusy(false);
    }
  };

  if (submittedCode) {
    return (
      <div className={`relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl ${isRtl ? "font-urdu" : "font-sans"}`}>
        <CitizenHeader title={t("lodgeComplaint")} subtitle={t("complaintRedressalDesk")} />

        <main className="px-5 pb-24 pt-6">
          <div className="flex flex-col items-center rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-8 text-center shadow-xs">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <IconCheck className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-4 font-display text-[22px] font-extrabold text-ink leading-snug">
              {t("complaintSuccessTitle")}
            </h2>
            <p className="mt-1.5 max-w-[320px] text-[12.5px] leading-relaxed text-slate-600">
              {t("complaintSuccessDesc")}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {t("trackingIdLabel")}
            </p>
            <p className="mt-1 font-display text-[20px] font-extrabold tracking-wide text-ink font-mono">
              {submittedCode}
            </p>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {t("underReviewStatus")}
            </div>
            <p className="mt-2 text-[11.5px] text-slate-500 leading-relaxed">
              {t("saveRefNote")}{" "}
              <strong className="text-slate-700 font-mono">{phone}</strong>.
            </p>
          </div>

          {/* Emergency Helplines Card */}
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <p className="text-[12.5px] font-bold text-ink">{t("needImmediateAssistance")}</p>
            <p className="mt-0.5 text-[11.5px] text-slate-600 leading-relaxed">
              {t("lifeThreateningDesc")}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <a
                href="tel:1122"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-[12px] font-bold text-white shadow-xs"
              >
                <IconPhone className="h-3.5 w-3.5" />
                {t("call1122")}
              </a>
              <a
                href="tel:080022222"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-[12px] font-bold text-white shadow-xs"
              >
                <IconPhone className="h-3.5 w-3.5" />
                {t("alkhidmat0800")}
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmittedCode(null);
              setMessage("");
              setCitizenName("");
              setPhone("");
            }}
            className="mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white shadow-lg shadow-ink/20 active:scale-[0.98] transition"
          >
            {t("lodgeAnother")}
          </button>

          <Link
            href="/"
            className="mt-3 block text-center text-[12.5px] font-semibold text-channel hover:underline"
          >
            ← {t("returnHome")}
          </Link>
        </main>

        <CitizenNav active="home" />
      </div>
    );
  }

  return (
    <div className={`relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl ${isRtl ? "font-urdu" : "font-sans"}`}>
      <CitizenHeader title={t("lodgeComplaint")} subtitle={t("complaintRedressalDesk")} />

      <main className="px-5 pb-28 pt-4">
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-3.5">
          <p className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
            <IconSparkles className="h-4 w-4 text-channel" />
            {t("reliefAccountability")}
          </p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">
            {t("complaintBannerDesc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-[12px] font-semibold text-red-600 flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[12.5px] font-bold text-ink">
              {t("yourFullName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder={t("namePlaceholderComplaint")}
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink">
              {t("contactPhone")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholderComplaint")}
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink">
              {t("reliefCampDistrict")}
            </label>
            <select
              value={selectedCampId}
              onChange={(e) => setSelectedCampId(e.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-ink outline-none focus:border-channel focus:ring-2 focus:ring-sky-100 transition"
            >
              <option value="">{t("selectCampOption")}</option>
              {camps.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              {t("issueCategory")} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {complaintCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                    category === cat.id
                      ? "border-channel bg-sky-50/80 text-channel shadow-xs ring-1 ring-channel/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[16px]">{cat.icon}</span>
                  <span className="text-[12.5px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink">
              {t("detailedDescription")} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-[13px] font-medium text-ink outline-none focus:border-channel focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-3 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-channel text-[15px] font-bold text-white shadow-lg shadow-channel/25 active:scale-[0.98] transition disabled:opacity-60"
          >
            <IconSend className="h-5 w-5" />
            {busy ? t("submittingComplaint") : t("submitComplaintBtn")}
          </button>
        </form>
      </main>

      <CitizenNav active="home" />
    </div>
  );
}

export function CitizenComplaintClient({ camps }: { camps: CampOption[] }) {
  return (
    <LanguageProvider>
      <CitizenComplaintInner camps={camps} />
    </LanguageProvider>
  );
}
