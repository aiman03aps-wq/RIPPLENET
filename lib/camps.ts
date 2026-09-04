import { haversineKm } from "./geo";
import { findDistrict, nearestDistrict } from "./pakistan-districts";

export interface CampRecord {
  id: number;
  name: string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  phone: string;
  capacity: number;
  occupancy: number;
  status: "open" | "near_capacity" | "full";
  distanceKm?: number | null;
  requestCount?: number;
}

export const DEFAULT_PAKISTAN_CAMPS: CampRecord[] = [
  // --- Rawalpindi & Islamabad (Federal / North Punjab) ---
  {
    id: 101,
    name: "Alkhidmat Relief Camp - Rawalpindi (Liaquat Bagh)",
    district: "Rawalpindi",
    province: "Punjab",
    lat: 33.5973,
    lng: 73.0645,
    phone: "051 5551234",
    capacity: 500,
    occupancy: 280,
    status: "open",
  },
  {
    id: 102,
    name: "Alkhidmat Health & Relief Base - Rawalpindi (Chaklala)",
    district: "Rawalpindi",
    province: "Punjab",
    lat: 33.585,
    lng: 73.09,
    phone: "051 5555678",
    capacity: 350,
    occupancy: 190,
    status: "open",
  },
  {
    id: 103,
    name: "Alkhidmat Relief Camp - Islamabad (I-8 / Expressway)",
    district: "Islamabad",
    province: "Punjab",
    lat: 33.6687,
    lng: 73.0768,
    phone: "051 8443322",
    capacity: 450,
    occupancy: 210,
    status: "open",
  },
  {
    id: 104,
    name: "Alkhidmat Medical Disaster Unit - Islamabad (G-9 Markaz)",
    district: "Islamabad",
    province: "Punjab",
    lat: 33.6912,
    lng: 73.0305,
    phone: "051 8449900",
    capacity: 300,
    occupancy: 120,
    status: "open",
  },
  {
    id: 105,
    name: "Alkhidmat Relief Desk - Taxila / Wah Cantt",
    district: "Rawalpindi",
    province: "Punjab",
    lat: 33.7438,
    lng: 72.8028,
    phone: "051 4901122",
    capacity: 250,
    occupancy: 95,
    status: "open",
  },
  {
    id: 106,
    name: "Alkhidmat Relief Base - Murree (Mall Road)",
    district: "Murree",
    province: "Punjab",
    lat: 33.907,
    lng: 73.3943,
    phone: "051 3771122",
    capacity: 250,
    occupancy: 110,
    status: "open",
  },
  {
    id: 107,
    name: "Alkhidmat Relief Camp - Attock (Kamra Road)",
    district: "Attock",
    province: "Punjab",
    lat: 33.7667,
    lng: 72.3667,
    phone: "057 2611223",
    capacity: 300,
    occupancy: 140,
    status: "open",
  },

  // --- Khyber Pakhtunkhwa & Adjacent North ---
  {
    id: 201,
    name: "Alkhidmat Relief Camp - Haripur",
    district: "Haripur",
    province: "Khyber Pakhtunkhwa",
    lat: 33.9944,
    lng: 72.9333,
    phone: "0995 611223",
    capacity: 300,
    occupancy: 140,
    status: "open",
  },
  {
    id: 202,
    name: "Alkhidmat Relief Camp - Abbottabad (Mansehra Rd)",
    district: "Abbottabad",
    province: "Khyber Pakhtunkhwa",
    lat: 34.1688,
    lng: 73.2215,
    phone: "0992 381122",
    capacity: 350,
    occupancy: 175,
    status: "open",
  },
  {
    id: 203,
    name: "Alkhidmat Relief Camp - Mansehra",
    district: "Mansehra",
    province: "Khyber Pakhtunkhwa",
    lat: 34.33,
    lng: 73.2,
    phone: "0997 301122",
    capacity: 300,
    occupancy: 130,
    status: "open",
  },
  {
    id: 204,
    name: "Alkhidmat Relief Camp - Peshawar (University Rd)",
    district: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    lat: 34.0151,
    lng: 71.5249,
    phone: "091 5841234",
    capacity: 600,
    occupancy: 410,
    status: "open",
  },
  {
    id: 205,
    name: "Alkhidmat Relief Camp - Nowshera (Kabul River Sector)",
    district: "Nowshera",
    province: "Khyber Pakhtunkhwa",
    lat: 34.0153,
    lng: 71.9747,
    phone: "0923 611223",
    capacity: 500,
    occupancy: 390,
    status: "open",
  },
  {
    id: 206,
    name: "Alkhidmat Relief Camp - Charsadda",
    district: "Charsadda",
    province: "Khyber Pakhtunkhwa",
    lat: 34.1453,
    lng: 71.7308,
    phone: "091 6511223",
    capacity: 400,
    occupancy: 290,
    status: "open",
  },
  {
    id: 207,
    name: "Alkhidmat Relief Camp - Swat (Mingora Bypass)",
    district: "Swat (Mingora)",
    province: "Khyber Pakhtunkhwa",
    lat: 34.7795,
    lng: 72.3614,
    phone: "0946 711223",
    capacity: 450,
    occupancy: 310,
    status: "open",
  },
  {
    id: 208,
    name: "Alkhidmat Relief Camp - Buner",
    district: "Buner",
    province: "Khyber Pakhtunkhwa",
    lat: 34.5117,
    lng: 72.4814,
    phone: "0939 511223",
    capacity: 250,
    occupancy: 110,
    status: "open",
  },
  {
    id: 209,
    name: "Alkhidmat Relief Camp - Dera Ismail Khan",
    district: "Dera Ismail Khan",
    province: "Khyber Pakhtunkhwa",
    lat: 31.8313,
    lng: 70.9017,
    phone: "0966 711223",
    capacity: 350,
    occupancy: 215,
    status: "open",
  },

  // --- Central & South Punjab ---
  {
    id: 301,
    name: "Alkhidmat Relief Camp - Lahore (Model Town / Ferozepur Rd)",
    district: "Lahore",
    province: "Punjab",
    lat: 31.48,
    lng: 74.32,
    phone: "042 35881234",
    capacity: 700,
    occupancy: 420,
    status: "open",
  },
  {
    id: 302,
    name: "Alkhidmat Relief Camp - Faisalabad (Jhang Rd)",
    district: "Faisalabad",
    province: "Punjab",
    lat: 31.4187,
    lng: 73.0791,
    phone: "041 8761234",
    capacity: 500,
    occupancy: 290,
    status: "open",
  },
  {
    id: 303,
    name: "Alkhidmat Relief Camp - Multan (Bosan Rd)",
    district: "Multan",
    province: "Punjab",
    lat: 30.1978,
    lng: 71.4697,
    phone: "061 6211234",
    capacity: 550,
    occupancy: 380,
    status: "open",
  },
  {
    id: 304,
    name: "Alkhidmat Relief Camp - Gujranwala (GT Road)",
    district: "Gujranwala",
    province: "Punjab",
    lat: 32.1877,
    lng: 74.1945,
    phone: "055 3821234",
    capacity: 400,
    occupancy: 230,
    status: "open",
  },
  {
    id: 305,
    name: "Alkhidmat Relief Camp - Sialkot (Daska Rd)",
    district: "Sialkot",
    province: "Punjab",
    lat: 32.4945,
    lng: 74.5229,
    phone: "052 4261234",
    capacity: 350,
    occupancy: 180,
    status: "open",
  },
  {
    id: 306,
    name: "Alkhidmat Relief Camp - Dera Ghazi Khan",
    district: "Dera Ghazi Khan",
    province: "Punjab",
    lat: 30.0489,
    lng: 70.6463,
    phone: "064 2461234",
    capacity: 500,
    occupancy: 395,
    status: "open",
  },
  {
    id: 307,
    name: "Alkhidmat Relief Camp - Rajanpur (Indus Basin)",
    district: "Rajanpur",
    province: "Punjab",
    lat: 29.1053,
    lng: 70.3304,
    phone: "0604 681234",
    capacity: 450,
    occupancy: 410,
    status: "open",
  },
  {
    id: 308,
    name: "Alkhidmat Relief Camp - Muzaffargarh",
    district: "Muzaffargarh",
    province: "Punjab",
    lat: 30.0736,
    lng: 71.1804,
    phone: "066 2421234",
    capacity: 400,
    occupancy: 280,
    status: "open",
  },

  // --- Sindh ---
  {
    id: 401,
    name: "Alkhidmat Relief Camp - Karachi (Central / Gulshan)",
    district: "Karachi",
    province: "Sindh",
    lat: 24.918,
    lng: 67.0971,
    phone: "021 34991234",
    capacity: 800,
    occupancy: 530,
    status: "open",
  },
  {
    id: 402,
    name: "Alkhidmat Relief Camp - Hyderabad (Qasimabad)",
    district: "Hyderabad",
    province: "Sindh",
    lat: 25.396,
    lng: 68.3578,
    phone: "022 2651234",
    capacity: 500,
    occupancy: 320,
    status: "open",
  },
  {
    id: 403,
    name: "Alkhidmat Relief Camp - Badin (Talhar Road)",
    district: "Badin",
    province: "Sindh",
    lat: 24.6561,
    lng: 68.8368,
    phone: "0297 861234",
    capacity: 450,
    occupancy: 380,
    status: "open",
  },
  {
    id: 404,
    name: "Alkhidmat Relief Camp - Thatta (Sujawal Bypass)",
    district: "Thatta",
    province: "Sindh",
    lat: 24.7461,
    lng: 67.9243,
    phone: "0298 551234",
    capacity: 350,
    occupancy: 260,
    status: "open",
  },
  {
    id: 405,
    name: "Alkhidmat Relief Camp - Sukkur (Barrage Colony)",
    district: "Sukkur",
    province: "Sindh",
    lat: 27.7052,
    lng: 68.8574,
    phone: "071 5621234",
    capacity: 600,
    occupancy: 480,
    status: "open",
  },
  {
    id: 406,
    name: "Alkhidmat Relief Camp - Larkana (Airport Rd)",
    district: "Larkana",
    province: "Sindh",
    lat: 27.559,
    lng: 68.2121,
    phone: "074 4751234",
    capacity: 400,
    occupancy: 310,
    status: "open",
  },
  {
    id: 407,
    name: "Alkhidmat Relief Camp - Dadu (Indus Highway)",
    district: "Dadu",
    province: "Sindh",
    lat: 26.7319,
    lng: 67.7761,
    phone: "025 4611234",
    capacity: 400,
    occupancy: 340,
    status: "open",
  },

  // --- Balochistan ---
  {
    id: 501,
    name: "Alkhidmat Relief Camp - Quetta (Satellite Town)",
    district: "Quetta",
    province: "Balochistan",
    lat: 30.1798,
    lng: 66.975,
    phone: "081 2821234",
    capacity: 500,
    occupancy: 310,
    status: "open",
  },
  {
    id: 502,
    name: "Alkhidmat Relief Camp - Jaffarabad (Dera Allah Yar)",
    district: "Jaffarabad",
    province: "Balochistan",
    lat: 28.9417,
    lng: 68.31,
    phone: "0838 510123",
    capacity: 350,
    occupancy: 290,
    status: "open",
  },
  {
    id: 503,
    name: "Alkhidmat Relief Camp - Naseerabad",
    district: "Naseerabad",
    province: "Balochistan",
    lat: 30.1372,
    lng: 67.9117,
    phone: "0838 710123",
    capacity: 300,
    occupancy: 220,
    status: "open",
  },
  {
    id: 504,
    name: "Alkhidmat Relief Camp - Gwadar (Coastal Base)",
    district: "Gwadar",
    province: "Balochistan",
    lat: 25.1264,
    lng: 62.3225,
    phone: "086 4211234",
    capacity: 250,
    occupancy: 120,
    status: "open",
  },
];

