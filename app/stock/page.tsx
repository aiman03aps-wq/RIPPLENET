import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { StaffNav } from "../components/staff-nav";
import { CampHeader } from "../components/camp-header";
import { StockList, type RestockView, type StockItemView } from "./stock-list";
import { RequestRestockButton } from "./request-restock-button";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";

import { mergeCamps } from "../../lib/camps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Management — RippleNet AI",
};

export default async function StockPage(props: {
  searchParams?: Promise<{ campId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const searchParams = props.searchParams ? await props.searchParams : {};
  const qCampId = searchParams.campId ? Number(searchParams.campId) : null;

  let dbCamps: any[] = [];
  try {
    dbCamps = await prisma.camp.findMany({
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.warn("Could not query camps:", e);
  }

  const allCamps = mergeCamps(dbCamps);
  const effectiveCampId = qCampId || session.campId || allCamps[0]?.id || 101;
  const currentCamp = allCamps.find((c) => c.id === effectiveCampId) || allCamps[0];

  const [stockItems, restocks] = await Promise.all([
    prisma.stockItem.findMany({
      where: { campId: currentCamp.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.restockRequest.findMany({
      where: { campId: currentCamp.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items: StockItemView[] = stockItems.length > 0 ? stockItems.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    unit: i.unit,
    reorderLevel: i.reorderLevel,
  })) : [
    { id: 1, name: "AquaTabs Water Purification (50 Tabs)", category: "Water & Sanitation", quantity: 380, unit: "Boxes", reorderLevel: 100 },
    { id: 2, name: "Oral Rehydration Salts (ORS)", category: "Medical", quantity: 520, unit: "Sachets", reorderLevel: 150 },
    { id: 3, name: "Family Dry Ration Pack (15kg)", category: "Food & Nutrition", quantity: 185, unit: "Packs", reorderLevel: 50 },
    { id: 4, name: "Anti-Diarrheal & Cholera Kit", category: "Medical", quantity: 95, unit: "Kits", reorderLevel: 30 },
    { id: 5, name: "Waterproof Family Relief Tent (12x12)", category: "Shelter", quantity: 45, unit: "Tents", reorderLevel: 20 },
  ];

  const restockViews: RestockView[] = restocks.map((r) => ({
    id: r.id,
    code: r.code,
    itemName: r.itemName,
    quantity: r.quantity,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        {/* Functioning Camp Manager Navigation Header (☰ Drawer + Notifications + Camp Switcher) */}
        <CampHeader
          campName={currentCamp.name}
          subtitle="Camp Stock Management"
          currentCamp={currentCamp}
          allCamps={allCamps}
          basePath="/stock"
        />

        <main className="pb-36">
          <StockList
            items={items}
            restocks={restockViews}
            managerName={session.name || "Imran Ali"}
          />

          <section className="mt-8 px-5 pb-10">
            <RequestRestockButton itemNames={items.map((i) => i.name)} />
          </section>
        </main>

        <StaffNav active="stock" />
      </div>
    </AuthGuard>
  );
}
