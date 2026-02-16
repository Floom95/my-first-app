import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const inviteBodySchema = z.object({
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  full_name: z.string().min(1, "Name ist erforderlich"),
  role: z.enum(["influencer", "brand"], "Ungueltige Rolle. Erlaubt: influencer, brand"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is an agency_admin
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Get requesting user's profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    if (profile.role !== "agency_admin") {
      return NextResponse.json(
        { error: "Nur Agency Admins koennen Nutzer einladen" },
        { status: 403 }
      );
    }

    // Parse and validate request body with Zod
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ungueltiger Request-Body" },
        { status: 400 }
      );
    }

    const parseResult = inviteBodySchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message ?? "Validierungsfehler";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { email, full_name, role } = parseResult.data;

    // Invite user via Supabase Admin
    const adminClient = createAdminClient();
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
          role,
          invited_organization_id: profile.organization_id,
        },
      });

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `Einladung an ${email} gesendet`,
      user: inviteData.user,
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
