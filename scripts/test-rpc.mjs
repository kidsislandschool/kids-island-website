import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Test what run_query supports
const { data, error } = await db.rpc("run_query", { q: "select 1 as test" });
console.log("run_query test:", error ? "ERR " + error.message : JSON.stringify(data));

// Try exec_sql
const { data: data2, error: error2 } = await db.rpc("exec_sql", { q: "select 1 as test" });
console.log("exec_sql test:", error2 ? "ERR " + error2.message : JSON.stringify(data2));