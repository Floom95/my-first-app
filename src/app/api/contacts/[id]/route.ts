import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { contactFormSchema } from "@/lib/types";

// PUT /api/contacts/[id] - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
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
        { error: "Nur Agency Admins können Ansprechpartner bearbeiten" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, position, email, phone } = parsed.data;

    // Update contact - RLS ensures org scoping and admin-only
    const { data: contact, error: updateError } = await supabase
      .from("contacts")
      .update({
        name,
        position: position || null,
        email,
        phone: phone || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren des Ansprechpartners" },
        { status: 500 }
      );
    }

    if (!contact) {
      return NextResponse.json(
        { error: "Ansprechpartner nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
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
        { error: "Nur Agency Admins können Ansprechpartner löschen" },
        { status: 403 }
      );
    }

    // Delete contact - RLS ensures org scoping and admin-only
    const { error: deleteError } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Fehler beim Löschen des Ansprechpartners" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Ansprechpartner gelöscht" });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
