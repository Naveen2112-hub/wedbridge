"use client";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 px-4 text-center">
      <Heart className="h-12 w-12 text-primary-300" />
      <h1 className="heading-lg mt-4">404 - Page Not Found</h1>
      <p className="text-lead mt-2 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}
