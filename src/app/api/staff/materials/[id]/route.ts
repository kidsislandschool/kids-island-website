import { getDirectDb } from "@/lib/db";
import { requireStaffApi } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp, jsonError } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireStaffApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
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
    return Response.json({ error: "Please fill in all required fields (Title, Class, Subject)." }, { status: 422 });
  }

  if (!["published", "draft", "needs_review"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 422 });
  }

  const db = getDirectDb();

  // Verify ownership
  const existing = await db.selectOne('materials', '*', { id: materialId, created_by: session.user.id });
  if (!existing) return Response.json({ error: "Material not found or access denied" }, { status: 404 });

  await db.update('materials', {
    title,
    class_level,
    subject,
    description: description || null,
    file_url: file_url || null,
    tags: tags || null,
    status,
    published_at,
    updated_at: new Date().toISOString(),
  }, { id: materialId, created_by: session.user.id });

  await logAudit({
    userId: session.user.id,
    action: "material_updated",
    entity: "materials",
    entityId: materialId,
    detail: { title },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true });
}