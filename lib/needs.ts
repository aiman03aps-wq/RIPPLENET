export function parseNeeds(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* not JSON */
    }
    return raw ? [raw] : [];
  }
  return [];
}

export type DisplayPriority = "Critical" | "High" | "Medium" | "Low";

export function displayPriority(priority: string): DisplayPriority {
  if (priority === "critical") return "Critical";
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

export function formatDayTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export interface ParcelItem {
  name: string;
  qty: string;
}

const PARCEL_RULES: { match: RegExp; items: ParcelItem[] }[] = [
  {
    match: /fever|temperature|paracetamol|pain/i,
    items: [{ name: "Paracetamol (500mg)", qty: "20 tabs" }],
  },
  {
    match: /diarrhea|dehydration|ors|cholera/i,
    items: [
      { name: "RippleNet Water Purification Kit", qty: "1 unit" },
      { name: "ORS Sachets", qty: "10 sachets" },
      { name: "Zinc Tablets", qty: "10 tabs" },
    ],
  },
  {
    match: /water|thirst|drink|clean water|no clean water/i,
    items: [
      { name: "RippleNet Water Purification Kit", qty: "1 unit" },
      { name: "Water Purification Tabs", qty: "20 tabs" },
      { name: "Mineral Water (1.5L)", qty: "12 bottles" },
    ],
  },
  {
    match: /food|meal|hungry|nutrition/i,
    items: [{ name: "Family Food Pack", qty: "2 packs" }],
  },
  {
    match: /tent|shelter|blanket|roof/i,
    items: [
      { name: "Family Tent", qty: "1 unit" },
      { name: "Blankets", qty: "4 units" },
    ],
  },
  {
    match: /injur|wound|bleed|bandage|cut/i,
    items: [
      { name: "Antiseptic Liquid (100ml)", qty: "1 bottle" },
      { name: "Bandage Rolls", qty: "2 rolls" },
    ],
  },
  {
    match: /rescue|boat|stranded|evacuat|snake|drown/i,
    items: [
      { name: "Rescue Rope (20m)", qty: "1 coil" },
      { name: "Life Jackets", qty: "2 units" },
    ],
  },
  {
    match: /hygien|soap|sanitat|wash/i,
    items: [
      { name: "Hygiene Kit", qty: "1 kit" },
      { name: "Soap Bars", qty: "4 bars" },
    ],
  },
  {
    match: /pregnan|mother|newborn/i,
    items: [{ name: "Clean Delivery Kit", qty: "1 kit" }],
  },
  {
    match: /child|baby|infant|under 5/i,
    items: [{ name: "ORS Sachets", qty: "6 sachets" }],
  },
];

const TYPE_FALLBACK: Record<string, ParcelItem[]> = {
  medical: [
    { name: "Paracetamol (500mg)", qty: "20 tabs" },
    { name: "ORS Sachets", qty: "10 sachets" },
  ],
  food: [{ name: "Family Food Pack", qty: "2 packs" }],
  water: [
    { name: "RippleNet Water Purification Kit", qty: "1 unit" },
    { name: "Water Purification Tabs", qty: "20 tabs" },
  ],
  shelter: [
    { name: "Family Tent", qty: "1 unit" },
    { name: "Blankets", qty: "4 units" },
  ],
  rescue: [{ name: "Rescue Rope (20m)", qty: "1 coil" }],
};

export function suggestParcel(needs: string[], type: string): ParcelItem[] {
  const items: ParcelItem[] = [];
  const seen = new Set<string>();
  const push = (item: ParcelItem) => {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      items.push(item);
    }
  };
  for (const need of needs) {
    for (const rule of PARCEL_RULES) {
      if (rule.match.test(need)) rule.items.forEach(push);
    }
  }
  if (items.length === 0) {
    (TYPE_FALLBACK[type] ?? TYPE_FALLBACK.medical).forEach(push);
  }
  return items;
}
