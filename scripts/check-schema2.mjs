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

await q(
  "students columns",
  "select column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' and table_name='students' order by ordinal_position"
);
await q("sample students", "select * from students limit 2");
await q("staff columns", "select column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' and table_name='staff' order by ordinal_position");
await q("faculty columns", "select column_name,data_type,is_nullable from information_schema.columns where table_schema='public' and table_name='faculty' order by ordinal_position");
await q("staff rows", "select id, name, email, status, subject, designation from staff order by id desc limit 10");
