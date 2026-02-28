"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true
    };
  }

  override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  private handleRefresh = () => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-zinc-100">
          <p className="text-base font-semibold">문제가 발생했습니다</p>
          <button
            className="mt-4 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm"
            onClick={this.handleRefresh}
            type="button"
          >
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
