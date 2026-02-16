"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Konto erstellen"
      description="Registrieren Sie Ihre Agentur, um Influencer-Kooperationen zu verwalten."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
