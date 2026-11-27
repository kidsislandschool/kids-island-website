import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check current class distribution
const { data, error } = await db.from('students').select('class, section').order('class_order');
if (error) {
  console.error('Error:', error);
} else {
  const counts = {};
  data.forEach(row => {
    const key = `${row.class} ${row.section || ''}`.trim();
    counts[key] = (counts[key] || 0) + 1;
  });
  console.log('Current class distribution:', counts);
  console.log('Total students:', data.length);
}