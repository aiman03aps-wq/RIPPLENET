"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconRotateCcw, IconX } from "../../../../components/icons";

interface ProofPhoto {
  src: string;
  alt: string;
  uploaded?: boolean;
}

interface ResolveFormProps {
  requestCode: string;
  initialPhotos: ProofPhoto[];
  itemsDelivered: string[];
  peopleHelped: number;
}

const MAX_PHOTOS = 6;

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read photo");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function ResolveForm({
  requestCode,
  initialPhotos,
  itemsDelivered,
  peopleHelped,
}: ResolveFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<ProofPhoto[]>(initialPhotos);
  const [signature, setSignature] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be attached");
      return;
    }
    try {
      const src = await fileToDataUrl(file);
      setPhotos((prev) =>
        prev.length >= MAX_PHOTOS
          ? prev
          : [...prev, { src, alt: "Uploaded proof photo", uploaded: true }]
      );
      setError(null);
    } catch {
      setError("Could not read that photo");
    }
  }

  async function handleSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve",
          itemsDelivered,
          peopleHelped,
          notes,
          proofPhotos: photos.map((p) => p.src),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not resolve delivery");
      
      // Redirect directly to Volunteer Delivery History
      router.push(`/volunteer/history?resolved=${encodeURIComponent(requestCode)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve delivery");
      setBusy(false);
    }
  }

  const cardHeading = "font-display text-[15px] font-bold text-ink";
  const subHeading = "text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400";

  return (
    <>
      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className={cardHeading}>Proof of Delivery</h3>
          <p className={`mt-1 ${subHeading}`}>Photo</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.src} className="relative aspect-square overflow-hidden rounded-xl">
                {photo.uploaded ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                ) : (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 480px) 30vw, 144px"
                    className="object-cover"
                  />
                )}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setPhotos((prev) => prev.filter((p) => p.src !== photo.src))}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition active:scale-90"
                >
                  <IconX className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            className="mt-2.5 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-bold text-sky-500 transition active:scale-[0.99] disabled:opacity-50"
          >
            <IconPlus className="h-4 w-4" />
            Add More Photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Attach proof photo"
          />
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className={cardHeading}>Victim Acknowledgement (Optional)</h3>
          <p className={`mt-1 ${subHeading}`}>Signature / Thumb</p>
          <div className="mt-2.5 flex items-stretch gap-3">
            <div className="relative min-h-[80px] min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
              {signature ? (
                <Image
                  src="/images/signature_v2.png"
                  alt="Victim's signature"
                  fill
                  sizes="(max-width: 480px) 70vw, 336px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] font-medium text-slate-400">
                  Signature cleared
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSignature(false)}
              className="flex h-10 shrink-0 items-center gap-1.5 self-center rounded-full border border-slate-200 px-3.5 text-[11.5px] font-bold text-slate-600 transition active:scale-95"
            >
              <IconRotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className={cardHeading}>Additional Notes (Optional)</h3>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Victim was very weak. Advised to visit camp if condition worsens."
            className="mt-2.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink outline-none transition placeholder:text-slate-400 focus:border-channel focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </section>

      <section className="mt-6 px-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="h-[52px] w-full rounded-full bg-ink text-[13px] font-bold uppercase tracking-[0.06em] text-white shadow-lg shadow-ink/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Mark as Resolved"}
        </button>
        {error ? (
          <p className="mt-2 px-1 text-center text-[12px] font-semibold text-red-500">{error}</p>
        ) : null}
      </section>
    </>
  );
}
