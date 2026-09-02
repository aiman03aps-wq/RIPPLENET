import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { IconChevronLeft } from "../components/icons";
import { StaffNav } from "../components/staff-nav";
import { ComplaintsList, type ComplaintView } from "./complaints-list";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";

export const metadata: Metadata = {
  title: "Complaints — RippleNet AI",
};

export default async function ComplaintsPage() {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const [camp, complaints] = await Promise.all([
    session.campId ? prisma.camp.findUnique({ where: { id: session.campId } }) : null,
    prisma.complaint.findMany({
      where: { campId: session.campId ?? -1 },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const views: ComplaintView[] = complaints.map((c) => ({
    id: c.id,
    code: c.code,
    citizenName: c.citizenName,
    message: c.message,
    category: c.category,
    status: c.status,
    response: c.response,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center gap-3 px-5 pt-7">
        <Link
          href="/queue"
          aria-label="Back to queue"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Complaints
          </h1>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            {camp ? `${camp.district} Health Camp` : "Health Camp"}
          </p>
        </div>
      </header>

      <main className="pb-[110px]">
        <ComplaintsList complaints={views} />
      </main>

      <StaffNav />
    </div>
    </AuthGuard>
  );
}
