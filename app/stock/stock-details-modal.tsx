"use client";

import { useState, useMemo } from "react";
import { IconX, IconCheck } from "../components/icons";
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
import { IconBowlSpoon, IconDroplet, IconTent, IconUsers, IconPackage } from "../components/icons";
import type { StockItemView } from "./stock-list";

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

// Generate human-friendly SKU from item name
function generateSku(name: string, category: string): string {
  const catPrefix =
    category.toLowerCase().includes("med")
      ? "MED"
      : category.toLowerCase().includes("wat")
      ? "WTR"
      : category.toLowerCase().includes("food")
      ? "CON"
      : category.toLowerCase().includes("shelt")
      ? "SHL"
      : "GEN";

  const code = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();

  return `SKU: ${catPrefix}-${code || "ITM"}-001`;
}

// Format number into K notation (e.g. 1500 -> 1.5K)
function formatK(num: number): string {
  if (num >= 1000) {
    const k = num / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return num.toString();
}

interface StockDetailsModalProps {
  item: StockItemView | null;
  isOpen: boolean;
  onClose: () => void;
  managerName?: string;
  onRequestRestock: (itemName: string, suggestedQty: number) => void;
  onStockUpdated: (itemId: number, newQty: number, newReorder?: number) => void;
}

export function StockDetailsModal({
  item,
  isOpen,
  onClose,
  managerName = "Imran Ali",
  onRequestRestock,
  onStockUpdated,
}: StockDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(item?.quantity ?? 0);
  const [editReorder, setEditReorder] = useState(item?.reorderLevel ?? 0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sync edit state when item changes
  const currentItem = item;

  // Generate 7 days mock trend anchored on current stock
  const trendData = useMemo(() => {
    if (!currentItem) return [];
    const base = currentItem.quantity;
    const days: { dateLabel: string; value: number; delta: number }[] = [];
    const now = new Date();

    // Deterministic trend curve based on item id
    const seed = (currentItem.id * 17) % 100;
    const multipliers = [1.45, 1.4, 1.32, 1.28, 1.2, 1.12, 1.0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const mult = multipliers[6 - i] + ((seed + i) % 5) * 0.02;
      const val = Math.round(base * mult);
      const delta = i === 6 ? 0 : Math.round(base * (multipliers[6 - i] - multipliers[6 - i - 1]));
      days.push({ dateLabel, value: val, delta });
    }
    return days;
  }, [currentItem]);

  if (!isOpen || !currentItem) return null;

  const Icon = iconFor(currentItem.name);
  const sku = generateSku(currentItem.name, currentItem.category);
  const isLow = currentItem.quantity <= currentItem.reorderLevel;
  const isCritical = currentItem.quantity === 0 || currentItem.quantity <= Math.floor(currentItem.reorderLevel * 0.5);

  const statusLabel = isCritical ? "Critical" : isLow ? "Low Stock" : "In Stock";
  const statusColor = isCritical
    ? "text-red-600"
    : isLow
    ? "text-amber-600"
    : "text-emerald-600";

  // Chart coordinate calculations
  const values = trendData.map((d) => d.value);
  const maxVal = Math.max(...values, currentItem.reorderLevel * 2, 100);
  const minVal = 0;
  const chartHeight = 140;
  const chartWidth = 320;
  const paddingX = 20;
  const paddingY = 15;

  const points = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1)) * (chartWidth - 2 * paddingX);
    const y =
      chartHeight -
      paddingY -
      ((d.value - minVal) / Math.max(1, maxVal - minVal)) * (chartHeight - 2 * paddingY);
    return { x, y, ...d };
  });

  // SVG Line path
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // SVG Area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Save stock edit handler
  async function handleSaveEdit() {
    if (!currentItem) return;
    setSaving(true);
    try {
      const delta = editQty - currentItem.quantity;
      const res = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: currentItem.id,
          delta,
        }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      onStockUpdated(currentItem.id, editQty, editReorder);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 700);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const nowFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-[440px] max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Item Details"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">
            Item Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item details"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 active:scale-90"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Top Product Header Card */}
        <div className="mt-4 flex items-center gap-3.5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-xs">
            <Icon className="h-10 w-10 text-slate-700" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <h3 className="font-display text-[16px] font-bold text-ink truncate">
              {currentItem.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600 capitalize">
                {currentItem.category || "Consumables"}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] font-medium text-slate-400">
              {sku}
            </p>
          </div>
        </div>

        {/* 2x2 Key Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current Stock
            </p>
            <p className={`mt-1 text-[17px] font-bold tracking-tight ${statusColor}`}>
              {currentItem.quantity.toLocaleString()}{" "}
              <span className="text-[13px] font-semibold capitalize">{currentItem.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Status
            </p>
            <p className={`mt-1 text-[15px] font-bold ${statusColor}`}>
              {statusLabel}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reorder Level
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink">
              {currentItem.reorderLevel.toLocaleString()}{" "}
              <span className="text-[12px] font-medium text-slate-500 capitalize">{currentItem.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Unit
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink capitalize">
              {currentItem.unit}
            </p>
          </div>
        </div>

        {/* Inline Stock Editor (Triggered by "Edit Item") */}
        {isEditing && (
          <div className="mt-4 rounded-2xl border border-channel/30 bg-sky-50/60 p-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <span className="text-[12px] font-bold text-ink">Adjust Item Stock</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase">
                  Available Quantity
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditQty((q) => Math.max(0, q - 10))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-[16px] font-bold text-slate-700 shadow-xs active:scale-95"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(0, Number(e.target.value) || 0))}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-center font-bold tabular-nums text-ink text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setEditQty((q) => q + 10)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-[16px] font-bold text-slate-700 shadow-xs active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="w-[100px]">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase">
                  Reorder At
                </label>
                <input
                  type="number"
                  value={editReorder}
                  onChange={(e) => setEditReorder(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-center font-bold tabular-nums text-ink text-[13px]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving}
              className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-channel text-[12.5px] font-bold text-white shadow-md shadow-channel/25 active:scale-98 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  Saved!
                </>
              ) : saving ? (
                "Saving Changes…"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}

        {/* Interactive Stock Trend Chart (Last 7 Days) */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display text-[13.5px] font-bold text-ink">
              Stock Trend (Last 7 Days)
            </h4>
            {hoveredIndex != null && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10.5px] font-bold text-sky-800 animate-fade-in">
                {trendData[hoveredIndex].dateLabel}: {trendData[hoveredIndex].value.toLocaleString()} {currentItem.unit}
              </span>
            )}
          </div>

          {/* SVG Line / Area Graph */}
          <div className="relative mt-2 w-full select-none">
            {/* Y-axis markers */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-semibold text-slate-400">
              <span>{formatK(maxVal)}</span>
              <span>{formatK(maxVal * 0.75)}</span>
              <span>{formatK(maxVal * 0.5)}</span>
              <span>{formatK(maxVal * 0.25)}</span>
              <span>0</span>
            </div>

            <div className="ml-7 overflow-x-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-[140px] overflow-visible"
              >
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.15, 0.38, 0.62, 0.85].map((pct, i) => (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={chartHeight * pct}
                    x2={chartWidth - paddingX}
                    y2={chartHeight * pct}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Reorder Level Warning Line */}
                {currentItem.reorderLevel > 0 && (
                  <line
                    x1={paddingX}
                    y1={
                      chartHeight -
                      paddingY -
                      (currentItem.reorderLevel / Math.max(1, maxVal)) * (chartHeight - 2 * paddingY)
                    }
                    x2={chartWidth - paddingX}
                    y2={
                      chartHeight -
                      paddingY -
                      (currentItem.reorderLevel / Math.max(1, maxVal)) * (chartHeight - 2 * paddingY)
                    }
                    stroke="#f87171"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Area Gradient Fill */}
                <path d={areaD} fill="url(#stockGradient)" />

                {/* Primary Trend Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((p, i) => {
                  const isHovered = hoveredIndex === i;
                  return (
                    <g key={i} className="cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke="#0284c7"
                        strokeWidth={isHovered ? 3 : 2}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setHoveredIndex(i)}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-axis date labels */}
              <div className="flex justify-between px-2 pt-1 text-[9.5px] font-medium text-slate-400">
                {trendData.map((d, i) => (
                  <span
                    key={i}
                    className={`transition ${hoveredIndex === i ? "font-bold text-sky-600" : ""}`}
                  >
                    {d.dateLabel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata section */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
          <div>
            <p className="font-medium text-slate-400">Last Updated</p>
            <p className="font-bold text-ink mt-0.5">{nowFormatted}</p>
          </div>
          <div>
            <p className="font-medium text-slate-400">Updated By</p>
            <p className="font-bold text-ink mt-0.5">{managerName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditQty(currentItem.quantity);
              setEditReorder(currentItem.reorderLevel);
              setIsEditing((prev) => !prev);
            }}
            className="flex-1 h-12 rounded-xl border border-slate-300 bg-white font-display text-[13px] font-bold text-ink shadow-xs transition hover:bg-slate-50 active:scale-98"
          >
            {isEditing ? "Close Editor" : "Edit Item"}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              const suggested = Math.max(50, currentItem.reorderLevel * 2 - currentItem.quantity);
              onRequestRestock(currentItem.name, suggested);
            }}
            className="flex-1 h-12 rounded-xl bg-[#0a2540] font-display text-[13px] font-bold text-white shadow-md shadow-[#0a2540]/20 transition hover:bg-slate-800 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            Request Restock
          </button>
        </div>
      </div>
    </div>
  );
}