export function mergeCamps(dbCamps?: any[]): CampRecord[] {
  const map = new Map<string, CampRecord>();

  // 1. Add catalog defaults
  for (const c of DEFAULT_PAKISTAN_CAMPS) {
    map.set(`${c.district.toLowerCase()}__${c.name.toLowerCase()}`, { ...c });
  }

  // 2. Overlay / add DB camps if provided
  if (Array.isArray(dbCamps) && dbCamps.length > 0) {
    for (const c of dbCamps) {
      if (!c || !c.name) continue;
      const key = `${(c.district || "").toLowerCase()}__${c.name.toLowerCase()}`;
      map.set(key, {
        id: c.id ?? map.get(key)?.id ?? Date.now(),
        name: c.name,
        district: c.district || "Regional",
        province: c.province || "Pakistan",
        lat: Number(c.lat) || 33.5973,
        lng: Number(c.lng) || 73.0645,
        phone: c.phone || "0800 22677",
        capacity: Number(c.capacity) || 300,
        occupancy: Number(c.occupancy) || 100,
        status: (c.status as any) || "open",
        requestCount: c._count?.requests ?? 0,
      });
    }
  }

  return Array.from(map.values());
}

export function findNearestCamp(
  lat: number,
  lng: number,
  dbCamps?: any[]
): { camp: CampRecord; distanceKm: number } {
  const all = mergeCamps(dbCamps);
  let best = all[0];
  let bestDist = Infinity;

  for (const c of all) {
    const dist = haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng });
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  return {
    camp: {
      ...best,
      distanceKm: Math.round(bestDist * 10) / 10,
    },
    distanceKm: Math.round(bestDist * 10) / 10,
  };
}

