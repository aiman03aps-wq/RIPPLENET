import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const nastaliq = Noto_Nastaliq_Urdu({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-nastaliq",
});

export const metadata: Metadata = {
  title: "RippleNet AI — AI for Humanitarian Impact",
  description:
    "RippleNet AI turns every SOS into a smart, defensible decision—so Alkhidmat reaches more people across Pakistan's flood zones.",
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
