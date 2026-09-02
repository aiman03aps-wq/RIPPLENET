import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "../components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login — RippleNet AI",
};

export default function LoginPage() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-hidden bg-ink shadow-xl">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/images/login_bg.png"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="scale-[1.08] object-cover blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />
      </div>

      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 px-5 pt-8">
          <Logo className="h-11 w-11 rounded-full bg-white shadow-lg" />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-bold text-white">RippleNet AI</p>
            <p className="text-[11px] font-medium text-white/70">Alkhidmat Health Camps</p>
          </div>
        </header>

        <div className="mx-5 mb-7 mt-auto">
          <div className="rounded-[28px] bg-white px-5 pb-5 pt-6 shadow-2xl shadow-black/40">
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">
              Welcome Back!
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">Login to your camp account</p>

            <LoginForm />

            <p className="mt-6 text-center text-[11px] font-medium text-slate-400">
              Serving humanity in times of crisis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
