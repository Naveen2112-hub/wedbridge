import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center", className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="eyebrow">
          <span className="h-px w-6 bg-secondary" />
          {eyebrow}
        </p>
      )}
      <h2 className="heading-lg mt-3 text-balance">{title}</h2>
      {subtitle && <p className="text-lead mt-4">{subtitle}</p>}
    </div>
  );
}

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("section-pad", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
