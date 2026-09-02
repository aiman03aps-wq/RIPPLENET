import type { Metadata } from "next";
import { AuthGuard } from "../../components/auth-guard";
import { ComplaintsReportsClient } from "../complaints/complaints-reports-client";
import { loadComplaintsReportsData } from "../complaints/data";

export const metadata: Metadata = {
  title: "Reports — RippleNet AI",
};

export default async function ReportsPage() {
  const { complaints, reports } = await loadComplaintsReportsData();

  return (
    <AuthGuard role="admin" loginHref="/admin/login">
      <ComplaintsReportsClient defaultTab="reports" complaints={complaints} reports={reports} />
    </AuthGuard>
  );
}
