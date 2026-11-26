import { getDirectDb } from "@/lib/db";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const studentId = searchParams.get("studentId") || "";

  try {
    let query = supabaseAdmin
      .from("red_flags")
      .select(`
        *,
        student:students (
          id,
          admission_number,
          first_name,
          last_name,
          class,
          section
        ),
        assigned_by_user:users!red_flags_assigned_by_fkey (
          id,
          name,
          email
        ),
        resolved_by_user:users!red_flags_resolved_by_fkey (
          id,
          name,
          email
        )
      `, { count: "exact" });

    if (status === "active") {
      query = query.eq("resolved", false);
    } else if (status === "resolved") {
      query = query.eq("resolved", true);
    }

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    if (search) {
      query = query.or(
        `reason.ilike.%${search}%,resolution_note.ilike.%${search}%`
      );
    }

    query = query
      .order("assigned_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return Response.json({
      ok: true,
      rows: data || [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch (error) {
    console.error("GET /api/admin/red-flags error:", error);
    return Response.json({ error: "Failed to fetch red flags" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { studentId, reason, severity = "medium" } = body as {
    studentId: number;
    reason: string;
    severity?: "low" | "medium" | "high" | "critical";
  };

  if (!studentId || !reason) {
    return Response.json({ error: "Student ID and reason are required" }, { status: 400 });
  }

  try {
    // Verify student exists
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, first_name, last_name, admission_number")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
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

    if (error) throw error;

    logAudit({
      userId: user.id,
      action: "red_flag_created",
      entity: "red_flags",
      entityId: redFlag.id,
      detail: { studentId, reason, severity },
      ip: clientIp(new Request("http://localhost")) as string,
    });

    return Response.json({ ok: true, row: redFlag }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/red-flags error:", error);
    return Response.json({ error: "Failed to create red flag" }, { status: 500 });
  }
}