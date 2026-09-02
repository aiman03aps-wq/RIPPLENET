"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconMenu, IconSearch, IconPackage } from "../components/icons";
import { IconBowlSpoon, IconDroplet, IconTent, IconUsers } from "../components/icons";
import { formatDayTime } from "../../lib/needs";
import {
  StockIconAntiseptic,
  StockIconBandage,
  StockIconBleach,
  StockIconOrs,
  StockIconParacetamol,
  StockIconSanitary,
  StockIconSanitizer,
  StockIconSoap,
  StockIconWaterFilter,
  StockIconWaterTabs,
  StockIconZinc,
} from "./stock-icons";

export interface StockItemView {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export interface RestockView {
  id: number;
  code: string;
  itemName: string;
  quantity: number;
  status: string;
  createdAt: string;
}

type StockStatus = "Sufficient" | "Low Stock" | "Critical";

const statusStyles: Record<StockStatus, { pill: string; bar: string }> = {
  Sufficient: { pill: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  "Low Stock": { pill: "bg-orange-50 text-orange-600", bar: "bg-orange-500" },
  Critical: { pill: "bg-red-500 text-white", bar: "bg-red-500" },
};

const restockPills: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-orange-50 text-orange-600" },
  approved: { label: "Approved", className: "bg-sky-50 text-sky-600" },
  fulfilled: { label: "Fulfilled", className: "bg-emerald-50 text-emerald-600" },
};

type ItemIcon = (props: { className?: string }) => React.ReactElement;

const itemIcons: Record<string, ItemIcon> = {
  "RippleNet Water Purification Kit": StockIconWaterFilter,
  "Paracetamol (500mg)": StockIconParacetamol,
  "ORS Sachets": StockIconOrs,
  "Zinc Tablets": StockIconZinc,
  "Water Purification Tabs": StockIconWaterTabs,
  "Antiseptic Liquid (100ml)": StockIconAntiseptic,
  "Bandage Rolls": StockIconBandage,
  "Soap Bars": StockIconSoap,
  "Hand Sanitizer": StockIconSanitizer,
  "Bleaching Powder": StockIconBleach,
  "Sanitary Pads": StockIconSanitary,
  "Mineral Water (1.5L)": IconDroplet,
  "Family Food Pack": IconBowlSpoon,
  "Family Tent": IconTent,
  Blankets: IconUsers,
};

function iconFor(name: string): ItemIcon {
  return itemIcons[name] ?? IconPackage;
}

function statusOf(quantity: number, reorderLevel: number): StockStatus {
  if (quantity === 0 || quantity <= Math.floor(reorderLevel * 0.5)) return "Critical";
  if (quantity <= reorderLevel) return "Low Stock";
  return "Sufficient";
}

function pctOf(quantity: number, reorderLevel: number): number {
  return Math.min(100, Math.round((quantity / Math.max(1, reorderLevel * 2)) * 100));
}

function StockRow({ item }: { item: StockItemView }) {
  const router = useRouter();
  const [qty, setQty] = useState(item.quantity);
  const [busy, setBusy] = useState(false);

  const status = statusOf(qty, item.reorderLevel);
  const Icon = iconFor(item.name);

  async function adjust(delta: number) {
    const next = Math.max(0, qty + delta);
    if (next === qty || busy) return;
    setBusy(true);
    setQty(next);
    try {
      const res = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, delta }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setQty(qty);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
        <Icon className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13.5px] font-bold text-ink">
            {item.name}{" "}
            <span className="text-[11.5px] font-medium text-slate-400 capitalize">{item.category}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={busy || qty === 0}
              aria-label={`Decrease ${item.name} stock`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[15px] font-bold leading-none text-slate-600 transition active:scale-90 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[64px] text-center text-[12px] font-semibold tabular-nums text-ink">
              {qty.toLocaleString()} {item.unit}
            </span>
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={busy}
              aria-label={`Increase ${item.name} stock`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[15px] font-bold leading-none text-slate-600 transition active:scale-90 disabled:opacity-40"
            >
              +
            </button>
          </span>
        </span>
        <span className="mt-2.5 flex items-center gap-2.5">
          <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className={`block h-full rounded-full ${statusStyles[status].bar}`}
              style={{ width: `${pctOf(qty, item.reorderLevel)}%` }}
            />
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${statusStyles[status].pill}`}
          >
            {status}
          </span>
        </span>
        <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
          Reorder at {item.reorderLevel} {item.unit}
        </span>
      </span>
    </div>
  );
}

export function StockList({
  items,
  restocks,
}: {
  items: StockItemView[];
  restocks: RestockView[];
}) {
  const [tab, setTab] = useState<"current" | "low" | "restock">("current");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const lowCount = items.filter((i) => i.quantity <= i.reorderLevel).length;

  const tabs = [
    { id: "current" as const, label: "Current Stock", badge: null as number | null },
    { id: "low" as const, label: "Low Stock", badge: lowCount },
    { id: "restock" as const, label: "Restock Requests", badge: null as number | null },
  ];

  const filtered =
    tab === "restock"
      ? restocks.filter((r) => r.itemName.toLowerCase().includes(q))
      : items.filter((item) => {
          if (tab === "low" && item.quantity > item.reorderLevel) return false;
          return item.name.toLowerCase().includes(q);
        });

  return (
    <div>
      <div className="mt-4 flex gap-6 border-b border-slate-200/80 px-5" role="tablist" aria-label="Stock views">
        {tabs.map(({ id, label, badge }) => {
          const isActive = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 pb-2.5 pt-1.5 ${
                isActive ? "text-ink" : "text-slate-400"
              }`}
            >
              <span className={`text-[13px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span className="inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white">
                  {badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-channel" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2.5 px-5">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-channel">
          <IconSearch className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            aria-label="Search stock items"
            className="w-full bg-transparent text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          aria-label="Filter items"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition active:scale-[0.96]"
        >
          <IconMenu className="h-[20px] w-[20px]" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-5">
        {filtered.map((row) =>
          tab === "restock" ? (
            (() => {
              const r = row as RestockView;
              const pill = restockPills[r.status] ?? restockPills.pending;
              const Icon = iconFor(r.itemName);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                    <Icon className="h-6 w-6 text-slate-500" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[13.5px] font-bold text-ink">{r.itemName}</span>
                    <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-slate-400">
                      {r.quantity} units · {r.code} · {formatDayTime(new Date(r.createdAt))}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${pill.className}`}
                  >
                    {pill.label}
                  </span>
                </div>
              );
            })()
          ) : (
            <StockRow key={`${(row as StockItemView).id}-${(row as StockItemView).quantity}`} item={row as StockItemView} />
          ),
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-500">
              {tab === "restock" ? "No restock requests yet" : "No items found"}
            </p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {tab === "restock"
                ? "Requests you send will appear here."
                : "Try a different search term."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
