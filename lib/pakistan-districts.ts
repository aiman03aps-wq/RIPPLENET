export interface District {
  name: string;
  province: "Punjab" | "Sindh" | "Balochistan" | "Khyber Pakhtunkhwa";
  lat: number;
  lng: number;
  // Static flood-proneness weight 0-1 based on geography (riverine, coastal,
  // low-lying basins) used as the base of the live risk score.
  floodWeight: number;
}

export const pakistanDistricts: District[] = [
  // Punjab
  { name: "Lahore", province: "Punjab", lat: 31.5497, lng: 74.3436, floodWeight: 0.2 },
  { name: "Faisalabad", province: "Punjab", lat: 31.4187, lng: 73.0791, floodWeight: 0.2 },
  { name: "Multan", province: "Punjab", lat: 30.1575, lng: 71.5249, floodWeight: 0.4 },
  { name: "Rawalpindi", province: "Punjab", lat: 33.5651, lng: 73.0169, floodWeight: 0.3 },
  { name: "Gujranwala", province: "Punjab", lat: 32.1877, lng: 74.1945, floodWeight: 0.2 },
  { name: "Sargodha", province: "Punjab", lat: 32.0836, lng: 72.6711, floodWeight: 0.3 },
  { name: "Sialkot", province: "Punjab", lat: 32.4945, lng: 74.5229, floodWeight: 0.3 },
  { name: "Bahawalpur", province: "Punjab", lat: 29.3956, lng: 71.6836, floodWeight: 0.3 },
  { name: "Sahiwal", province: "Punjab", lat: 30.6682, lng: 73.1114, floodWeight: 0.3 },
  { name: "Dera Ghazi Khan", province: "Punjab", lat: 30.0489, lng: 70.6463, floodWeight: 0.8 },
  { name: "Rajanpur", province: "Punjab", lat: 29.1053, lng: 70.3304, floodWeight: 0.85 },
  { name: "Muzaffargarh", province: "Punjab", lat: 30.0736, lng: 71.1804, floodWeight: 0.8 },
  { name: "Rahim Yar Khan", province: "Punjab", lat: 28.4202, lng: 70.2952, floodWeight: 0.5 },
  { name: "Jhang", province: "Punjab", lat: 31.2781, lng: 72.3317, floodWeight: 0.4 },
  { name: "Kasur", province: "Punjab", lat: 31.1187, lng: 74.4505, floodWeight: 0.3 },
  { name: "Mianwali", province: "Punjab", lat: 32.5839, lng: 71.537, floodWeight: 0.4 },

  // Sindh
  { name: "Karachi", province: "Sindh", lat: 24.8607, lng: 67.0011, floodWeight: 0.3 },
  { name: "Hyderabad", province: "Sindh", lat: 25.396, lng: 68.3578, floodWeight: 0.4 },
  { name: "Sukkur", province: "Sindh", lat: 27.7052, lng: 68.8574, floodWeight: 0.6 },
  { name: "Larkana", province: "Sindh", lat: 27.559, lng: 68.2121, floodWeight: 0.75 },
  { name: "Badin", province: "Sindh", lat: 24.6561, lng: 68.8368, floodWeight: 0.9 },
  { name: "Thatta", province: "Sindh", lat: 24.7461, lng: 67.9243, floodWeight: 0.9 },
  { name: "Sujawal", province: "Sindh", lat: 24.6939, lng: 68.3247, floodWeight: 0.9 },
  { name: "Mirpur Khas", province: "Sindh", lat: 25.5276, lng: 69.0129, floodWeight: 0.6 },
  { name: "Shaheed Benazirabad", province: "Sindh", lat: 26.2442, lng: 68.41, floodWeight: 0.5 },
  { name: "Jacobabad", province: "Sindh", lat: 28.2769, lng: 68.4514, floodWeight: 0.85 },
  { name: "Shikarpur", province: "Sindh", lat: 27.9552, lng: 68.6382, floodWeight: 0.8 },
  { name: "Dadu", province: "Sindh", lat: 26.7319, lng: 67.7761, floodWeight: 0.85 },
  { name: "Khairpur", province: "Sindh", lat: 27.5295, lng: 68.7592, floodWeight: 0.6 },
  { name: "Sanghar", province: "Sindh", lat: 26.047, lng: 68.9494, floodWeight: 0.7 },
  { name: "Umerkot", province: "Sindh", lat: 25.3614, lng: 69.7361, floodWeight: 0.6 },
  { name: "Tando Allahyar", province: "Sindh", lat: 25.4603, lng: 68.7178, floodWeight: 0.5 },
  { name: "Matiari", province: "Sindh", lat: 25.597, lng: 68.446, floodWeight: 0.5 },
  { name: "Tando Muhammad Khan", province: "Sindh", lat: 25.1207, lng: 68.6689, floodWeight: 0.6 },

  // Balochistan
  { name: "Quetta", province: "Balochistan", lat: 30.1798, lng: 66.975, floodWeight: 0.1 },
  { name: "Gwadar", province: "Balochistan", lat: 25.1264, lng: 62.3225, floodWeight: 0.2 },
  { name: "Kech (Turbat)", province: "Balochistan", lat: 26.0031, lng: 63.0544, floodWeight: 0.2 },
  { name: "Khuzdar", province: "Balochistan", lat: 27.7999, lng: 66.6222, floodWeight: 0.2 },
  { name: "Chaman", province: "Balochistan", lat: 30.9217, lng: 66.4517, floodWeight: 0.1 },
  { name: "Sibi", province: "Balochistan", lat: 29.543, lng: 67.8773, floodWeight: 0.4 },
  { name: "Jaffarabad", province: "Balochistan", lat: 28.9417, lng: 68.31, floodWeight: 0.85 },
  { name: "Naseerabad", province: "Balochistan", lat: 30.1372, lng: 67.9117, floodWeight: 0.8 },
  { name: "Zhob", province: "Balochistan", lat: 31.3411, lng: 69.4486, floodWeight: 0.2 },
  { name: "Loralai", province: "Balochistan", lat: 30.3705, lng: 68.598, floodWeight: 0.1 },
  { name: "Hub", province: "Balochistan", lat: 25.0186, lng: 66.8061, floodWeight: 0.2 },
  { name: "Kalat", province: "Balochistan", lat: 29.0264, lng: 66.5906, floodWeight: 0.2 },
  { name: "Panjgur", province: "Balochistan", lat: 26.9707, lng: 64.1014, floodWeight: 0.1 },
  { name: "Chagai (Dalbandin)", province: "Balochistan", lat: 28.8878, lng: 64.4069, floodWeight: 0.1 },
  { name: "Qila Saifullah", province: "Balochistan", lat: 30.7, lng: 68.35, floodWeight: 0.2 },
  { name: "Barkhan", province: "Balochistan", lat: 29.8978, lng: 69.525, floodWeight: 0.2 },
  { name: "Kohlu", province: "Balochistan", lat: 29.8953, lng: 69.2514, floodWeight: 0.2 },
  { name: "Awaran", province: "Balochistan", lat: 26.4567, lng: 65.2308, floodWeight: 0.1 },
  { name: "Kharan", province: "Balochistan", lat: 28.5842, lng: 65.4152, floodWeight: 0.1 },

  // Khyber Pakhtunkhwa
  { name: "Peshawar", province: "Khyber Pakhtunkhwa", lat: 34.0151, lng: 71.5249, floodWeight: 0.6 },
  { name: "Mardan", province: "Khyber Pakhtunkhwa", lat: 34.1989, lng: 72.0231, floodWeight: 0.5 },
  { name: "Swat (Mingora)", province: "Khyber Pakhtunkhwa", lat: 34.7795, lng: 72.3614, floodWeight: 0.7 },
  { name: "Abbottabad", province: "Khyber Pakhtunkhwa", lat: 34.1688, lng: 73.2215, floodWeight: 0.2 },
  { name: "Kohat", province: "Khyber Pakhtunkhwa", lat: 33.5869, lng: 71.4414, floodWeight: 0.3 },
  { name: "Dera Ismail Khan", province: "Khyber Pakhtunkhwa", lat: 31.8313, lng: 70.9017, floodWeight: 0.8 },
  { name: "Nowshera", province: "Khyber Pakhtunkhwa", lat: 34.0153, lng: 71.9747, floodWeight: 0.85 },
  { name: "Charsadda", province: "Khyber Pakhtunkhwa", lat: 34.1453, lng: 71.7308, floodWeight: 0.85 },
  { name: "Mansehra", province: "Khyber Pakhtunkhwa", lat: 34.33, lng: 73.2, floodWeight: 0.3 },
  { name: "Bannu", province: "Khyber Pakhtunkhwa", lat: 32.9889, lng: 70.6056, floodWeight: 0.4 },
  { name: "Haripur", province: "Khyber Pakhtunkhwa", lat: 33.9944, lng: 72.9333, floodWeight: 0.3 },
  { name: "Swabi", province: "Khyber Pakhtunkhwa", lat: 34.1203, lng: 72.47, floodWeight: 0.5 },
  { name: "Chitral", province: "Khyber Pakhtunkhwa", lat: 35.8511, lng: 71.7864, floodWeight: 0.6 },
  { name: "Upper Dir", province: "Khyber Pakhtunkhwa", lat: 35.2077, lng: 71.8768, floodWeight: 0.6 },
  { name: "Lower Dir", province: "Khyber Pakhtunkhwa", lat: 34.9054, lng: 71.7961, floodWeight: 0.5 },
  { name: "Hangu", province: "Khyber Pakhtunkhwa", lat: 33.5331, lng: 71.055, floodWeight: 0.3 },
  { name: "Tank", province: "Khyber Pakhtunkhwa", lat: 32.216, lng: 70.383, floodWeight: 0.8 },
  { name: "Buner", province: "Khyber Pakhtunkhwa", lat: 34.5117, lng: 72.4814, floodWeight: 0.5 },
  { name: "Malakand", province: "Khyber Pakhtunkhwa", lat: 34.5736, lng: 72.055, floodWeight: 0.7 },
  { name: "Kohistan", province: "Khyber Pakhtunkhwa", lat: 35.42, lng: 73.33, floodWeight: 0.6 },
];

export function findDistrict(name: string): District | undefined {
  const lower = name.toLowerCase();
  return pakistanDistricts.find(
    (d) => d.name.toLowerCase() === lower || d.name.toLowerCase().startsWith(lower)
  );
}

export function nearestDistrict(lat: number, lng: number): District {
  let best = pakistanDistricts[0];
  let bestDist = Infinity;
  for (const d of pakistanDistricts) {
    const dist = Math.hypot(d.lat - lat, d.lng - lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}
