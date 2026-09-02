import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { StaffNav } from "../components/staff-nav";
import { StockList, type RestockView, type StockItemView } from "./stock-list";
import { RequestRestockButton } from "./request-restock-button";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Management — RippleNet AI",
};

export default async function StockPage() {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const [camp, stockItems, restocks] = await Promise.all([
    session.campId ? prisma.camp.findUnique({ where: { id: session.campId } }) : null,
    prisma.stockItem.findMany({
      where: { campId: session.campId ?? -1 },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.restockRequest.findMany({
      where: { campId: session.campId ?? -1 },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items: StockItemView[] = stockItems.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    unit: i.unit,
    reorderLevel: i.reorderLevel,
  }));
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
      <header className="px-5 pt-7">
        <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
          Stock Management
        </h1>
        <p className="mt-0.5 text-[12px] font-medium text-slate-500">
          {camp ? `${camp.district} Health Camp` : "Health Camp"}
        </p>
      </header>

      <main className="pb-36">
        <StockList items={items} restocks={restockViews} />

        <section className="mt-8 px-5 pb-10">
          <RequestRestockButton itemNames={items.map((i) => i.name)} />
        </section>
      </main>

      <StaffNav active="stock" />
    </div>
    </AuthGuard>
  );
}
