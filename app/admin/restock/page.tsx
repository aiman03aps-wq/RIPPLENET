import type { Metadata } from "next";
import { AuthGuard } from "../../components/auth-guard";
import { CampsRestockClient } from "../camps/camps-restock-client";
import { loadCampsRestockData } from "../camps/data";

export const metadata: Metadata = {
  title: "Restock Requests — RippleNet AI",
};

export default async function RestockPage() {
  const { camps, restocks } = await loadCampsRestockData();

  return (
    <AuthGuard role="admin" loginHref="/admin/login">
      <CampsRestockClient defaultTab="restock" camps={camps} restocks={restocks} />
    </AuthGuard>
  );
}
