"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconLogOut,
  IconPackage,
  IconReportChart,
  IconTent,
  IconMessageSquareWarning,
} from "../../components/icons";
import { LogoutButton } from "../../components/logout-button";

const items = [
  { label: "Dashboard", href: "/admin/dashboard", Icon: IconLayoutDashboard },
  { label: "Camps", href: "/admin/camps", Icon: IconTent },
  { label: "Restock", href: "/admin/restock", Icon: IconPackage },
  { label: "Complaints", href: "/admin/complaints", Icon: IconMessageSquareWarning },
  { label: "Reports", href: "/admin/reports", Icon: IconReportChart },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex w-full max-w-[480px]">
        {items.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 transition ${
                active ? "text-ink" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
            </Link>
          );
        })}
        <LogoutButton className="flex flex-1 flex-col items-center gap-1 py-2 text-slate-400 transition">
          <IconLogOut className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Logout</span>
        </LogoutButton>
      </div>
    </nav>
  );
}
