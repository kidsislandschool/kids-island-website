import { supabaseAdmin } from "./supabase";

/**
 * Supabase Storage helper for CMS uploads.
 *
 * Vercel's serverless filesystem is read-only apart from /tmp, so uploads must
 * live in Supabase Storage. The bucket is public-read; writes happen only via
 * the service-role key on the server.
 */
export const MEDIA_BUCKET = "media";

export function storagePublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadToStorage(
  path: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType,
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return storagePublicUrl(path);
}
