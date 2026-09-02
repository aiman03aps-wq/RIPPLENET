"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconShield,
} from "../components/icons";

const roles = ["Health Camp", "Volunteer", "District Admin"];

const roleApi: Record<string, string> = {
  "Health Camp": "camp_manager",
  "Volunteer": "volunteer",
  "District Admin": "admin",
};

const roleRedirects: Record<string, string> = {
  "Health Camp": "/queue",
  "Volunteer": "/volunteer/tasks",
  "District Admin": "/admin/dashboard",
};

const fieldLabel = "text-[12px] font-semibold text-slate-700";
const fieldBox =
  "mt-1.5 flex h-12 items-center rounded-xl border border-slate-200 bg-white pl-3.5 pr-3.5 transition focus-within:border-channel focus-within:ring-2 focus-within:ring-sky-100";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState("Health Camp");
  const [identifier, setIdentifier] = useState("ahmad.raza");
  const [password, setPassword] = useState("camp2025");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ identifier, password, role: roleApi[role] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      router.push(roleRedirects[role] ?? "/queue");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <label className="block">
        <span className={fieldLabel}>Role</span>
        <span className="relative mt-1.5 block">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </span>
      </label>

      <label className="block">
        <span className={fieldLabel}>Phone or Staff ID</span>
        <span className={`${fieldBox} gap-2`}>
          <IconPhone className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
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
            {showPassword ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
          </button>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
          {error}
        </p>
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
