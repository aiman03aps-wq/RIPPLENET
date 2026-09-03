"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconX } from "../components/icons";

interface RequestRestockButtonProps {
  itemNames: string[];
  initialItem?: string;
  initialOpen?: boolean;
  onModalClosed?: () => void;
}

export function RequestRestockButton({
  itemNames,
  initialItem,
  initialOpen = false,
  onModalClosed,
}: RequestRestockButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [itemName, setItemName] = useState(initialItem || itemNames[0] || "");
  const [quantity, setQuantity] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [requested, setRequested] = useState("");

  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
      if (initialItem) setItemName(initialItem);
    }
  }, [initialOpen, initialItem]);

  function handleClose() {
    setOpen(false);
    onModalClosed?.();
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send request");
      setRequested(data.restock?.code || `RSK-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      handleClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!initialOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={itemNames.length === 0}
          className="h-[52px] w-full rounded-full bg-ink text-[12.5px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98] disabled:opacity-50"
        >
          Request Restock
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-ink/50 backdrop-blur-xs animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Request restock"
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-28 pt-6 shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">
                Request Restock
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Sent to Alkhidmat district supply for approval.
            </p>

            {error && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
                {error}
              </p>
            )}

            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Item
            </label>
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-channel"
            >
              {itemNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Quantity
            </label>
            <div className="mt-1.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[18px] font-bold text-slate-600 transition active:scale-95"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                aria-label="Restock quantity"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-[13px] font-bold tabular-nums text-ink outline-none focus:border-channel"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 10)}
                aria-label="Increase quantity"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[18px] font-bold text-slate-600 transition active:scale-95"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={busy || !itemName}
              className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-channel text-[12.5px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "Sending…" : (
                <>
                  <IconCheck className="h-4 w-4" strokeWidth={3} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {requested && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-emerald-500 px-4 py-2 text-[12px] font-bold text-white shadow-lg"
        >
          Restock request {requested} sent
        </div>
      )}
    </>
  );
}
