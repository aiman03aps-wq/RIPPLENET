import type { Metadata } from "next";
import { AuthGuard } from "../../components/auth-guard";
import { ResilienceClient } from "./resilience-client";
import { resilienceStore, GEO_DISTRICTS } from "../../../lib/resilience/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Climate Resilience Engine — RippleNet AI",
};

export default async function ResiliencePage() {
  const districts = GEO_DISTRICTS;
  const assessment = resilienceStore.getResilienceAssessment(1)!;
  const services = resilienceStore.getAllServices();
  const recovery = resilienceStore.getRecoveryRecord(1)!;
  const displacement = resilienceStore.getDisplacementRecord(1)!;
  const adaptation = resilienceStore.getAllAdaptationRecords();

  return (
    <AuthGuard role="admin" loginHref="/admin/login?next=/admin/resilience">
      <ResilienceClient
        initialDistricts={districts}
        initialAssessment={assessment}
        initialServices={services}
        initialRecovery={recovery}
        initialDisplacement={displacement}
        initialAdaptation={adaptation}
      />
    </AuthGuard>
  );
}
