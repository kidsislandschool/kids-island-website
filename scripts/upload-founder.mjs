import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Upload founder image
const imagePath = "C:\\Users\\armaa\\Downloads\\founder.jpeg";
const imageBuffer = fs.readFileSync(imagePath);
const fileName = `founder-${Date.now()}.jpeg`;

const { data, error } = await db.storage.from("media").upload(fileName, imageBuffer, {
  contentType: "image/jpeg",
  upsert: false,
  cacheControl: "31536000",
});

if (error) {
  console.error("Upload error:", error.message);
} else {
  const { data: pub } = db.storage.from("media").getPublicUrl(fileName);
  console.log("Founder image uploaded:", pub.publicUrl);
}