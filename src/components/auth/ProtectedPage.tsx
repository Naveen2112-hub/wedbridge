"use client";

import Link from "next/link";
import { type LucideIcon, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

interface ProtectedPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
}

export function ProtectedPage({ title, description, icon: Icon, action }: ProtectedPageProps) {
  const { t } = useLanguage();
  return (
    <AuthGuard>
      <ProtectedLayout>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-card p-8 shadow-card sm:p-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-800"><Icon className="h-7 w-7" /></span>
            <h1 className="heading-md mt-5">{title}</h1>
            <p className="text-lead mt-2 max-w-xl">{description}</p>
            {action && (
              <Link href={action.href} className="btn-primary mt-8">
                {action.label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-muted">{t("footer.madeWith")}</p>
        </div>
      </ProtectedLayout>
    </AuthGuard>
  );
}
