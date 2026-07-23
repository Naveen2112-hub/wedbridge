"use client";
import { type ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";
import { MaintenanceGuard } from "@/components/admin/MaintenanceGuard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <ErrorBoundary>
              <MaintenanceGuard>
                <Navbar />
                <main className="min-h-[60vh]">{children}</main>
                <Footer />
                <FloatingButtons />
              </MaintenanceGuard>
            </ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
        <ServiceWorkerRegister />
      </LanguageProvider>
    </ThemeProvider>
  );
}
