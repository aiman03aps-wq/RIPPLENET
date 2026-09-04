"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconMenu,
  IconSearch,
  IconPackage,
  IconX,
  IconCheck,
  IconChevronRight,
  IconFilter,
  IconBowlSpoon,
  IconDroplet,
  IconTent,
  IconUsers,
} from "../components/icons";
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
import { StockDetailsModal } from "./stock-details-modal";
import { RequestRestockButton } from "./request-restock-button";

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

function StockRow({
  item,
  onSelect,
  onAdjust,
  busy,
}: {
  item: StockItemView;
  onSelect: () => void;
  onAdjust: (delta: number) => void;
  busy: boolean;
}) {
  const status = statusOf(item.quantity, item.reorderLevel);
  const Icon = iconFor(item.name);

  return (
    <div
      onClick={onSelect}
      className="group relative flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:border-channel/40 hover:shadow-md active:scale-[0.99] cursor-pointer"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-sky-50/60 transition">
        <Icon className="h-7 w-7" />
      </span>

      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13.5px] font-bold text-ink group-hover:text-channel transition">
            {item.name}{" "}
            <span className="text-[11px] font-medium text-slate-400 capitalize">
              {item.category}
            </span>
          </span>

          {/* Quick Increment / Decrement controls */}
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onAdjust(-1)}
              disabled={busy || item.quantity === 0}
              aria-label={`Decrease ${item.name} stock`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[15px] font-bold leading-none text-slate-600 transition hover:bg-slate-200 active:scale-90 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[64px] text-center text-[12px] font-bold tabular-nums text-ink">
              {item.quantity.toLocaleString()} {item.unit}
            </span>
            <button
              type="button"
              onClick={() => onAdjust(1)}
              disabled={busy}
              aria-label={`Increase ${item.name} stock`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[15px] font-bold leading-none text-slate-600 transition hover:bg-slate-200 active:scale-90 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className={`block h-full rounded-full transition-all duration-300 ${statusStyles[status].bar}`}
              style={{ width: `${pctOf(item.quantity, item.reorderLevel)}%` }}
            />
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-[3px] text-[9.5px] font-bold ${statusStyles[status].pill}`}
          >
            {status}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Reorder at {item.reorderLevel} {item.unit}</span>
          <span className="flex items-center gap-0.5 text-channel font-semibold opacity-0 group-hover:opacity-100 transition">
            View Details
            <IconChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function StockList({
  items,
  restocks,
  managerName = "Imran Ali",
}: {
  items: StockItemView[];
  restocks: RestockView[];
  managerName?: string;
}) {
  const router = useRouter();
  const [stockItems, setStockItems] = useState<StockItemView[]>(items);
  const [restockList, setRestockList] = useState<RestockView[]>(restocks);
  const [tab, setTab] = useState<"current" | "low" | "restock">("current");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "qty_asc" | "qty_desc" | "urgency">("name");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItemView | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeRestockItem, setActiveRestockItem] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(stockItems.map((i) => i.category.toLowerCase()))];
    return ["all", ...cats];
  }, [stockItems]);

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all" || sortBy !== "name";

  const q = query.trim().toLowerCase();
  const lowCount = stockItems.filter((i) => i.quantity <= i.reorderLevel).length;

  const tabs = [
    { id: "current" as const, label: "Current Stock", badge: null as number | null },
    { id: "low" as const, label: "Low Stock", badge: lowCount },
    { id: "restock" as const, label: "Restock Requests", badge: null as number | null },
  ];

  // Adjust stock via quick plus/minus
  async function handleAdjust(itemId: number, delta: number) {
    const item = stockItems.find((i) => i.id === itemId);
    if (!item || busyId === itemId) return;
    const next = Math.max(0, item.quantity + delta);
    if (next === item.quantity) return;

    setBusyId(itemId);
    setStockItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: next } : i))
    );

    try {
      const res = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, delta }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      // Revert if failed
      setStockItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: item.quantity } : i))
      );
    } finally {
      setBusyId(null);
    }
  }

  // Stock updated from Item Details Modal
  function handleStockUpdated(itemId: number, newQty: number, newReorder?: number) {
    setStockItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: newQty,
              reorderLevel: newReorder !== undefined ? newReorder : i.reorderLevel,
            }
          : i
      )
    );
    if (selectedItem?.id === itemId) {
      setSelectedItem((prev) =>
        prev
          ? {
              ...prev,
              quantity: newQty,
              reorderLevel: newReorder !== undefined ? newReorder : prev.reorderLevel,
            }
          : null
      );
    }
    router.refresh();
  }

  // Trigger Restock Request Modal from Item Details
  function handleRequestRestockFromDetails(itemName: string) {
    setActiveRestockItem(itemName);
  }

  // Filtered & Sorted Stock Items
  const filtered = useMemo(() => {
    if (tab === "restock") {
      return restockList.filter((r) => r.itemName.toLowerCase().includes(q));
    }

    let list = stockItems.filter((item) => {
      if (tab === "low" && item.quantity > item.reorderLevel) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter !== "all" && item.category.toLowerCase() !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        const s = statusOf(item.quantity, item.reorderLevel);
        if (statusFilter === "sufficient" && s !== "Sufficient") return false;
        if (statusFilter === "low" && s !== "Low Stock") return false;
        if (statusFilter === "critical" && s !== "Critical") return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === "qty_asc") {
      list = [...list].sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === "qty_desc") {
      list = [...list].sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === "urgency") {
      list = [...list].sort(
        (a, b) => a.quantity / Math.max(1, a.reorderLevel) - b.quantity / Math.max(1, b.reorderLevel)
      );
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [stockItems, restockList, tab, q, categoryFilter, statusFilter, sortBy]);

  return (
    <div>
      {/* Top Tabs */}
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

      {/* Search Bar & 3-Lines Filter Button */}
      <div className="mt-4 flex gap-2.5 px-5">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-channel">
          <IconSearch className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items by name or category..."
            aria-label="Search stock items"
            className="w-full bg-transparent text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 text-[12px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Functioning 3-Lines Filter & Sort Button */}
        <button
          type="button"
          aria-label="Open filter & sort menu"
          onClick={() => setFilterDrawerOpen(true)}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
            hasActiveFilters
              ? "bg-sky-50 border-channel text-channel shadow-xs"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
          }`}
        >
          <IconMenu className="h-[20px] w-[20px]" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-channel ring-2 ring-white" />
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-5">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase">Filters:</span>
          {categoryFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
              {categoryFilter}
              <button type="button" onClick={() => setCategoryFilter("all")}>✕</button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              {statusFilter}
              <button type="button" onClick={() => setStatusFilter("all")}>✕</button>
            </span>
          )}
          {sortBy !== "name" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
              Sorted: {sortBy}
              <button type="button" onClick={() => setSortBy("name")}>✕</button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("all");
              setStatusFilter("all");
              setSortBy("name");
            }}
            className="text-[11px] font-bold text-channel hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Items List */}
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
            <StockRow
              key={(row as StockItemView).id}
              item={row as StockItemView}
              onSelect={() => setSelectedItem(row as StockItemView)}
              onAdjust={(delta) => handleAdjust((row as StockItemView).id, delta)}
              busy={busyId === (row as StockItemView).id}
            />
          )
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-500">
              {tab === "restock" ? "No restock requests yet" : "No items found"}
            </p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {tab === "restock"
                ? "Requests you send will appear here."
                : "Try adjusting search or filters."}
            </p>
          </div>
        )}
      </div>

      {/* Item Details Interactive Modal (Matching Screenshot) */}
      <StockDetailsModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        managerName={managerName}
        onRequestRestock={handleRequestRestockFromDetails}
        onStockUpdated={handleStockUpdated}
      />

      {/* Restock Pre-Filled Trigger from Item Details */}
      {activeRestockItem && (
        <RequestRestockButton
          itemNames={stockItems.map((i) => i.name)}
          initialItem={activeRestockItem}
          initialOpen={true}
          onModalClosed={() => setActiveRestockItem(null)}
        />
      )}

      {/* Interactive 3-Lines Filter & Sort Bottom Sheet / Drawer */}
      {filterDrawerOpen && (
        <div
          onClick={() => setFilterDrawerOpen(false)}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filter and Sort Stock"
            className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IconFilter className="h-5 w-5 text-channel" />
                <h3 className="font-display text-[17px] font-bold text-ink">Filter &amp; Sort Stock</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-xl px-3 py-1.5 text-[12px] font-bold capitalize transition ${
                      categoryFilter === cat
                        ? "bg-channel text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Level Filter */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Stock Status
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Levels" },
                  { id: "sufficient", label: "✓ In Stock / Sufficient" },
                  { id: "low", label: "⚠️ Low Stock (< Reorder)" },
                  { id: "critical", label: "🚨 Critical (< 50%)" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStatusFilter(id)}
                    className={`rounded-xl p-2 text-left text-[11.5px] font-bold transition ${
                      statusFilter === id
                        ? "bg-sky-50 border border-channel text-channel"
                        : "bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sort Items By
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "name", label: "Name (A → Z)" },
                  { id: "urgency", label: "Most Urgent First" },
                  { id: "qty_asc", label: "Quantity: Lowest First" },
                  { id: "qty_desc", label: "Quantity: Highest First" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSortBy(id as typeof sortBy)}
                    className={`rounded-xl p-2 text-left text-[11.5px] font-bold transition ${
                      sortBy === id
                        ? "bg-purple-50 border border-purple-500 text-purple-700"
                        : "bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setSortBy("name");
                }}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 h-11 rounded-xl bg-channel text-[13px] font-bold text-white shadow-md shadow-channel/20"
              >
                Apply ({filtered.length} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
