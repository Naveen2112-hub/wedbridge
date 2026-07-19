import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) { return <section id={id} className={cn("section-pad", className)}><div className="container-page">{children}</div></section>; }
