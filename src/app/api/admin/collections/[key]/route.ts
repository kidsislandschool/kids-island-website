import { getCollectionDef, getCollectionRows, createCollectionRow } from "@/lib/admin-data";
import { validateCollectionInput } from "@/lib/admin-validation";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidateCollection } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { key } = await ctx.params;
  const def = getCollectionDef(key);
  if (!def) return jsonError("Unknown collection", 404);

  const url = new URL(req.url);
  const filters: Record<string, string> = {};
  for (const column of ["class", "section", "enrollment_status", "kind", "category", "class_level", "subject", "album_id"]) {
    const value = url.searchParams.get(column);
    if (value) filters[column] = value;
  }
  const result = await getCollectionRows(key, {
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    page: Number(url.searchParams.get("page")) || 1,
    perPage: Number(url.searchParams.get("perPage")) || 50,
    filters,
  });
  return Response.json({ ok: true, ...result });
}

export async function POST(req: Request, ctx: { params: Promise<{ key: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { key } = await ctx.params;
  const def = getCollectionDef(key);
  if (!def) return jsonError("Unknown collection", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const input = {
    status: def.defaultStatus,
    ...(body && typeof body === "object" ? (body as Record<string, unknown>) : {}),
  };

  const { data, errors } = validateCollectionInput(def, input, { create: true });
  if (errors.length) return Response.json({ error: errors[0], fields: errors }, { status: 422 });

  if (key === "gallery_photos" && data.album_id) {
    const { data: album } = await supabaseAdmin
      .from("gallery_albums")
      .select("id")
      .eq("id", data.album_id)
      .maybeSingle();
    if (!album) return jsonError("Choose an existing album for this photo.", 422);
  }

  if ("published_at" in data && data.status === "published" && !data.published_at) {
    data.published_at = new Date().toISOString().slice(0, 10);
  }

  const row = await createCollectionRow(key, data);
  revalidateCollection(key);
  logAudit({
    userId: user.id,
    action: `${def.key}_created`,
    entity: def.key,
    entityId: row.id,
    detail: { title: data[def.fields.find((f) => f.title)?.name ?? "id"] },
    ip: clientIp(req),
  });

  return Response.json({ ok: true, row }, { status: 201 });
}