export function getNearbyCamps(
  lat: number,
  lng: number,
  limit = 10,
  dbCamps?: any[]
): CampRecord[] {
  const all = mergeCamps(dbCamps);
  const withDistance = all.map((c) => ({
    ...c,
    distanceKm: Math.round(haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng }) * 10) / 10,
  }));

  return withDistance.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)).slice(0, limit);
}

export function getCampForDistrict(
  districtName?: string,
  userLat?: number,
  userLng?: number,
  dbCamps?: any[]
): CampRecord {
  const all = mergeCamps(dbCamps);

  if (districtName) {
    const lower = districtName.toLowerCase().trim();
    const exact = all.find(
      (c) =>
        c.district.toLowerCase() === lower ||
        c.name.toLowerCase().includes(lower) ||
        lower.includes(c.district.toLowerCase())
    );
    if (exact) return exact;

    const district = findDistrict(districtName);
    if (district) {
      return findNearestCamp(district.lat, district.lng, dbCamps).camp;
    }
  }

  if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
    return findNearestCamp(userLat!, userLng!, dbCamps).camp;
  }

  return all[0];
}

export function getNearbyDistricts(districtName: string): string[] {
  const norm = districtName.toLowerCase().trim();
  const districtObj = findDistrict(districtName);

  const regionMaps: Record<string, string[]> = {
    rawalpindi: ["Rawalpindi", "Islamabad", "Murree", "Attock", "Chakwal", "Jhelum", "Haripur"],
    islamabad: ["Islamabad", "Rawalpindi", "Murree", "Attock", "Haripur"],
    murree: ["Murree", "Rawalpindi", "Islamabad", "Abbottabad", "Haripur"],
    attock: ["Attock", "Rawalpindi", "Islamabad", "Haripur", "Swabi", "Nowshera"],
    lahore: ["Lahore", "Kasur", "Gujranwala", "Sheikhupura", "Sialkot", "Faisalabad"],
    faisalabad: ["Faisalabad", "Jhang", "Chiniot", "Toba Tek Singh", "Lahore", "Sargodha"],
    multan: ["Multan", "Muzaffargarh", "Khanewal", "Lodhran", "Bahawalpur", "Sahiwal"],
    gujranwala: ["Gujranwala", "Sialkot", "Lahore", "Gujrat", "Hafizabad"],
    sialkot: ["Sialkot", "Gujranwala", "Narowal", "Lahore"],
    nowshera: ["Nowshera", "Charsadda", "Peshawar", "Mardan", "Swabi", "Haripur"],
    peshawar: ["Peshawar", "Nowshera", "Charsadda", "Mardan", "Kohat", "Khyber"],
    charsadda: ["Charsadda", "Nowshera", "Peshawar", "Mardan", "Swat (Mingora)"],
    "swat (mingora)": ["Swat (Mingora)", "Swat", "Buner", "Malakand", "Lower Dir", "Upper Dir"],
    swat: ["Swat", "Swat (Mingora)", "Buner", "Malakand", "Lower Dir", "Upper Dir"],
    buner: ["Buner", "Swat (Mingora)", "Swabi", "Mardan", "Malakand"],
    abbottabad: ["Abbottabad", "Haripur", "Mansehra", "Murree", "Rawalpindi"],
    haripur: ["Haripur", "Abbottabad", "Rawalpindi", "Islamabad", "Attock", "Swabi"],
    badin: ["Badin", "Thatta", "Sujawal", "Tando Muhammad Khan", "Hyderabad", "Mirpur Khas"],
    thatta: ["Thatta", "Sujawal", "Badin", "Karachi", "Hyderabad"],
    sujawal: ["Sujawal", "Thatta", "Badin", "Tando Muhammad Khan"],
    sukkur: ["Sukkur", "Larkana", "Khairpur", "Shikarpur", "Jacobabad", "Ghotki"],
    larkana: ["Larkana", "Sukkur", "Shikarpur", "Jacobabad", "Dadu", "Khairpur"],
    dadu: ["Dadu", "Larkana", "Jamshoro", "Hyderabad"],
    hyderabad: ["Hyderabad", "Matiari", "Tando Allahyar", "Badin", "Thatta", "Jamshoro"],
    karachi: ["Karachi", "Thatta", "Hub"],
    quetta: ["Quetta", "Pishin", "Chaman", "Mastung", "Kalat", "Sibi"],
    jaffarabad: ["Jaffarabad", "Naseerabad", "Jacobabad", "Sibi"],
    naseerabad: ["Naseerabad", "Jaffarabad", "Sibi", "Jhal Magsi"],
    gwadar: ["Gwadar", "Turbat", "Kech (Turbat)", "Pasni"],
    "dera ghazi khan": ["Dera Ghazi Khan", "Rajanpur", "Muzaffargarh", "Layyah"],
    rajanpur: ["Rajanpur", "Dera Ghazi Khan", "Muzaffargarh", "Rahim Yar Khan"],
    muzaffargarh: ["Muzaffargarh", "Multan", "Dera Ghazi Khan", "Rajanpur"],
  };

  if (regionMaps[norm]) {
    return regionMaps[norm];
  }

  for (const [k, arr] of Object.entries(regionMaps)) {
    if (norm.includes(k) || k.includes(norm)) return arr;
  }

  return [districtName];
}

