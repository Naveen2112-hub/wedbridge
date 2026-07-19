"use client";

import { User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function ProfilePage() {
  const { t } = useLanguage();
  return (<ProtectedPage title={t("nav.profile")} description="Your matrimony profile details, photo, and preferences." icon={User} action={{ label: "Edit profile", href: "/profile/edit" }} />);
}
