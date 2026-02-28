"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";
import { Toast } from "@/components/common/Toast";
import { useUiStore } from "@/store/uiStore";

export function ToastProvider({ children }: PropsWithChildren) {
  const allToasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);
  const toasts = useMemo(() => allToasts.slice(-5), [allToasts]);

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
