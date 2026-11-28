import { getStaffSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STAFF_COLUMNS =
  "id, name, email, phone, designation, qualification, bio, photo, created_at, updated_at";
const FACULTY_COLUMNS =
  "id, name, email, designation, qualification, bio, photo, subjects, status, order_index, featured, created_at, updated_at";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile, error } = await supabaseAdmin
    .from("staff")
    .select(STAFF_COLUMNS)
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("GET /api/staff/profile error:", error);
    return Response.json({ error: "Could not load your profile." }, { status: 500 });
  }

  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  const { data: faculty, error: facultyError } = await supabaseAdmin
    .from("faculty")
    .select(FACULTY_COLUMNS)
    .eq("email", profile.email)
    .maybeSingle();

  if (facultyError) {
    console.error("GET /api/staff/profile faculty error:", facultyError);
  }

  return Response.json({ profile, faculty: faculty ?? null });
}
