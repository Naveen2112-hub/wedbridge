import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-grain">
      <div className="mx-auto max-w-md px-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-800"><Compass className="h-8 w-8" /></span>
        <p className="mt-6 font-display text-6xl font-semibold text-primary-900">404</p>
        <h1 className="heading-md mt-2">Page not found</h1>
        <p className="text-lead mt-2">The page you are looking for doesn’t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6">Back home</Link>
      </div>
    </div>
  );
}
