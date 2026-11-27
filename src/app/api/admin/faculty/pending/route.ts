import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("faculty")
    .select("id, name, email, designation, qualification, bio, photo, subjects, status, created_at, updated_at")
    .eq("status", "needs_review")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load pending faculty:", error);
    return Response.json({ error: "Could not load pending faculty." }, { status: 500 });
  }

  return Response.json({ ok: true, rows: data ?? [], total: data?.length ?? 0 });
}