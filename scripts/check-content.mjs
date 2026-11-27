import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const q = async (label, sql) => {
  const { data, error } = await db.rpc("run_query", { q: sql });
  console.log("\n==", label, "==");
  console.log(error ? "ERR " + error.message : JSON.stringify(data, null, 1));
};

await q("home.programs", "select * from content where key='home.programs'");
await q("academics.page", "select * from content where key='academics.page'");
await q("home.stats", "select * from content where key='home.stats'");
await q("about.stats", "select * from content where key='about.stats'");
await q("about.page", "select * from content where key='about.page'");
await q("gallery_albums", "select id, title, cover_photo, status, order_index from gallery_albums order by order_index, id");
await q("gallery_photos", "select id, album_id, url, caption, status, order_index from gallery_photos order by album_id, order_index, id");
await q("testimonials", "select id, quote, author_name, image, status from testimonials order by id desc limit 10");
await q("faculty", "select id, name, photo, status from faculty order by id desc limit 10");
await q("settings.site", "select * from content where key='settings.site'");