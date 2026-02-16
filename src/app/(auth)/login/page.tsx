"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Anmelden"
      description="Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an."
    >
      <LoginForm />
    </AuthLayout>
  );
}
