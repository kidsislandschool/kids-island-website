import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

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