export function getMockRequestsForCamp(camp: CampRecord): any[] {
  const dist = camp.district;
  const isRwp = /rawalpindi|islamabad|murree|attock/i.test(dist);
  const isNowshera = /nowshera|peshawar|charsadda|mardan|swat|kpk/i.test(dist);
  const isBadin = /badin|thatta|sujawal|sindh/i.test(dist);
  const isLahore = /lahore|kasur|faisalabad|gujranwala|sialkot/i.test(dist);
  const isSukkur = /sukkur|larkana|dadu|jacobabad/i.test(dist);

  if (isRwp) {
    return [
      {
        id: 1001,
        code: "RIP-2026-00001",
        citizenName: "Ghulam Hussain",
        phone: "0300 8765432",
        type: "medical",
        priority: "critical",
        needs: JSON.stringify(["High Fever", "Water Purification Tabs", "Children Under 5"]),
        district: "Rawalpindi",
        lat: 33.5973,
        lng: 73.0645,
        location: "Liaquat Bagh, Murree Road, Rawalpindi",
        peopleCount: 4,
        status: "in_transit",
        createdAt: new Date(Date.now() - 3600000 * 3),
        campId: camp.id,
      },
      {
        id: 1002,
        code: "RIP-2026-00002",
        citizenName: "Fatima Bibi",
        phone: "0333 5556661",
        type: "food",
        priority: "high",
        needs: JSON.stringify(["Food Packs", "Clean Water Rations"]),
        district: "Rawalpindi",
        lat: 33.585,
        lng: 73.09,
        location: "Nullah Lai Overflow Sector, Raja Bazaar, Rawalpindi",
        peopleCount: 6,
        status: "assigned",
        createdAt: new Date(Date.now() - 3600000 * 5),
        campId: camp.id,
      },
      {
        id: 1003,
        code: "RIP-2026-00003",
        citizenName: "Allah Dino",
        phone: "0345 1112223",
        type: "water",
        priority: "high",
        needs: JSON.stringify(["Clean Water", "Emergency Shelter Kit"]),
        district: "Islamabad",
        lat: 33.6687,
        lng: 73.0768,
        location: "I-8 Sector / Expressway Inundation Zone, Islamabad",
        peopleCount: 8,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 1),
        campId: camp.id,
      },
      {
        id: 1004,
        code: "RIP-2026-00004",
        citizenName: "Zarina Khatoon",
        phone: "0311 4445556",
        type: "shelter",
        priority: "medium",
        needs: JSON.stringify(["Emergency Tent", "Warm Blankets"]),
        district: "Rawalpindi",
        lat: 33.61,
        lng: 73.08,
        location: "Dhok Kala Khan, Rawalpindi",
        peopleCount: 5,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 8),
        campId: camp.id,
      },
      {
        id: 1005,
        code: "RIP-2026-00005",
        citizenName: "Muhammad Yousuf",
        phone: "0302 7778889",
        type: "medical",
        priority: "critical",
        needs: JSON.stringify(["High Fever", "Diarrhea", "Elderly Patient Aid"]),
        district: "Rawalpindi",
        lat: 33.59,
        lng: 73.05,
        location: "Saddar / Commercial Market, Rawalpindi",
        peopleCount: 3,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 2),
        campId: camp.id,
      },
    ];
  }

  if (isNowshera) {
    return [
      {
        id: 2001,
        code: "RIP-2026-00010",
        citizenName: "Bashir Ahmed",
        phone: "0333 5556661",
        type: "rescue",
        priority: "critical",
        needs: JSON.stringify(["Boat Rescue", "Clean Water"]),
        district: "Nowshera",
        lat: 34.0153,
        lng: 71.9747,
        location: "Kabul River Sector, Nowshera",
        peopleCount: 6,
        status: "assigned",
        createdAt: new Date(Date.now() - 3600000 * 2),
        campId: camp.id,
      },
      {
        id: 2002,
        code: "RIP-2026-00011",
        citizenName: "Haleeman Bibi",
        phone: "0313 9990001",
        type: "food",
        priority: "high",
        needs: JSON.stringify(["Food Packs", "Dry Rations"]),
        district: "Nowshera",
        lat: 33.99,
        lng: 71.85,
        location: "Pabbi, GT Road Bypass, Nowshera",
        peopleCount: 7,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 4),
        campId: camp.id,
      },
      {
        id: 2003,
        code: "RIP-2026-00012",
        citizenName: "Farooq Shah",
        phone: "0321 4445566",
        type: "water",
        priority: "critical",
        needs: JSON.stringify(["Water Purification Tabs", "First Aid Kit"]),
        district: "Charsadda",
        lat: 34.1453,
        lng: 71.7308,
        location: "Charsadda Riverbank Sector",
        peopleCount: 4,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 1),
        campId: camp.id,
      },
    ];
  }

  if (isLahore) {
    return [
      {
        id: 3001,
        code: "RIP-2026-00030",
        citizenName: "Tariq Mehmood",
        phone: "0300 1234567",
        type: "medical",
        priority: "critical",
        needs: JSON.stringify(["High Fever", "Medical First Aid"]),
        district: "Lahore",
        lat: 31.48,
        lng: 74.32,
        location: "Model Town, Ferozepur Road, Lahore",
        peopleCount: 4,
        status: "assigned",
        createdAt: new Date(Date.now() - 3600000 * 2),
        campId: camp.id,
      },
      {
        id: 3002,
        code: "RIP-2026-00031",
        citizenName: "Nasreen Akhtar",
        phone: "0321 7654321",
        type: "food",
        priority: "high",
        needs: JSON.stringify(["Food Packs", "Clean Water"]),
        district: "Lahore",
        lat: 31.62,
        lng: 74.28,
        location: "Shahdara, Ravi River Basin, Lahore",
        peopleCount: 5,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 3),
        campId: camp.id,
      },
    ];
  }

  // Default / Sindh / Badin / Sukkur / Other
  return [
    {
      id: 4001,
      code: "RIP-2026-00020",
      citizenName: "Abdul Rehman",
      phone: "0300 4447778",
      type: "rescue",
      priority: "critical",
      needs: JSON.stringify(["Rescue Boat / Kashti", "Clean Water"]),
      district: camp.district,
      lat: camp.lat + 0.02,
      lng: camp.lng + 0.02,
      location: `${camp.district} Relief Zone, Sector 2`,
      peopleCount: 5,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 2),
      campId: camp.id,
    },
    {
      id: 4002,
      code: "RIP-2026-00021",
      citizenName: "Saima",
      phone: "0345 3336669",
      type: "water",
      priority: "high",
      needs: JSON.stringify(["Clean Water Rations", "Water Kits"]),
      district: camp.district,
      lat: camp.lat - 0.015,
      lng: camp.lng + 0.01,
      location: `${camp.district} District Center, Block 4`,
      peopleCount: 4,
      status: "assigned",
      createdAt: new Date(Date.now() - 3600000 * 4),
      campId: camp.id,
    },
    {
      id: 4003,
      code: "RIP-2026-00022",
      citizenName: "Karim Bux",
      phone: "0312 9988776",
      type: "medical",
      priority: "critical",
      needs: JSON.stringify(["High Fever", "Diarrhea", "Elderly Patient"]),
      district: camp.district,
      lat: camp.lat + 0.03,
      lng: camp.lng - 0.02,
      location: `${camp.district} River Outskirts Sector`,
      peopleCount: 3,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 1),
      campId: camp.id,
    },
  ];
}
