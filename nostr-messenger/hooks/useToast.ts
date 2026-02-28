"use client";

import type { Toast } from "@/types/ui";
import { useUiStore } from "@/store/uiStore";

export function useToast(): {
  toasts: Toast[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
} {
  const toasts = useUiStore((state) => state.toasts);
  const addToast = useUiStore((state) => state.addToast);

  return {
    toasts,
    success: (message: string) => {
      addToast({
        type: "success",
        message,
        duration: 3000
      });
    },
    error: (message: string) => {
      addToast({
        type: "error",
        message,
        duration: 5000
      });
    },
    info: (message: string) => {
      addToast({
        type: "info",
        message,
        duration: 3000
      });
    },
    warning: (message: string) => {
      addToast({
        type: "warning",
        message,
        duration: 5000
      });
    }
  };
}
