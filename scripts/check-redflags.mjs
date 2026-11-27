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

await q("red_flags columns", "select column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' and table_name='red_flags' order by ordinal_position");
await q("red_flags fks", "select conname, pg_get_constraintdef(oid) def from pg_constraint where conrelid='red_flags'::regclass and contype='f'");
await q("red_flags count", "select count(*)::int n from red_flags");
await q("students count", "select count(*)::int n from students");
await q("recent uploaded rows", "select id, url, kind, created_at from uploads order by id desc limit 3");
