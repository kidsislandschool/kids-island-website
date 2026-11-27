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

await q("students class/section", "select class, section, class_order, count(*) as cnt from students group by class, section, class_order order by class_order, class, section");
await q("red_flags RLS", "select * from pg_policies where tablename='red_flags'");
await q("students RLS", "select * from pg_policies where tablename='students'");
await q("staff RLS", "select * from pg_policies where tablename='staff'");
await q("faculty RLS", "select * from pg_policies where tablename='faculty'");
await q("gallery_photos RLS", "select * from pg_policies where tablename='gallery_photos'");
await q("testimonials RLS", "select * from pg_policies where tablename='testimonials'");