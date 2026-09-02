"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ForwardButton({ requestCode }: { requestCode: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function forward() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/requests/${requestCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forward" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not forward request");
      router.push("/queue");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not forward request");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={forward}
        disabled={busy}
        className="mx-auto mt-4 block text-center text-[12.5px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-[6px] transition active:opacity-60 disabled:opacity-50"
      >
        {busy ? "Forwarding…" : "Forward to Next Camp"}
      </button>
      {error && (
        <p className="mt-2 text-center text-[11.5px] font-semibold text-red-600">{error}</p>
      )}
    </>
  );
}
