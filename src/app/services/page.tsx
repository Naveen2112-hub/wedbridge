"use client";
import Link from "next/link";
import { Search, Store, ArrowRight } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/firebase/schema";
import { cn } from "@/lib/cn";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-800"><Store className="h-3.5 w-3.5" />Wedding Marketplace</span>
        <h1 className="heading-lg mt-4">Wedding Services</h1>
        <p className="text-lead mx-auto mt-3 max-w-2xl">Browse trusted vendors across every category for your special day.</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search vendors by name or city…" className="input pl-10" />
        </div>
        <Link href="/services/all" className="btn-primary">Browse All</Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {VENDOR_CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/services/${cat.id}`} className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-primary-100 transition hover:shadow-md hover:ring-primary-300">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition group-hover:bg-secondary-100 group-hover:text-secondary-700">
              <span className="text-xl font-bold">{cat.name[0]}</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">{cat.name}</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-secondary-600 opacity-0 transition group-hover:opacity-100">View vendors <ArrowRight className="h-3 w-3" /></p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
