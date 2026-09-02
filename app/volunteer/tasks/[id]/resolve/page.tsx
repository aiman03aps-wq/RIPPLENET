import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthGuard } from "../../../../components/auth-guard";
import { IconCheck, IconChevronLeft } from "../../../../components/icons";
import { prisma } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/session";
import { parseNeeds, formatFullDate, suggestParcel } from "../../../../../lib/needs";
import { ResolveForm } from "./resolve-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resolve Delivery — RippleNet AI",
};

const photos = [
  { src: "/images/proof_photo_1_v2.png", alt: "Villagers receiving supplies in floodwater" },
  { src: "/images/proof_photo_2_v2.png", alt: "Volunteer handing a relief box to a villager" },
  { src: "/images/proof_photo_3_v2.png", alt: "Villager carrying a basket of supplies" },
] as const;

const cardHeading = "font-display text-[15px] font-bold text-ink";

export default async function ResolveDeliveryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const numeric = Number(id);
  const request = await prisma.request.findFirst({
    where:
      Number.isFinite(numeric) && /^\d+$/.test(id) ? { id: numeric } : { code: id.toUpperCase() },
  });
  if (!request || request.volunteerId !== session.id) notFound();
  if (request.status !== "in_transit") redirect(`/volunteer/tasks/${request.code}`);

  const parcel = suggestParcel(parseNeeds(request.needs), request.type);
  const summary = [
    { label: "Victim Name", value: request.citizenName },
    { label: "Location", value: request.location ?? `${request.district} District` },
    { label: "Delivered At", value: formatFullDate(new Date()) },
    { label: "Delivered By", value: session.name },
    { label: "Parcel Items", value: `${parcel.length} items` },
  ] as const;

  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center gap-2 px-5 pt-7">
        <Link
          href={`/volunteer/tasks/${request.code}`}
          aria-label="Back to task detail"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Resolve Delivery
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
            {request.code}
          </p>
        </div>
      </header>

      <main className="pb-10">
        <section className="mt-5 flex flex-col items-center px-5" aria-label="Delivery status">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <IconCheck className="h-8 w-8 text-white" strokeWidth={3} />
          </span>
          <h2 className="mt-3 font-display text-[20px] font-extrabold tracking-tight text-ink">
            Delivery Completed!
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">Thank you for your service.</p>
        </section>

        <section className="mt-5 px-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className={cardHeading}>Delivery Summary</h3>
            <div className="mt-2.5">
              {summary.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between gap-4 py-2 ${
                    i > 0 ? "border-t border-slate-100" : ""
                  }`}
                >
                  <span className="shrink-0 text-[12px] font-medium text-slate-500">{label}</span>
                  <span className="min-w-0 truncate text-right text-[12.5px] font-bold text-ink">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ResolveForm
          requestCode={request.code}
          initialPhotos={photos.map((p) => ({ ...p }))}
          itemsDelivered={parcel.map((item) => `${item.name} (${item.qty})`)}
          peopleHelped={request.peopleCount}
        />
      </main>
    </div>
    </AuthGuard>
  );
}
