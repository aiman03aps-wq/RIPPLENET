import type { Metadata } from "next";
import { LanguageProvider } from "../../components/language-context";
import { AudioSosForm } from "./audio-sos-form";

export const metadata: Metadata = {
  title: "Voice Note SOS (7 Languages AI) — RippleNet",
};

export default function AudioSosPage() {
  return (
    <LanguageProvider>
      <AudioSosForm />
    </LanguageProvider>
  );
}
