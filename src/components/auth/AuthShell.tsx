import { type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass-card p-8 sm:p-10", className)}>{children}</div>;
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-hero-pattern">
      <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl shadow-card lg:block">
            <Image src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" alt="WedBridge" fill sizes="40vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-primary-950/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="font-display text-2xl font-semibold">Begin your journey with WedBridge</p>
              <p className="mt-2 text-sm text-white/80">Premium matrimony, rooted in South Indian tradition.</p>
            </div>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
