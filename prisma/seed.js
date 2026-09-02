const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const daysAgo = (n, h = 0) => new Date(Date.now() - n * 86400000 - h * 3600000);

async function main() {
  await prisma.$transaction([
    prisma.restockRequest.deleteMany(),
    prisma.stockItem.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.request.deleteMany(),
    prisma.user.deleteMany(),
    prisma.camp.deleteMany(),
  ]);

  const camps = await Promise.all(
    [
      { name: "Alkhidmat Relief Camp", district: "Badin", province: "Sindh", lat: 24.6561, lng: 68.8368, phone: "0300 1234567", capacity: 400, occupancy: 312 },
      { name: "Alkhidmat Relief Camp", district: "Thatta", province: "Sindh", lat: 24.7461, lng: 67.9243, phone: "0300 2223331", capacity: 300, occupancy: 210 },
      { name: "Alkhidmat Relief Camp", district: "Larkana", province: "Sindh", lat: 27.559, lng: 68.2121, phone: "0300 2223332", capacity: 350, occupancy: 168 },
      { name: "Alkhidmat Relief Camp", district: "Sukkur", province: "Sindh", lat: 27.7052, lng: 68.8574, phone: "0300 2223333", capacity: 500, occupancy: 402 },
      { name: "Alkhidmat Relief Camp", district: "Hyderabad", province: "Sindh", lat: 25.396, lng: 68.3578, phone: "0300 2223334", capacity: 450, occupancy: 195 },
      { name: "Alkhidmat Relief Camp", district: "Dera Ghazi Khan", province: "Punjab", lat: 30.0489, lng: 70.6463, phone: "0300 2223335", capacity: 380, occupancy: 274 },
      { name: "Alkhidmat Relief Camp", district: "Rajanpur", province: "Punjab", lat: 29.1053, lng: 70.3304, phone: "0300 2223336", capacity: 260, occupancy: 231 },
      { name: "Alkhidmat Relief Camp", district: "Muzaffargarh", province: "Punjab", lat: 30.0736, lng: 71.1804, phone: "0300 2223337", capacity: 320, occupancy: 141 },
      { name: "Alkhidmat Relief Camp", district: "Nowshera", province: "Khyber Pakhtunkhwa", lat: 34.0153, lng: 71.9747, phone: "0300 2223338", capacity: 340, occupancy: 288 },
      { name: "Alkhidmat Relief Camp", district: "Charsadda", province: "Khyber Pakhtunkhwa", lat: 34.1453, lng: 71.7308, phone: "0300 2223339", capacity: 280, occupancy: 122 },
      { name: "Alkhidmat Relief Camp", district: "Dera Ismail Khan", province: "Khyber Pakhtunkhwa", lat: 31.8313, lng: 70.9017, phone: "0300 2223340", capacity: 300, occupancy: 187 },
      { name: "Alkhidmat Relief Camp", district: "Jaffarabad", province: "Balochistan", lat: 28.9417, lng: 68.31, phone: "0300 2223341", capacity: 240, occupancy: 205 },
      { name: "Alkhidmat Relief Camp", district: "Naseerabad", province: "Balochistan", lat: 30.1372, lng: 67.9117, phone: "0300 2223342", capacity: 220, occupancy: 96 },
    ].map((c) => prisma.camp.create({ data: c }))
  );

  const badin = camps[0];

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const hamza = await prisma.user.create({
    data: { username: "hamza.khan", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Hamza Khan", phone: "0300 1234567", campId: badin.id, available: true },
  });
  const ayesha = await prisma.user.create({
    data: { username: "ayesha.siddiqui", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Ayesha Siddiqui", phone: "0321 7654321", campId: badin.id, available: true },
  });
  const bilal = await prisma.user.create({
    data: { username: "bilal.ahmed", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Bilal Ahmed", phone: "0333 2223334", campId: badin.id, available: false },
  });
  await prisma.user.create({
    data: { username: "ahmad.raza", passwordHash: hash("camp2025"), role: "camp_manager", name: "Ahmad Raza", phone: "0345 1234567", campId: badin.id },
  });
  await prisma.user.create({
    data: { username: "admin@alkhidmat.org", passwordHash: hash("admin2025"), role: "admin", name: "Ali Hassan", phone: "0300 9998887" },
  });

  const requests = [
    {
      code: "RIP-2026-00001", citizenName: "Ghulam Hussain", phone: "0300 8765432", type: "medical", priority: "critical",
      needs: JSON.stringify(["High Fever", "No Clean Water", "Children Under 5"]),
      district: "Badin", lat: 24.7487, lng: 68.8651, location: "Village Jam Goth, Talhar, Badin",
      peopleCount: 4, status: "in_transit", volunteerId: hamza.id, campId: badin.id,
      assignedAt: daysAgo(0, 3), startedAt: daysAgo(0, 1), createdAt: daysAgo(0, 4),
    },
    {
      code: "RIP-2026-00002", citizenName: "Fatima Bibi", phone: "0333 5556661", type: "food", priority: "high",
      needs: JSON.stringify(["Food Packs", "Clean Water"]),
      district: "Badin", lat: 24.7394, lng: 68.9697, location: "Tando Bago, Badin",
      peopleCount: 6, status: "assigned", volunteerId: hamza.id, campId: badin.id,
      assignedAt: daysAgo(0, 2), createdAt: daysAgo(0, 6),
    },
    {
      code: "RIP-2026-00003", citizenName: "Allah Dino", phone: "0345 1112223", type: "water", priority: "high",
      needs: JSON.stringify(["Clean Water", "Water Purification Tabs"]),
      district: "Badin", lat: 25.0419, lng: 68.6489, location: "Matli, Badin",
      peopleCount: 8, status: "pending", campId: badin.id, createdAt: daysAgo(0, 2),
    },
    {
      code: "RIP-2026-00004", citizenName: "Zarina Khatoon", phone: "0311 4445556", type: "shelter", priority: "medium",
      needs: JSON.stringify(["Tent", "Blankets"]),
      district: "Badin", lat: 24.9297, lng: 68.7961, location: "Golarchi, Badin",
      peopleCount: 5, status: "pending", campId: badin.id, createdAt: daysAgo(0, 5),
    },
    {
      code: "RIP-2026-00005", citizenName: "Muhammad Yousuf", phone: "0302 7778889", type: "medical", priority: "critical",
      needs: JSON.stringify(["High Fever", "Diarrhea", "Elderly Patient"]),
      district: "Badin", lat: 24.6833, lng: 68.7667, location: "Kadhan, Badin",
      peopleCount: 3, status: "pending", campId: badin.id, createdAt: daysAgo(0, 1),
    },
    {
      code: "RIP-2026-00006", citizenName: "Haleeman", phone: "0313 9990001", type: "food", priority: "high",
      needs: JSON.stringify(["Food Packs"]),
      district: "Badin", lat: 24.6614, lng: 68.8255, location: "Badin City",
      peopleCount: 7, status: "assigned", volunteerId: ayesha.id, campId: badin.id,
      assignedAt: daysAgo(0, 1), createdAt: daysAgo(1),
    },
    {
      code: "RIP-2026-00007", citizenName: "Abdul Rehman", phone: "0300 4447778", type: "rescue", priority: "critical",
      needs: JSON.stringify(["Boat Rescue", "Elderly Patient"]),
      district: "Badin", lat: 24.7667, lng: 68.9333, location: "Pangrio, Badin",
      peopleCount: 5, status: "resolved", volunteerId: bilal.id, campId: badin.id,
      assignedAt: daysAgo(1, 6), startedAt: daysAgo(1, 5), resolvedAt: daysAgo(1, 2), createdAt: daysAgo(1, 8),
      resolution: JSON.stringify({ items: ["Boat Rescue"], peopleHelped: 5, notes: "Family evacuated to Badin camp" }),
    },
    {
      code: "RIP-2026-00008", citizenName: "Saima", phone: "0345 3336669", type: "water", priority: "medium",
      needs: JSON.stringify(["Clean Water"]),
      district: "Badin", lat: 24.649, lng: 68.8295, location: "Badin City",
      peopleCount: 4, status: "resolved", volunteerId: hamza.id, campId: badin.id,
      assignedAt: daysAgo(2, 4), startedAt: daysAgo(2, 3), resolvedAt: daysAgo(2, 1), createdAt: daysAgo(2, 6),
      resolution: JSON.stringify({ items: ["Water Bottles x12"], peopleHelped: 4, notes: "Delivered 12 bottles of clean water" }),
    },
    {
      code: "RIP-2026-00009", citizenName: "Karim Bux", phone: "0321 8882223", type: "food", priority: "high",
      needs: JSON.stringify(["Food Packs", "Cooked Meals"]),
      district: "Badin", lat: 24.7552, lng: 68.8425, location: "Talhar, Badin",
      peopleCount: 9, status: "resolved", volunteerId: hamza.id, campId: badin.id,
      assignedAt: daysAgo(3, 8), startedAt: daysAgo(3, 7), resolvedAt: daysAgo(3, 4), createdAt: daysAgo(3, 10),
      resolution: JSON.stringify({ items: ["Family Food Pack x3"], peopleHelped: 9, notes: "3 food packs delivered, family stable" }),
    },
    {
      code: "RIP-2026-00010", citizenName: "Iqbal Shah", phone: "0300 1239876", type: "shelter", priority: "high",
      needs: JSON.stringify(["Tent", "Blankets", "Kitchen Kit"]),
      district: "Nowshera", lat: 34.0281, lng: 71.969, location: "Nowshera, KPK",
      peopleCount: 6, status: "resolved", campId: camps[8].id,
      assignedAt: daysAgo(4, 6), startedAt: daysAgo(4, 5), resolvedAt: daysAgo(4, 2), createdAt: daysAgo(4, 9),
      resolution: JSON.stringify({ items: ["Tent x1", "Blankets x4"], peopleHelped: 6, notes: "Shelter established" }),
    },
  ];

  for (const r of requests) {
    await prisma.request.create({ data: r });
  }

  const badinStock = [
    { name: "RippleNet Water Purification Kit", category: "water", quantity: 48, unit: "kits", reorderLevel: 15 },
    { name: "Paracetamol (500mg)", category: "medical", quantity: 420, unit: "tabs", reorderLevel: 100 },
    { name: "ORS Sachets", category: "medical", quantity: 180, unit: "sachets", reorderLevel: 150 },
    { name: "Zinc Tablets", category: "medical", quantity: 45, unit: "tabs", reorderLevel: 50 },
    { name: "Water Purification Tabs", category: "medical", quantity: 240, unit: "tabs", reorderLevel: 60 },
    { name: "Antiseptic Liquid (100ml)", category: "medical", quantity: 36, unit: "bottles", reorderLevel: 20 },
    { name: "Family Food Pack", category: "food", quantity: 85, unit: "packs", reorderLevel: 40 },
    { name: "Mineral Water (1.5L)", category: "water", quantity: 120, unit: "bottles", reorderLevel: 60 },
    { name: "Family Tent", category: "shelter", quantity: 24, unit: "units", reorderLevel: 10 },
    { name: "Blankets", category: "shelter", quantity: 60, unit: "units", reorderLevel: 30 },
  ];
  for (const s of badinStock) {
    await prisma.stockItem.create({ data: { ...s, campId: badin.id } });
  }

  const genericStock = [
    { name: "RippleNet Water Purification Kit", category: "water", quantity: 25, unit: "kits", reorderLevel: 10 },
    { name: "Family Food Pack", category: "food", quantity: 60, unit: "packs", reorderLevel: 40 },
    { name: "Mineral Water (1.5L)", category: "water", quantity: 90, unit: "bottles", reorderLevel: 60 },
    { name: "Blankets", category: "shelter", quantity: 45, unit: "units", reorderLevel: 30 },
    { name: "ORS Sachets", category: "medical", quantity: 200, unit: "sachets", reorderLevel: 150 },
  ];
  for (const camp of camps.slice(1)) {
    for (const s of genericStock) {
      await prisma.stockItem.create({ data: { ...s, campId: camp.id } });
    }
  }

  await prisma.restockRequest.createMany({
    data: [
      { code: "RST-2026-00001", campId: badin.id, itemName: "Family Food Pack", quantity: 200, status: "pending", createdAt: daysAgo(0, 5) },
      { code: "RST-2026-00002", campId: badin.id, itemName: "Zinc Tablets", quantity: 100, status: "pending", createdAt: daysAgo(0, 3) },
      { code: "RST-2026-00003", campId: camps[1].id, itemName: "Mineral Water (1.5L)", quantity: 150, status: "approved", createdAt: daysAgo(1, 2) },
      { code: "RST-2026-00004", campId: camps[8].id, itemName: "Family Tent", quantity: 20, status: "pending", createdAt: daysAgo(0, 8) },
    ],
  });

  await prisma.complaint.createMany({
    data: [
      { code: "CMP-2026-00001", citizenName: "Sakina", phone: "0300 1112233", message: "Food pack was missing water bottles promised with delivery.", category: "delivery", campId: badin.id, status: "open", createdAt: daysAgo(0, 6) },
      { code: "CMP-2026-00002", citizenName: "Nazir Ahmed", phone: "0311 2223344", message: "Volunteer arrived 2 hours after the promised time.", category: "service", campId: badin.id, status: "open", createdAt: daysAgo(1, 3) },
      { code: "CMP-2026-00003", citizenName: "Mai Jannat", phone: "0333 4445566", message: "Wrong medicine delivered, needed ORS for the child.", category: "delivery", campId: badin.id, status: "resolved", response: "Corrected same day. ORS sachets delivered by evening.", createdAt: daysAgo(2, 4), resolvedAt: daysAgo(2) },
    ],
  });

  console.log("Seed complete:", {
    camps: camps.length,
    users: 5,
    requests: requests.length,
    stock: badinStock.length + genericStock.length * 12,
    restocks: 4,
    complaints: 3,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
