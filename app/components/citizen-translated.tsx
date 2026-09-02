"use client";

import { useLanguage } from "./language-context";
import { languages } from "../../lib/citizen-translations";

export function Translated({
  k,
  as,
  className,
  dir,
}: {
  k: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "label";
  className?: string;
  dir?: "rtl" | "ltr";
}) {
  const { t } = useLanguage();
  const Tag = as ?? "span";
  return (
    <Tag className={className} dir={dir}>
      {t(k)}
    </Tag>
  );
}

export function LanguagePill() {
  const { lang, setOpenPicker } = useLanguage();
  const current = languages.find((l) => l.code === lang);
  return (
    <button
      type="button"
      onClick={() => setOpenPicker(true)}
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-2.5 text-ink"
    >
      <span dir="rtl" className="font-urdu text-[13px] leading-[1.6]">
        {current?.native ?? "اردو"}
      </span>
      <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
