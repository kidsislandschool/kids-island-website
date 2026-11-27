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

await q("class/section tables", "select table_name from information_schema.tables where table_schema='public' and (table_name like '%class%' or table_name like '%section%')");
await q("students class/section values", "select distinct class, section from students order by class_order, section");
await q("students table columns", "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='students' order by ordinal_position");
await q("staff table columns", "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='staff' order by ordinal_position");
await q("faculty table columns", "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='faculty' order by ordinal_position");