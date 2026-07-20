import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-primary-700">404</h1>
      <p className="mt-4 text-lg text-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="btn-primary mt-6"><Home className="h-4 w-4" />Back to Home</Link>
    </div>
  );
}
