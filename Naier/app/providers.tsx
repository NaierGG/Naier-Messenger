"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastProvider } from "@/components/common/ToastProvider";
import { authStore } from "@/store/authStore";
import { contactStore } from "@/store/contactStore";
import { relayStore } from "@/store/relayStore";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    authStore.getState().hydrate();
    contactStore.getState().hydrate();
    relayStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  );
}
