import { supabaseAdmin } from "@/lib/supabase";
import { jsonError } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

export type StaffRequest = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  qualification: string | null;
  bio: string | null;
  photo: string | null;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
  approved_at: string | null;
};

/** Admin-only list of staff sign-up requests (used by the faculty approval dialog). */
export async function GET(req: Request) {
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let query = supabaseAdmin
    .from("staff")
    .select("id, name, email, phone, designation, qualification, bio, photo, status, created_at, approved_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("GET /api/admin/staff error:", error);
    return jsonError("Could not load staff requests.", 500);
  }

  return Response.json({ ok: true, rows: data ?? [] });
}
