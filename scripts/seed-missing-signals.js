const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const monitoringStart = new Date(now.getTime() - 48 * 3600 * 1000);

  // Clean existing demo records if any
  await prisma.missingSignalAlert.deleteMany({
    where: {
      district: {
        in: ["District A", "District B", "District C", "Rajanpur", "Dadu", "Jaffarabad"],
      },
    },
  });

  // Seed District B (Demo Scenario 2: High exposure, unusually low SOS -> FLAGGED)
  const b = await prisma.missingSignalAlert.create({
    data: {
      district: "District B",
      province: "Balochistan (Jaffarabad Basin)",
      exposureCategory: "high",
      exposureScore: 0.94,
      dataSource: "NDMA Sentinel-1 SAR Radar & Inundation Matrix (Simulated)",
      dataTimestamp: new Date(now.getTime() - 25 * 60 * 1000),
      sosCount: 1,
      monitoringStart,
      monitoringEnd: now,
      status: "pending",
      reason:
        "High flood inundation telemetry (94% exposure index via NDMA Sentinel-1 SAR Radar), but only 1 SOS report received within the 48-hour monitoring window (reporting threshold: ≤2). Discrepancy indicates a potential reporting gap. An absence of distress calls does not mean an absence of disaster. Recommended human field verification with frontline volunteers and camp managers to check for physical access barriers or telecom constraints.",
      actions: {
        create: {
          fromStatus: "none",
          toStatus: "pending",
          action: "alert_created",
          notes: "Demo Scenario 2: High Inundation (94%) with Unusually Low SOS (1 report). Flagged potential reporting gap.",
          actorName: "Missing-Signal Pipeline Engine",
        },
      },
    },
  });

  // Seed District C (Demo Scenario 3: Telemetry Sensor Outage -> Insufficient Data)
  const c = await prisma.missingSignalAlert.create({
    data: {
      district: "District C",
      province: "Balochistan (Highland Valleys)",
      exposureCategory: "insufficient_data",
      exposureScore: null,
      dataSource: "PDMA Field Sensor Network (Uplink Offline >96h)",
      dataTimestamp: new Date(now.getTime() - 110 * 3600 * 1000),
      sosCount: 0,
      monitoringStart,
      monitoringEnd: now,
      status: "insufficient_data",
      reason:
        "Telemetry feeds from PDMA Field Sensor Network are unavailable, disconnected, or stale (>96h). District inundation and distress reporting status cannot be reliably evaluated without manual sensor restoration and ground verification.",
      actions: {
        create: {
          fromStatus: "none",
          toStatus: "insufficient_data",
          action: "alert_created",
          notes: "Demo Scenario 3: Telemetry Sensor Outage. Marked as insufficient data.",
          actorName: "Missing-Signal Pipeline Engine",
        },
      },
    },
  });

  // Seed Rajanpur (Real flood basin district with high inundation & low reporting)
  const rajanpur = await prisma.missingSignalAlert.create({
    data: {
      district: "Rajanpur",
      province: "Punjab",
      exposureCategory: "high",
      exposureScore: 0.85,
      dataSource: "NDMA Satellite Inundation Telemetry / Sentinel-1 SAR",
      dataTimestamp: new Date(now.getTime() - 40 * 60 * 1000),
      sosCount: 0,
      monitoringStart,
      monitoringEnd: now,
      status: "under_verification",
      verificationNotes: "Field scout dispatched via Alkhidmat Rajanpur relief hub. Boat team checking Indus river embankment breach.",
      reviewerName: "Ali Hassan (Admin)",
      reason:
        "High flood inundation telemetry (85% exposure index via NDMA Satellite Inundation Telemetry), but only 0 SOS reports received within the 48-hour monitoring window (reporting threshold: ≤2). Discrepancy indicates a potential reporting gap. An absence of distress calls does not mean an absence of disaster. Recommended human field verification with frontline volunteers and camp managers.",
      actions: {
        createMany: {
          data: [
            {
              fromStatus: "none",
              toStatus: "pending",
              action: "alert_created",
              notes: "Pipeline scan detected High Inundation (85%) with 0 SOS reports.",
              actorName: "Rule-Based Missing-Signal Engine",
            },
            {
              fromStatus: "pending",
              toStatus: "under_verification",
              action: "status_updated",
              notes: "Dispatched scout boat from Alkhidmat Rajanpur camp.",
              actorName: "Ali Hassan (Admin)",
            },
          ],
        },
      },
    },
  });

  console.log("Successfully seeded Missing-Signal alerts:", { b: b.district, c: c.district, rajanpur: rajanpur.district });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
