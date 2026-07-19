import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <PublicLayout>
      <section className="container-page section-pad">
        <div className="mx-auto max-w-md">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="heading-md mt-5">Login</h1>
          <p className="text-lead mt-2">Authentication will be available in the next milestone.</p>
          <Link href="/" className="btn-outline mt-6">Back to home</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
