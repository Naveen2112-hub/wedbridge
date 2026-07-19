"use client";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
export default function SearchPage() { const { t } = useLanguage(); return (<ProtectedPage title={t("nav.search")} description="Browse verified profiles across South India with advanced filters." icon={Search} action={{ label: "Go to AI matches", href: "/ai-matches" }} />); }
