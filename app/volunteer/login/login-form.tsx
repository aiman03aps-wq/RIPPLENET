"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconEye, IconEyeOff, IconShield, IconUser } from "../../components/icons";

const fieldLabel = "text-[12px] font-semibold text-slate-700";

export function VolunteerLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("hamza.khan");
  const [password, setPassword] = useState("volunteer2025");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role: "volunteer" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      router.push("/volunteer/tasks");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
      <label className="block">
        <span className={fieldLabel}>Phone or Staff ID</span>
        <span className="mt-1.5 flex h-12 items-center gap-2.5 rounded-xl border border-slate-200 bg-white pl-3.5 pr-3.5 transition focus-within:border-channel focus-within:ring-2 focus-within:ring-sky-100">
          <IconUser className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
          <input
            type="text"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
            autoComplete="username"
            className="h-full w-full bg-transparent text-[14px] font-semibold text-ink outline-none"
          />
        </span>
      </label>

      <label className="block">
        <span className={fieldLabel}>Password</span>
        <span className="relative mt-1.5 block">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-11 text-[14px] font-semibold tracking-[0.08em] text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-400 transition active:scale-90"
          >
            {showPassword ? (
              <IconEyeOff className="h-[18px] w-[18px]" />
            ) : (
              <IconEye className="h-[18px] w-[18px]" />
            )}
          </button>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{error}</p>
      )}

      <div className="-mt-1 text-right">
        <a href="#" className="text-[12px] font-semibold text-sky-500">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-1 h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? "Signing in..." : "Login"}
      </button>

      <a
        href="#"
        className="mt-1.5 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-channel"
      >
        <IconShield className="h-4 w-4" />
        Secure login with Alkhidmat ID
      </a>
    </form>
  );
}
