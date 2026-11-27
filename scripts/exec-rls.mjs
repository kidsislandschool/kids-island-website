import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const sql = fs.readFileSync("scripts/fix-rls.sql", "utf8");
const statements = sql.split(";").filter((s) => s.trim() && !s.trim().startsWith("--"));

for (const stmt of statements) {
  if (stmt.trim()) {
    try {
      // Use PostgREST's raw SQL via rpc with a custom function or direct query
      const { error } = await db.rpc("run_query", { q: stmt.trim() + ";" });
      if (error) console.log("ERR:", error.message);
      else console.log("OK");
    } catch (e) {
      console.log("EXC:", e.message);
    }
  }
}