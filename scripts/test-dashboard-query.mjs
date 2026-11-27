import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Test the exact query the dashboard makes
const { data, error, count } = await db
  .from('materials')
  .select('*', { count: 'exact' })
  .eq('created_by', 15)
  .order('created_at', { ascending: false })
  .range(0, 4);

console.log('Query result:', { data, error, count });