import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" /></div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
