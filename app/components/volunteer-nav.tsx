import Link from "next/link";
import type { ReactNode } from "react";
import { IconClipboardCheck, IconClock, IconInfo, IconLogOut } from "./icons";
import { LogoutButton } from "./logout-button";

export type VolunteerTab = "tasks" | "history" | "support";

const tabs: { id: VolunteerTab; label: string; href: string; icon: ReactNode }[] = [
  { id: "tasks", label: "Tasks", href: "/volunteer/tasks", icon: <IconClipboardCheck className="h-[22px] w-[22px]" /> },
  { id: "history", label: "History", href: "/volunteer/history", icon: <IconClock className="h-[22px] w-[22px]" /> },
  { id: "support", label: "Support", href: "/volunteer/support", icon: <IconInfo className="h-[22px] w-[22px]" /> },
];

export function VolunteerNav({ active }: { active?: VolunteerTab }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] border-t border-slate-200/70 bg-white/95 pb-[max(10px,env(safe-area-inset-bottom))] backdrop-blur-md">
      <div className="grid grid-cols-4 px-3 pt-2">
        {tabs.map(({ id, label, href, icon }) => {
          const isActive = id === active;
          return (
            <Link
              key={id}
              href={href}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 ${
                isActive ? "text-channel" : "text-slate-400"
              }`}
            >
              {icon}
              <span className="text-[9px] font-semibold">{label}</span>
              {isActive && (
                <span className="absolute -top-2 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-channel" />
              )}
            </Link>
          );
        })}
        <LogoutButton
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-slate-400"
        >
          <IconLogOut className="h-[22px] w-[22px]" />
          <span className="text-[9px] font-semibold">Logout</span>
        </LogoutButton>
      </div>
    </nav>
  );
}
