import { getContentRecord, setContent } from "@/lib/content";
import { validateContentValue, isContentStatus } from "@/lib/admin-validation";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { CONTENT_SCHEMAS } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ key: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { key } = await ctx.params;
  const schema = CONTENT_SCHEMAS[key];
  if (!schema) return jsonError("Unknown content block", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const payload = body as { value?: unknown; status?: unknown };
  if (!isContentStatus(payload.status)) return jsonError("Choose a valid status", 422);

  const errors = validateContentValue(key, payload.value);
  if (errors.length) {
    return Response.json({ error: errors[0], fields: errors }, { status: 422 });
  }

  const before = getContentRecord(key);
  setContent(key, payload.value, payload.status, user.id);

  logAudit({
    userId: user.id,
    action:
      payload.status === "published" && before?.status !== "published"
        ? "content_published"
        : "content_updated",
    entity: "content",
    entityId: key,
    detail: { status: payload.status, previousStatus: before?.status ?? null },
    ip: clientIp(req),
  });

  return Response.json({
    ok: true,
    record: {
      key,
      value: payload.value,
      status: payload.status,
      updated_at: new Date().toISOString(),
    },
  });
}
