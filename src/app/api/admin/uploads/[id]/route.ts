import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { getUploadRoot, getUploadUrlPrefix } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const uploadId = Number(id);
  if (!Number.isInteger(uploadId)) return jsonError("Invalid upload id", 400);

  const { data: row } = await supabaseAdmin
    .from("uploads")
    .select("id, url, stored_name, original_name")
    .eq("id", uploadId)
    .maybeSingle();
  if (!row) return jsonError("Upload not found", 404);

  // Only ever delete inside the configured upload folder — never trust the
  // stored URL by itself.
  try {
    const uploadRoot = getUploadRoot();
    const prefix = `${getUploadUrlPrefix()}/`;
    const relative = row.url.startsWith(prefix) ? row.url.slice(prefix.length) : row.url.replace(/^\/uploads\//, "");
    const diskPath = path.resolve(uploadRoot, relative);
    if (diskPath.startsWith(uploadRoot + path.sep) && fs.existsSync(diskPath)) {
      fs.rmSync(diskPath, { force: true });
    }
  } catch (error) {
    console.error("Upload storage path error:", error);
  }

  await supabaseAdmin.from("uploads").delete().eq("id", uploadId);
  await logAudit({
    userId: user.id,
    action: "upload_deleted",
    entity: "upload",
    entityId: uploadId,
    detail: { name: row.original_name },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true });
}