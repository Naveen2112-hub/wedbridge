"use client";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
export default function AiMatchesPage() { const { t } = useLanguage(); return (<ProtectedPage title={t("nav.aiMatches")} description="AI-powered compatibility matches tailored to your preferences." icon={Sparkles} action={{ label: "Browse all", href: "/search" }} />); }
