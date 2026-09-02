"use client";

import {
  IconBaby,
  IconBandage,
  IconBowlSpoon,
  IconDots,
  IconDroplet,
  IconPregnant,
  IconThermometer,
} from "../../components/icons";
import { Translated } from "../../components/citizen-translated";

const needs = [
  { label: "Fever", Icon: IconThermometer },
  { label: "Injury", Icon: IconBandage },
  { label: "No Clean Water", Icon: IconDroplet },
  { label: "Food", Icon: IconBowlSpoon },
  { label: "Pregnant Woman", Icon: IconPregnant },
  { label: "Child Care", Icon: IconBaby },
  { label: "Other", Icon: IconDots },
] as const;

export function NeedsSelector({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <section className="mt-6 px-5">
      <Translated
        k="tellUsNeeds"
        as="h2"
        className="text-[13px] font-semibold text-slate-500"
      />
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {needs.map(({ label, Icon }) => {
          const active = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onToggle(label)}
              aria-pressed={active}
              className={`flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition active:scale-[0.97] ${
                active
                  ? "border-channel bg-sky-50 text-channel"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span
                className={`text-center text-[11px] font-semibold leading-tight ${
                  active ? "text-channel" : "text-slate-600"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
