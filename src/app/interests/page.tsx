"use client";

import { HeartHandshake } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function InterestsPage() {
  const { t } = useLanguage();
  return (<ProtectedPage title={t("nav.interests")} description="Interest requests you've sent and received." icon={HeartHandshake} />);
}
