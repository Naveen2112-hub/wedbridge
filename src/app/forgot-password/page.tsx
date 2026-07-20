import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password", description: "Reset your WedBridge account password." };

export default function ForgotPasswordPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <ForgotPasswordForm />
      </div>
    </AppShell>
  );
}
