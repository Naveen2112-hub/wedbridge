"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Briefcase, Phone, MessageCircle, ListChecks } from "lucide-react";
import type { VendorDocument } from "@/firebase/schema";
import { getCategoryName } from "@/firebase/schema";
import { StarRating } from "@/components/marketplace/StarRating";
import { cn } from "@/lib/utils";

export function VendorCard({ vendor }: { vendor: VendorDocument }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100 transition hover:shadow-md">
      <Link href={`/vendor/${vendor.id}`} className="relative block aspect-[16/10] overflow-hidden bg-primary-100">
        {vendor.coverURL ? (
          <Image
            src={vendor.coverURL}
            alt={vendor.businessName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-300"><Briefcase className="h-10 w-10" /></div>
        )}
        {vendor.featured && <span className="absolute left-3 top-3 rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-bold text-white">Featured</span>}
        {vendor.verificationStatus === "verified" && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-secondary-600" />Verified
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          {vendor.logoURL ? (
            <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl ring-1 ring-primary-100">
              <Image
                src={vendor.logoURL}
                alt={`${vendor.businessName} logo`}
                fill
                sizes="48px"
                loading="lazy"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-400"><Briefcase className="h-6 w-6" /></div>
          )}
          <div className="min-w-0">
            <Link href={`/vendor/${vendor.id}`}><h3 className="truncate font-display text-base font-semibold text-primary-900 hover:text-primary-700">{vendor.businessName}</h3></Link>
            <p className="text-xs text-gray-500">{getCategoryName(vendor.category)}</p>
          </div>
        </div>
        {vendor.about && <p className="mt-3 line-clamp-2 text-sm text-gray-500">{vendor.about}</p>}
        {vendor.services && vendor.services.length > 0 && (
          <div className="mt-3">
            <p className="flex items-center gap-1 text-xs font-semibold text-gray-700"><ListChecks className="h-3.5 w-3.5 text-primary-600" />Services</p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{vendor.services.join(" · ")}</p>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{[vendor.address, vendor.city, vendor.state].filter(Boolean).join(", ")}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <StarRating rating={vendor.rating} />
            <span className="text-xs font-medium text-gray-900/70">{(vendor.rating ?? 0) > 0 ? (vendor.rating ?? 0).toFixed(1) : "New"}</span>
          </div>
          {vendor.experienceYears > 0 && <span className="text-xs text-gray-500">· {vendor.experienceYears}y exp</span>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center text-sm font-semibold text-primary-900">
            ₹{(vendor.startingPrice ?? 0).toLocaleString("en-IN")}
            <span className="text-xs font-normal text-gray-500"> onwards</span>
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
          {vendor.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-primary-600" />{vendor.phone}</span>}
          {vendor.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-green-600" />{vendor.whatsapp}</span>}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/vendor/${vendor.id}`} className="btn-outline flex-1 text-xs">View Profile</Link>
          <Link href={`/vendor/${vendor.id}?book=1`} className={cn("btn-primary flex-1 text-xs")}>Book Now</Link>
        </div>
      </div>
    </div>
  );
}
