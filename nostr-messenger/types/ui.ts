import type * as React from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
}
