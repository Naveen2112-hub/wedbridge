import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login", description: "Sign in to your WedBridge account." };

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <LoginForm />
      </div>
    </AppShell>
  );
}
