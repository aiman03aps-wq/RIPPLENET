"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type LangCode } from "../../lib/citizen-translations";

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  openPicker: boolean;
  setOpenPicker: (v: boolean) => void;
};

const LanguageCtx = createContext<Ctx>({
  lang: "ur",
  setLang: () => {},
  t: (key) => key,
  openPicker: false,
  setOpenPicker: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("ur");
  const [openPicker, setOpenPicker] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("citizen_language");
    if (stored && stored in translations) setLangState(stored as LangCode);
  }, []);

  function setLang(l: LangCode) {
    setLangState(l);
    sessionStorage.setItem("citizen_language", l);
  }

  function t(key: string): string {
    return translations[lang]?.[key] ?? translations.ur[key] ?? key;
  }

  return (
    <LanguageCtx.Provider value={{ lang, setLang, t, openPicker, setOpenPicker }}>
      {children}
    </LanguageCtx.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageCtx);
}
