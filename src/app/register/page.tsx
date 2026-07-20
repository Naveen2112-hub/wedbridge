import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Register", description: "Create your free WedBridge account." };

export default function RegisterPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <RegisterForm />
      </div>
    </AppShell>
  );
}
