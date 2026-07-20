"use client";
import { type ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </AuthProvider>
      <ServiceWorkerRegister />
    </LanguageProvider>
  );
}
