import type { Metadata } from "next";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = {
  title: "Interactive Live Demo — RippleNet AI",
  description: "Test the 5 AI Agents decision intelligence pipeline live on flood relief scenarios.",
};

export default function DemoPage() {
  return <DemoClient />;
}
