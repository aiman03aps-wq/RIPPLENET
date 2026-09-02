"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({
  label = "Logout",
  className = "",
  redirect = "/",
  children,
}: {
  label?: string;
  className?: string;
  redirect?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(redirect);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children ?? label}
    </button>
  );
}
