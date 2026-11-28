import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  let query = supabaseAdmin
    .from("red_flags")
    .select(
      "id, student_id, reason, severity, assigned_at, resolved, resolution_note, assigned_by, student:students(admission_number, first_name, last_name, class, section), assigned_by_user:users!red_flags_assigned_by_fkey(name, email), resolved_by_user:users!red_flags_resolved_by_fkey(name, email), resolved_at, resolution_note",
      { count: "exact" }
    )
    .order("assigned_at", { ascending: false });

  if (status === "active") query = query.eq("resolved", false);
  else if (status === "resolved") query = query.eq("resolved", true);
  // "all" means no filter

  if (search) {
    query = query.or(
      `reason.ilike.%${search}%,student.admission_number.ilike.%${search}%,student.first_name.ilike.%${search}%,student.last_name.ilike.%${search}%`
    );
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error loading red flags:", error);
    return Response.json({ error: "Could not load red flags" }, { status: 500 });
  }

  return Response.json({ ok: true, rows: data ?? [], total: count ?? 0, page, perPage });
}

export async function POST(req: Request) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const studentId = Number(formData.get("student_id"));
  const reason = formData.get("reason") as string;
  const severity = formData.get("severity") as string;

  if (!studentId || !reason) {
    return Response.json({ error: "Student and reason are required" }, { status: 422 });
  }

  if (!["low", "medium", "high", "critical"].includes(severity)) {
    return Response.json({ error: "Invalid severity" }, { status: 422 });
  }

  const { data: redFlag, error } = await supabaseAdmin
    .from("red_flags")
    .insert({
      student_id: studentId,
      reason,
      severity,
      assigned_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating red flag:", error);
    return Response.json({ error: "Could not create red flag" }, { status: 500 });
  }

  await logAudit({
    userId: user.id,
    action: "red_flag_created",
    entity: "red_flags",
    entityId: redFlag.id,
    detail: { studentId, reason },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true, redirect: "/admin/red-flags" });
}