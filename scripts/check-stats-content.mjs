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

await q("home.stats content", "select * from content where key='home.stats'");
await q("about.stats content", "select * from content where key='about.stats'");
await q("home page content", "select * from content where key='home.hero'");