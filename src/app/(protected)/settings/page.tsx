"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, FileText, ChevronRight, Users } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase";
import { ROLE_LABELS } from "@/lib/types";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/lib/validations/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InviteUserForm } from "@/components/auth/invite-user-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export default function SettingsPage() {
  const { user, profile, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onUpdatePassword(values: UpdatePasswordFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Passwort wurde erfolgreich geändert.");
      form.reset();
    } catch {
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Profil und Ihre Kontoeinstellungen.
        </p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Ihre persönlichen Informationen und Rolle in der Organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{profile?.full_name || "--"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                E-Mail
              </p>
              <p className="text-sm">{user?.email || "--"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rolle</p>
              <div className="mt-1">
                {profile?.role ? (
                  <Badge variant="secondary">
                    {ROLE_LABELS[profile.role]}
                  </Badge>
                ) : (
                  <span className="text-sm">--</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Konto erstellt
              </p>
              <p className="text-sm">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin sections */}
      {isAdmin && (
        <>
          <Separator />

          {/* Team management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team verwalten
              </CardTitle>
              <CardDescription>
                Laden Sie Influencer oder Unternehmen in Ihre Organisation ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteUserForm />
            </CardContent>
          </Card>

          {/* Briefing Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Briefing-Templates</CardTitle>
              <CardDescription>
                Verwalten Sie wiederverwendbare Briefing-Vorlagen fuer Ihre
                Kooperationen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/templates">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Templates verwalten
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}

      <Separator />

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
          <CardDescription>
            Aktualisieren Sie Ihr Passwort, um Ihr Konto zu sichern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onUpdatePassword)}
              className="space-y-4 max-w-md"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Neues Passwort eingeben"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort bestätigen</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Passwort wiederholen"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Passwort ändern
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
