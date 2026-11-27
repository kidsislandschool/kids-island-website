import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check Class 9 students
const { data, error } = await db
  .from('students')
  .select('class, section, status')
  .eq('class', '9');
  
if (error) {
  console.error('Error:', error);
} else {
  console.log('Total Class 9 students:', data.length);
  const statusCounts = {};
  data.forEach(row => {
    const key = `${row.section || ''} | ${row.status}`;
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });
  console.log('Breakdown:', statusCounts);
  
  // Check for any non-published
  const nonPublished = data.filter(r => r.status !== 'published');
  console.log('Non-published:', nonPublished.length);
  if (nonPublished.length > 0) {
    console.log('Non-published details:', nonPublished.map(r => `${r.section} | ${r.status}`));
  }
}