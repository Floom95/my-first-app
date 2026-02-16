"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Passwort zurücksetzen"
      description="Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
