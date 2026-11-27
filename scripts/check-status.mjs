import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check status values for LKG/UKG students
const { data, error } = await db
  .from('students')
  .select('class, section, status')
  .in('class', ['LKG', 'UKG', 'Play Group']);
  
if (error) {
  console.error('Error:', error);
} else {
  const statusCounts = {};
  data.forEach(row => {
    const key = `${row.class} ${row.section || ''} | ${row.status}`;
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });
  console.log('Status breakdown:', JSON.stringify(statusCounts, null, 2));
}