"use client";

import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

interface Plan {
  nameKey: "home.membership.free" | "home.membership.premium" | "home.membership.elite";
  price: number;
  popular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  { nameKey: "home.membership.free", price: 0, features: ["Create profile", "Browse profiles", "5 AI matches / day", "Send 3 interests / day"] },
  { nameKey: "home.membership.premium", price: 1499, popular: true, features: ["Unlimited AI matches", "Unlimited interests", "Direct contact access", "Advanced filters", "Priority support"] },
  { nameKey: "home.membership.elite", price: 3499, features: ["Everything in Premium", "Dedicated matchmaker", "Verified vendor bookings", "Featured profile", "Concierge support"] },
];

export function MembershipSection() {
  const { t } = useLanguage();
  return (
    <Section>
      <SectionHeader eyebrow={t("home.membership.eyebrow")} title={t("home.membership.title")} subtitle={t("home.membership.subtitle")} />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.nameKey} delay={i * 0.08}>
            <div className={cn("relative flex h-full flex-col rounded-2xl bg-card p-6 shadow-card transition hover:-translate-y-1", p.popular && "ring-2 ring-secondary")}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-secondary"><Crown className="h-3 w-3" />{t("home.membership.popular")}</span>}
              <h3 className="font-display text-xl font-semibold text-primary-900">{t(p.nameKey)}</h3>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-primary-900">{p.price === 0 ? "₹0" : `₹${p.price.toLocaleString("en-IN")}`}</span>
                <span className="text-sm text-muted">{t("home.membership.month")}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-secondary-100 text-secondary-800"><Check className="h-3 w-3" /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/membership" className={cn("mt-8", p.popular ? "btn-primary" : "btn-outline")}>{t("home.membership.cta")}</Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
