import type { Metadata } from "next";
import { AuthGuard } from "../../components/auth-guard";
import { CampsRestockClient } from "./camps-restock-client";
import { loadCampsRestockData } from "./data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Camps & Restock — RippleNet AI",
};

export default async function CampsPage() {
  const { camps, restocks } = await loadCampsRestockData();

  return (
    <AuthGuard role="admin" loginHref="/admin/login">
      <CampsRestockClient defaultTab="camps" camps={camps} restocks={restocks} />
    </AuthGuard>
  );
}
