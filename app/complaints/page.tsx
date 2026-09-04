import type { Metadata } from "next";
import Link from "next/link";
import { AuthGuard } from "../components/auth-guard";
import { IconChevronLeft } from "../components/icons";
import { CampHeader } from "../components/camp-header";
import { StaffNav } from "../components/staff-nav";
import { ComplaintsList, type ComplaintView } from "./complaints-list";
import { CitizenComplaintClient } from "./citizen-complaint-client";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";
import { mergeCamps, getMockComplaintsForCamp, type CampRecord } from "@/lib/camps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lodge Complaint — RippleNet AI",
};

export default async function ComplaintsPage(props: {
  searchParams?: Promise<{ campId?: string }>;
}) {
  const session = await getSession();

  // If Camp Manager is logged in, show Camp Manager complaints triage
  if (session && session.role === "camp_manager") {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const qCampId = searchParams.campId ? Number(searchParams.campId) : null;

    let dbCamps: any[] = [];
    try {
      dbCamps = await prisma.camp.findMany({
        orderBy: [{ province: "asc" }, { name: "asc" }],
      });
    } catch (e) {
      console.warn("Could not query camps for /complaints:", e);
    }

    const allCamps = mergeCamps(dbCamps);
    const effectiveCampId = qCampId || session.campId || allCamps[0]?.id || 101;
    const currentCamp = allCamps.find((c) => c.id === effectiveCampId) || allCamps[0];

    let dbComplaints: any[] = [];
    try {
      dbComplaints = await prisma.complaint.findMany({
        where: {
          OR: [
            { campId: currentCamp.id },
            { campId: session.campId ?? undefined },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Could not query complaints:", e);
    }

    let finalComplaints = dbComplaints;
    if (finalComplaints.length === 0) {
      finalComplaints = getMockComplaintsForCamp(currentCamp);
    }

    const views: ComplaintView[] = finalComplaints.map((c) => {
      const created = c.createdAt instanceof Date ? c.createdAt.toISOString() : new Date(c.createdAt || Date.now()).toISOString();
      return {
        id: c.id,
        code: c.code,
        citizenName: c.citizenName,
        message: c.message,
        category: c.category,
        status: c.status,
        response: c.response ?? null,
        createdAt: created,
      };
    });

    return (
      <AuthGuard role="camp_manager" loginHref="/login">
        <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
          <CampHeader
            campName={currentCamp.name}
            subtitle="Camp Complaints & Triage"
            currentCamp={currentCamp}
            allCamps={allCamps}
            basePath="/complaints"
          />

          <main className="pb-[110px]">
            <ComplaintsList complaints={views} />
          </main>

          <StaffNav />
        </div>
      </AuthGuard>
    );
  }

  // Otherwise, render Citizen Lodge Complaint Portal
  let dbCamps: any[] = [];
  try {
    dbCamps = await prisma.camp.findMany({
      select: { id: true, name: true, district: true },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.warn("Could not query camps for /complaints:", e);
  }

  const allCamps = mergeCamps(dbCamps);
  const camps = allCamps.map((c) => ({ id: c.id, name: c.name, district: c.district }));

  return <CitizenComplaintClient camps={camps} />;
}
