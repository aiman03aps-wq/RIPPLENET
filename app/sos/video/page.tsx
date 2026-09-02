import type { Metadata } from "next";
import { LanguageProvider } from "../../components/language-context";
import { SosForm } from "./sos-form";

export const metadata: Metadata = {
  title: "Video SOS — RippleNet AI",
};

export default function VideoSosPage() {
  return (
    <LanguageProvider>
      <SosForm />
    </LanguageProvider>
  );
}
