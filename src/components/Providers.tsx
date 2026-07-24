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
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
                >
                  Skip to main content
                </a>
                <Navbar />
                <main id="main-content" className="min-h-[60vh]">{children}</main>
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
