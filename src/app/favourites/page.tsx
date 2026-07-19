"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export default function FavouritesPage() {
  const { t } = useLanguage();
  return (<ProtectedPage title={t("nav.favourites")} description="Profiles you've saved for later." icon={Star} />);
}
