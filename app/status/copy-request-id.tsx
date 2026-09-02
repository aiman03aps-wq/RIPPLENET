"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconCopy } from "../components/icons";

export function CopyRequestId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy request ID"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition active:scale-90"
    >
      {copied ? (
        <IconCheck className="h-[19px] w-[19px] text-emerald-500" />
      ) : (
        <IconCopy className="h-[19px] w-[19px]" />
      )}
    </button>
  );
}
