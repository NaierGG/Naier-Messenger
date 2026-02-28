"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastProvider } from "@/components/common/ToastProvider";
import { authStore } from "@/store/authStore";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    authStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  );
}
