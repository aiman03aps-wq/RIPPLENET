import type { Metadata } from "next";
import { AuthGuard } from "../../components/auth-guard";
import { ComplaintsReportsClient } from "./complaints-reports-client";
import { loadComplaintsReportsData } from "./data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complaints & Reports — RippleNet AI",
};

export default async function ComplaintsPage() {
  const { complaints, reports } = await loadComplaintsReportsData();

  return (
    <AuthGuard role="admin" loginHref="/admin/login">
      <ComplaintsReportsClient defaultTab="complaints" complaints={complaints} reports={reports} />
    </AuthGuard>
  );
}
