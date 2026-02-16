import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { collaborationFormSchema } from "@/lib/types";

// GET /api/collaborations/[id] - Get a single collaboration
export async function GET(
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

    // Fetch collaboration with relations - RLS handles access control
    const { data: collaboration, error } = await supabase
      .from("collaborations")
      .select(
        "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
      )
      .eq("id", id)
      .single();

    if (error || !collaboration) {
      return NextResponse.json(
        { error: "Kooperation nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collaboration });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// PUT /api/collaborations/[id] - Update a collaboration
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
        { error: "Nur Agency Admins koennen Kooperationen bearbeiten" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = collaborationFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ungueltige Eingabe",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.company_id !== undefined)
      updateData.company_id = parsed.data.company_id;
    if (parsed.data.assigned_influencer_id !== undefined)
      updateData.assigned_influencer_id =
        parsed.data.assigned_influencer_id || null;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.deadline !== undefined)
      updateData.deadline = parsed.data.deadline || null;
    if (parsed.data.notes !== undefined)
      updateData.notes = parsed.data.notes || null;

    // Update collaboration - RLS ensures org scoping and admin-only
    const { data: collaboration, error: updateError } = await supabase
      .from("collaborations")
      .update(updateData)
      .eq("id", id)
      .select(
        "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren der Kooperation" },
        { status: 500 }
      );
    }

    if (!collaboration) {
      return NextResponse.json(
        { error: "Kooperation nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collaboration });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE /api/collaborations/[id] - Delete a collaboration
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
        { error: "Nur Agency Admins koennen Kooperationen loeschen" },
        { status: 403 }
      );
    }

    // Delete collaboration - RLS ensures org scoping and admin-only
    // CASCADE will delete associated briefings automatically
    const { error: deleteError } = await supabase
      .from("collaborations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Fehler beim Loeschen der Kooperation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Kooperation geloescht" });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
