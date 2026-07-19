"use client";
import { Settings } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
export default function SettingsPage() { const { t } = useLanguage(); return (<ProtectedPage title={t("nav.settings")} description="Account settings, language, and privacy preferences." icon={Settings} />); }
