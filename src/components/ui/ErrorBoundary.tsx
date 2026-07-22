"use client";
import { Component, type ReactNode } from "react";
import { TriangleAlert as AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/monitoring/logger";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("React error boundary caught", { error: error.message, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="heading-sm mb-2 text-primary-900">Something went wrong</h2>
            <p className="mb-4 text-sm text-gray-500">{this.state.error?.message ?? "An unexpected error occurred."}</p>
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-800">
              <RefreshCw className="h-4 w-4" />Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
