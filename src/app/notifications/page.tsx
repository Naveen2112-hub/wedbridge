"use client";

import { Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function NotificationsPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage
      title={t("nav.notifications")}
      description="Recent activity and updates about your matches."
      icon={Bell}
    />
  );
}
