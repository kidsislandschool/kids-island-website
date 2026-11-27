import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
const path = `test/health-${Date.now()}.png`;
const up = await db.storage.from("media").upload(path, png, { contentType: "image/png", upsert: true });
console.log("upload:", up.error ? "ERR " + up.error.message : up.data?.path);
if (!up.error) {
  const pub = db.storage.from("media").getPublicUrl(path);
  const res = await fetch(pub.data.publicUrl);
  console.log("public:", res.status, pub.data.publicUrl);
  await db.storage.from("media").remove([path]);
}
