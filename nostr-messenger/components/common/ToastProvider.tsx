"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Toast } from "@/components/common/Toast";
import { useUiStore } from "@/store/uiStore";

export function ToastProvider({ children }: PropsWithChildren) {
  const toasts = useUiStore((state) => state.toasts.slice(-5));
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration ?? 3000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <Toast onClose={removeToast} toast={toast} />
          </div>
        ))}
      </div>
    </>
  );
}
