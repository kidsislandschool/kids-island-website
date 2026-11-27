import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check materials for staffId = 15
const { data, error } = await db.from('materials').select('*').eq('created_by', 15).limit(10);
console.log('Materials for staff 15:', data, error);

// Check all materials
const { data: allData, error: allError } = await db.from('materials').select('id, title, created_by, status').limit(20);
console.log('All materials:', allData, allError);