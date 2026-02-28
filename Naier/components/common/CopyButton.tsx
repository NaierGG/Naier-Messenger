"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "복사" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-zinc-500"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "복사됨" : label}
    </button>
  );
}
