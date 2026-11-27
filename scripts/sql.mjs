import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/sql.mjs <file.sql>");
  process.exit(1);
}
const sql = fs.readFileSync(file, "utf8");
const { data, error } = await db.rpc("exec_sql", { sql });
if (error) {
  console.error("SQL ERROR:", error);
  process.exit(1);
}
console.log(JSON.stringify(data, null, 2));
