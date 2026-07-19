"use client";
import Link from "next/link";
export default function NotFound() { return <div className="flex min-h-[60vh] items-center justify-center bg-grain px-4"><div className="text-center"><p className="font-display text-6xl font-semibold text-primary-800">404</p><h1 className="heading-md mt-4">Page not found</h1><p className="text-lead mt-2">The page you're looking for doesn't exist.</p><Link href="/" className="btn-primary mt-6">Go home</Link></div></div>; }
