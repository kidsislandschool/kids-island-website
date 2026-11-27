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
await q("inquiries columns", "select column_name,data_type from information_schema.columns where table_schema='public' and table_name='inquiries' order by ordinal_position");
await q("status counts", "select 'notices' t,status,count(*)::int n from notices group by status union all select 'faculty',status,count(*)::int from faculty group by status union all select 'materials',status,count(*)::int from materials group by status union all select 'testimonials',status,count(*)::int from testimonials group by status union all select 'faqs',status,count(*)::int from faqs group by status");
