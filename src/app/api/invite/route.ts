import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

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
        { error: "Nur Agency Admins können Nutzer einladen" },
        { status: 403 }
      );
    }

    // Parse request body
    const { email, full_name, role } = await request.json();

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: "E-Mail, Name und Rolle sind Pflichtfelder" },
        { status: 400 }
      );
    }

    if (!["influencer", "brand"].includes(role)) {
      return NextResponse.json(
        { error: "Ungültige Rolle. Erlaubt: influencer, brand" },
        { status: 400 }
      );
    }

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
