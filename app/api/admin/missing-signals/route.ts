import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  runMissingSignalPipeline,
  seedDemoScenarios,
  DEFAULT_PIPELINE_CONFIG,
  getDistrictExposureProfiles,
} from "@/lib/missing-signals";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Admin login required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const hours = parseInt(searchParams.get("hours") || "48", 10);
  const threshold = parseInt(searchParams.get("threshold") || "2", 10);

  // Check if we already have alerts; if none, initialize with the pipeline run
  const alertCount = await prisma.missingSignalAlert.count();
  if (alertCount === 0) {
    await seedDemoScenarios();
    await runMissingSignalPipeline({
      monitoringHours: hours,
      sosThresholdLow: threshold,
    });
  }

  // Fetch all alerts with their actions
  const alerts = await prisma.missingSignalAlert.findMany({
    orderBy: [
      { status: "asc" },
      { exposureScore: "desc" },
      { updatedAt: "desc" },
    ],
    include: {
      actions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Calculate monitoring statistics
  const profiles = getDistrictExposureProfiles();
  const potentialGaps = alerts.filter(
    (a) =>
      a.exposureCategory === "high" &&
      (a.status === "pending" || a.status === "under_verification" || a.status === "escalated")
  );
  const insufficientData = alerts.filter(
    (a) => a.exposureCategory === "insufficient_data" || a.status === "insufficient_data"
  );
  const verifiedGaps = alerts.filter((a) => a.status === "verified");
  const dismissedAlerts = alerts.filter((a) => a.status === "dismissed");

  return Response.json({
    summary: {
      totalMonitored: profiles.length,
      potentialGapsCount: potentialGaps.length,
      insufficientDataCount: insufficientData.length,
      verifiedGapsCount: verifiedGaps.length,
      dismissedCount: dismissedAlerts.length,
      underVerificationCount: alerts.filter((a) => a.status === "under_verification").length,
    },
    alerts,
    config: {
      monitoringHours: hours,
      sosThresholdLow: threshold,
    },
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Admin login required" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, monitoringHours, sosThresholdLow } = body;

    if (action === "seed_demo") {
      await seedDemoScenarios();
    } else {
      await runMissingSignalPipeline({
        monitoringHours: monitoringHours ? Number(monitoringHours) : DEFAULT_PIPELINE_CONFIG.monitoringHours,
        sosThresholdLow: sosThresholdLow ? Number(sosThresholdLow) : DEFAULT_PIPELINE_CONFIG.sosThresholdLow,
      });
    }

    // Return updated alert set
    const alerts = await prisma.missingSignalAlert.findMany({
      orderBy: [
        { status: "asc" },
        { exposureScore: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        actions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const profiles = getDistrictExposureProfiles();
    const potentialGaps = alerts.filter(
      (a) =>
        a.exposureCategory === "high" &&
        (a.status === "pending" || a.status === "under_verification" || a.status === "escalated")
    );
    const insufficientData = alerts.filter(
      (a) => a.exposureCategory === "insufficient_data" || a.status === "insufficient_data"
    );

    return Response.json({
      success: true,
      summary: {
        totalMonitored: profiles.length,
        potentialGapsCount: potentialGaps.length,
        insufficientDataCount: insufficientData.length,
        verifiedGapsCount: alerts.filter((a) => a.status === "verified").length,
        dismissedCount: alerts.filter((a) => a.status === "dismissed").length,
        underVerificationCount: alerts.filter((a) => a.status === "under_verification").length,
      },
      alerts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Pipeline execution failed";
    console.error("Error in missing-signals API:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
