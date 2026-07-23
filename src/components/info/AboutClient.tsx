"use client";

import { Heart, Target, Users, Shield, Sparkles, Award } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const values = [
  { icon: Shield, title: "Trust & Safety", desc: "Every profile is verified. Your privacy and security come first." },
  { icon: Sparkles, title: "AI-Powered", desc: "Advanced compatibility matching using machine learning algorithms." },
  { icon: Users, title: "Community", desc: "Built for Tamil Nadu families, understanding our culture and traditions." },
  { icon: Award, title: "Quality", desc: "Premium service with dedicated support and verified vendors." },
];

export function AboutClient() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Reveal>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
            <Heart className="h-8 w-8 text-rose-600" fill="currentColor" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900">About WedBridge</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            WedBridge is Tamil Nadu&apos;s premier AI-powered matrimony platform, connecting families with
            verified profiles and a complete wedding vendor marketplace.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-neutral-900">Our Story</h2>
          <p className="mt-4 text-neutral-600">
            Founded in 2024, WedBridge was born from a simple idea: finding a life partner should be
            easier, safer, and more intelligent. We combine traditional Tamil Nadu matchmaking values
            with cutting-edge AI technology to help families find the perfect match. Beyond matrimony,
            we offer a full wedding marketplace with verified vendors for every wedding need.
          </p>
          <p className="mt-4 text-neutral-600">
            Today, WedBridge serves over 50,000 registered users across 120+ cities in Tamil Nadu,
            with 12,000+ successful matches and a growing marketplace of trusted wedding vendors.
          </p>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                <v.icon className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">{v.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={300}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: "50K+", label: "Profiles" },
            { value: "12K+", label: "Matches" },
            { value: "120+", label: "Cities" },
            { value: "8+", label: "Years" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-rose-600 p-6 text-center">
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-rose-100">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
