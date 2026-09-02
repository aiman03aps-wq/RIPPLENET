import type { Metadata } from "next";
import { LanguageProvider } from "../components/language-context";
import { CampsScreen } from "./camps-screen";

export const metadata: Metadata = {
  title: "Nearby Relief Camps — RippleNet AI",
};

export default function CampsPage() {
  return (
    <LanguageProvider>
      <CampsScreen />
    </LanguageProvider>
  );
}
