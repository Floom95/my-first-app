"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginFormInner() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_callback_error") {
      setError(
        "Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an."
      );
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: values.email,
          password: values.password,
        }
      );

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError(
            "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort."
          );
        } else if (authError.message.includes("Email not confirmed")) {
          setError(
            "Ihre E-Mail-Adresse wurde noch nicht bestätigt. Bitte überprüfen Sie Ihren Posteingang."
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.session) {
        // Use window.location.href for post-login redirect (per frontend rules)
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@beispiel.de"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Passwort</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Ihr Passwort"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Anmelden
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Jetzt registrieren
          </Link>
        </div>
      </form>
    </Form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Laden...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
