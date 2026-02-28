"use client";

import type { Toast as ToastType } from "@/types/ui";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const typeClassMap = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  error: "border-red-500/30 bg-red-500/10 text-red-100",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100"
} as const;

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-2xl backdrop-blur ${typeClassMap[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          className="shrink-0 rounded-full border border-current/20 px-2 py-1 text-xs"
          onClick={() => onClose(toast.id)}
          type="button"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
