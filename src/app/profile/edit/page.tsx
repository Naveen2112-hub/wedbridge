"use client";

import { UserCog } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function ProfileEditPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage
      title="Edit Profile"
      description="Update your profile information and preferences."
      icon={UserCog}
      action={{ label: "View profile", href: "/profile" }}
    />
  );
}
