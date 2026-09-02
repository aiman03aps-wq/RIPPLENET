"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "../../../components/icons";

export function StartTripButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start trip");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start trip");
      setBusy(false);
    }
  }

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={handleStart}
        disabled={busy}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Starting…" : "Start Trip"}
        {!busy && <IconArrowRight className="h-[18px] w-[18px]" />}
      </button>
      {error && <p className="mt-2 text-center text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}
