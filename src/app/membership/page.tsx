"use client";

import { Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function MembershipPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage
      title={t("nav.membership")}
      description="Manage your subscription and unlock premium features."
      icon={Crown}
    />
  );
}
