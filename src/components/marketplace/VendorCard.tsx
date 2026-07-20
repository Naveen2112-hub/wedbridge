"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Star, IndianRupee, Briefcase } from "lucide-react";
import type { VendorDocument } from "@/firebase/schema";
import { getCategoryName } from "@/firebase/schema";
import { StarRating } from "@/components/marketplace/StarRating";
import { cn } from "@/lib/cn";

export function VendorCard({ vendor }: { vendor: VendorDocument }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100 transition hover:shadow-md">
      <Link href={`/vendor/${vendor.id}`} className="relative block aspect-[16/10] overflow-hidden bg-primary-100">
        {vendor.coverURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image src={vendor.coverURL} alt={vendor.businessName} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-300"><Briefcase className="h-10 w-10" /></div>
        )}
        {vendor.featured && <span className="absolute left-3 top-3 rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-bold text-white">Featured</span>}
        {vendor.verificationStatus === "verified" && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur"><BadgeCheck className="h-3.5 w-3.5 text-secondary-600" />Verified</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          {vendor.logoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image src={vendor.logoURL} alt="" loading="lazy" className="h-12 w-12 flex-none rounded-xl object-cover ring-1 ring-primary-100" />
          ) : (
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-400"><Briefcase className="h-6 w-6" /></div>
          )}
          <div className="min-w-0">
            <Link href={`/vendor/${vendor.id}`}><h3 className="truncate font-display text-base font-semibold text-primary-900 hover:text-primary-700">{vendor.businessName}</h3></Link>
            <p className="text-xs text-muted">{getCategoryName(vendor.category)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" /><span className="truncate">{vendor.city}, {vendor.state}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1"><StarRating rating={vendor.rating} /><span className="text-xs font-medium text-ink/70">{vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}</span></div>
          {vendor.experienceYears > 0 && <span className="text-xs text-muted">· {vendor.experienceYears}y exp</span>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center text-sm font-semibold text-primary-900"><IndianRupee className="h-3.5 w-3.5" />{vendor.startingPrice.toLocaleString()}<span className="text-xs font-normal text-muted"> onwards</span></p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/vendor/${vendor.id}`} className="btn-outline flex-1 text-xs">View Profile</Link>
          <Link href={`/vendor/${vendor.id}?book=1`} className={cn("btn-primary flex-1 text-xs")}>Book Now</Link>
        </div>
      </div>
    </div>
  );
}
