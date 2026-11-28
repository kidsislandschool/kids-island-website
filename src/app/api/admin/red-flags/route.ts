import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const FLAG_COLUMNS =
  "id, student_id, reason, severity, assigned_at, resolved, resolution_note, resolved_at, assigned_by, resolved_by";

type FlagRecord = {
  id: number;
  student_id: number | null;
  reason: string;
  severity: string;
  assigned_at: string;
  resolved: boolean;
  resolution_note: string | null;
  resolved_at: string | null;
  assigned_by: number | null;
  resolved_by: number | null;
};

type StudentRecord = {
  id: number;
  admission_number: string | null;
  first_name: string | null;
  last_name: string | null;
  class: string | null;
  section: string | null;
};

type UserRecord = { id: number; name: string | null; email: string | null };

/** Attach student + user details without relying on PostgREST foreign-key names. */
async function hydrateFlags(rows: FlagRecord[]) {
  if (rows.length === 0) return [];

  const studentIds = [
    ...new Set(rows.map((r) => r.student_id).filter((id): id is number => typeof id === "number")),
  ];
  const userIds = [
    ...new Set(
      rows.flatMap((r) =>
        [r.assigned_by, r.resolved_by].filter((id): id is number => typeof id === "number")
      )
    ),
  ];

  const [studentsResult, usersResult] = await Promise.all([
    studentIds.length
      ? supabaseAdmin
          .from("students")
          .select("id, admission_number, first_name, last_name, class, section")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as StudentRecord[], error: null }),
    userIds.length
      ? supabaseAdmin.from("users").select("id, name, email").in("id", userIds)
      : Promise.resolve({ data: [] as UserRecord[], error: null }),
  ]);

  const students = new Map<number, StudentRecord>(
    ((studentsResult.data ?? []) as StudentRecord[]).map((s) => [s.id, s])
  );
  const users = new Map<number, UserRecord>(
    ((usersResult.data ?? []) as UserRecord[]).map((u) => [u.id, u])
  );

  return rows.map((row) => ({
    ...row,
    student: row.student_id ? students.get(row.student_id) ?? null : null,
    assigned_by_user: row.assigned_by ? users.get(row.assigned_by) ?? null : null,
    resolved_by_user: row.resolved_by ? users.get(row.resolved_by) ?? null : null,
  }));
}

export async function GET(req: Request) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
  const perPage = Math.min(2000, Math.max(1, Number(url.searchParams.get("perPage") || "20") || 20));
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.trim();

  let query = supabaseAdmin
    .from("red_flags")
    .select(FLAG_COLUMNS, { count: "exact" })
    .order("assigned_at", { ascending: false });

  if (status === "active") query = query.eq("resolved", false);
  else if (status === "resolved") query = query.eq("resolved", true);

  if (search) {
    const { data: matchedStudents } = await supabaseAdmin
      .from("students")
      .select("id")
      .or(
        `admission_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      )
      .limit(300);

    const ids = (matchedStudents ?? []).map((s: { id: number }) => s.id);
    const filters = [`reason.ilike.%${search}%`];
    if (ids.length) filters.push(`student_id.in.(${ids.join(",")})`);
    query = query.or(filters.join(","));
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("GET /api/admin/red-flags error:", error);
    return Response.json({ error: "Could not load red flags" }, { status: 500 });
  }

  const rows = await hydrateFlags((data ?? []) as FlagRecord[]);

  return Response.json({ ok: true, rows, total: count ?? rows.length, page, perPage });
}

export async function POST(req: Request) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body && typeof body === "object") payload = body as Record<string, unknown>;
    } else {
      const formData = await req.formData();
      payload = {
        studentId: formData.get("student_id") ?? formData.get("studentId"),
        reason: formData.get("reason"),
        severity: formData.get("severity"),
      };
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawStudentId = payload.studentId ?? payload.student_id;
  const studentId = typeof rawStudentId === "number" ? rawStudentId : Number(rawStudentId);
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  const severity = typeof payload.severity === "string" ? payload.severity : "";

  if (!Number.isInteger(studentId) || studentId <= 0 || !reason) {
    return Response.json(
      { error: "Student and reason are required" },
      { status: 422 }
    );
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
    .select(FLAG_COLUMNS)
    .single();

  if (error) {
    console.error("POST /api/admin/red-flags error:", error);
    return Response.json({ error: "Could not create red flag" }, { status: 500 });
  }

  await logAudit({
    userId: user.id,
    action: "red_flag_created",
    entity: "red_flags",
    entityId: redFlag.id,
    detail: { studentId, reason, severity },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true, row: redFlag });
}
