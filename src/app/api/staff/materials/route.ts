import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError } from "@/lib/audit";
import { requireStaffApi } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireStaffApi();
  if (!user) return jsonError("Unauthorized", 401);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const title = formData.get("title") as string;
  const class_level = formData.get("class_level") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const file_url = formData.get("file_url") as string;
  const tags = formData.get("tags") as string;
  const status = formData.get("status") as string;
  const published_at = formData.get("published_at") as string || null;

  if (!title || !class_level || !subject) {
    return jsonError("Please fill in all required fields (Title, Class, Subject).", 422);
  }

  if (!["published", "draft", "needs_review"].includes(status)) {
    return jsonError("Invalid status.", 422);
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("materials")
    .insert({
      title,
      class_level,
      subject,
      description: description || null,
      file_url: file_url || null,
      tags: tags || null,
      status,
      published_at,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("material insert error:", error);
    return jsonError("Could not save material. Please try again.", 500);
  }

  await logAudit({
    userId: user.id,
    action: "material_created",
    entity: "materials",
    entityId: inserted.id,
    detail: { title },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true, id: inserted.id }, { status: 201 });
}

export async function GET(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireStaffApi();
  if (!user) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = parseInt(url.searchParams.get("perPage") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const class_level = url.searchParams.get("class_level") || "";
  const subject = url.searchParams.get("subject") || "";

  let query = supabaseAdmin
    .from("materials")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (class_level) {
    query = query.eq("class_level", class_level);
  }
  if (subject) {
    query = query.eq("subject", subject);
  }

  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("getStaffMaterials error:", error);
    return jsonError("Could not load materials.", 500);
  }

  return Response.json({
    ok: true,
    rows: data || [],
    page,
    perPage,
    total: count || 0,
    pages: Math.ceil((count || 0) / perPage),
  });
}