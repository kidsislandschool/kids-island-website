import {
  deleteCollectionRow,
  getCollectionDef,
  getCollectionRow,
  updateCollectionRow,
} from "@/lib/admin-data";
import { validateCollectionInput } from "@/lib/admin-validation";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidateCollection } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ key: string; id: string }> }
) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { key, id } = await ctx.params;
  const def = getCollectionDef(key);
  if (!def) return jsonError("Unknown collection", 404);
  const rowId = Number(id);
  if (!Number.isInteger(rowId)) return jsonError("Invalid record id", 400);

  const existing = await getCollectionRow(key, rowId);
  if (!existing) return jsonError("Record not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { data, errors } = validateCollectionInput(def, body, { create: false });
  if (errors.length) return Response.json({ error: errors[0], fields: errors }, { status: 422 });

  if (key === "gallery_photos" && data.album_id) {
    const { data: album } = await supabaseAdmin
      .from("gallery_albums")
      .select("id")
      .eq("id", data.album_id)
      .maybeSingle();
    if (!album) return jsonError("Choose an existing album for this photo.", 422);
  }

  if (
    "published_at" in data &&
    data.status === "published" &&
    !data.published_at &&
    !existing.published_at
  ) {
    data.published_at = new Date().toISOString().slice(0, 10);
  }

  const row = await updateCollectionRow(key, rowId, data);
  revalidateCollection(key);
  logAudit({
    userId: user.id,
    action:
      data.status === "published" && existing.status !== "published"
        ? `${def.key}_published`
        : `${def.key}_updated`,
    entity: def.key,
    entityId: rowId,
    detail: { title: existing[def.fields.find((f) => f.title)?.name ?? "id"] },
    ip: clientIp(req),
  });

  return Response.json({ ok: true, row });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ key: string; id: string }> }
) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { key, id } = await ctx.params;
  const def = getCollectionDef(key);
  if (!def) return jsonError("Unknown collection", 404);
  const rowId = Number(id);
  if (!Number.isInteger(rowId)) return jsonError("Invalid record id", 400);

  const existing = await getCollectionRow(key, rowId);
  if (!existing) return jsonError("Record not found", 404);

  await deleteCollectionRow(key, rowId);
  revalidateCollection(key);

  logAudit({
    userId: user.id,
    action: `${def.key}_deleted`,
    entity: def.key,
    entityId: rowId,
    detail: { title: existing[def.fields.find((f) => f.title)?.name ?? "id"] },
    ip: clientIp(req),
  });

  return Response.json({ ok: true });
}
