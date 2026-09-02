"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconEye,
  IconEyeOff,
  IconShield,
  IconUser,
  IconPhone,
  IconCheck,
  IconSparkles,
} from "../../components/icons";

const fieldLabel = "text-[12px] font-semibold text-slate-700";

export function VolunteerLoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login fields (Existing preserved defaults)
  const [identifier, setIdentifier] = useState("hamza.khan");
  const [password, setPassword] = useState("volunteer2025");

  // Signup fields
  const [signupUsername, setSignupUsername] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!signupUsername.trim() || !signupName.trim() || !signupPassword.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          name: signupName,
          phone: signupPhone || "0300 1234567",
          password: signupPassword,
          role: "volunteer",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create account. Please try again.");
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
    <div className="mt-4">
      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-slate-100 p-1 mb-4">
        <button
          type="button"
          onClick={() => { setTab("login"); setError(""); }}
          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition ${
            tab === "login" ? "bg-white text-ink shadow-xs" : "text-slate-500"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab("signup"); setError(""); }}
          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition ${
            tab === "signup" ? "bg-white text-ink shadow-xs" : "text-slate-500"
          }`}
        >
          Register Volunteer
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          {/* Quick Demo Credentials */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Demo Credentials (Click to load):
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => { setIdentifier("hamza.khan"); setPassword("volunteer2025"); }}
                className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-channel"
              >
                Hamza Khan
              </button>
              <button
                type="button"
                onClick={() => { setIdentifier("ayesha.malik"); setPassword("volunteer2025"); }}
                className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-channel"
              >
                Ayesha Malik
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
          <label className="block">
            <span className={fieldLabel}>Full Name</span>
            <input
              type="text"
              required
              value={signupName}
              onChange={(e) => { setSignupName(e.target.value); setError(""); }}
              placeholder="e.g. Tariq Mehmood"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Username / ID</span>
            <input
              type="text"
              required
              value={signupUsername}
              onChange={(e) => { setSignupUsername(e.target.value); setError(""); }}
              placeholder="e.g. tariq.volunteer"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Mobile Phone Number</span>
            <input
              type="tel"
              value={signupPhone}
              onChange={(e) => { setSignupPhone(e.target.value); setError(""); }}
              placeholder="0300 1234567"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Create Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={signupPassword}
              onChange={(e) => { setSignupPassword(e.target.value); setError(""); }}
              placeholder="At least 6 characters"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-[52px] w-full rounded-xl bg-emerald-600 text-[15px] font-bold text-white shadow-lg shadow-emerald-600/25 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Registering..." : "Create Volunteer Account"}
          </button>
        </form>
      )}

      <a
        href="#"
        className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-channel"
      >
        <IconShield className="h-4 w-4" />
        Secure login with Alkhidmat
      </a>
    </div>
  );
}
