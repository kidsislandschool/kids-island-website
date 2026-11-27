import crypto from "node:crypto";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireStaffApi } from "@/lib/auth";
import { uploadToStorage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireStaffApi();
  if (!user) return jsonError("Unauthorized", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Could not read the uploaded file.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Choose a file to upload.", 422);
  if (file.size === 0) return jsonError("That file is empty.", 422);
  if (file.size > MAX_BYTES) return jsonError("Files must be 12 MB or smaller.", 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const subdir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300) || null;
  const mime = (file.type || "").toLowerCase();

  let storedName: string;
  let output: Buffer;
  let kind: "image" | "document";
  let storedMime: string;

  try {
    if (IMAGE_TYPES.has(mime)) {
      const image = sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 });
      const meta = await image.metadata();
      if (!meta.width || !meta.height) throw new Error("Unreadable image");
      output = await image
        .rotate()
        .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      storedName = `${crypto.randomUUID()}.webp`;
      kind = "image";
      storedMime = "image/webp";
    } else if (mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        return jsonError("That PDF could not be verified. Please re-export it and try again.", 422);
      }
      output = buffer;
      storedName = `${crypto.randomUUID()}.pdf`;
      kind = "document";
      storedMime = "application/pdf";
    } else {
      return jsonError("Upload a JPG, PNG, WebP, AVIF image or a PDF document.", 415);
    }
  } catch (error) {
    console.error("staff upload processing error:", error);
    return jsonError("That file could not be processed. Try a different file.", 422);
  }

  const storagePath = `${subdir}/${storedName}`;
  let url: string;
  try {
    url = await uploadToStorage(storagePath, output, storedMime);
  } catch (error) {
    console.error("staff storage upload error:", error);
    return jsonError("Could not store the file. Please try again.", 500);
  }

  // uploads.created_by references users(id), and staff ids are a separate
  // sequence, so staff uploads are recorded without that pointer.
  const { data: info, error: insertError } = await supabaseAdmin
    .from("uploads")
    .insert({
      original_name: file.name.slice(0, 240),
      stored_name: storedName,
      url,
      mime: storedMime,
      size: output.length,
      kind,
      alt,
      created_by: null,
    })
    .select("id")
    .single();

  if (insertError || !info) {
    console.error("staff upload insert error:", insertError);
    return jsonError("The file was stored but could not be recorded. Please try again.", 500);
  }

  await logAudit({
    userId: null,
    action: "upload_created",
    entity: "upload",
    entityId: info.id,
    detail: { name: file.name, kind, size: output.length, staffId: user.id },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json(
    {
      ok: true,
      upload: {
        id: info.id,
        url,
        kind,
        mime: storedMime,
        size: output.length,
        originalName: file.name,
      },
    },
    { status: 201 }
  );
}
