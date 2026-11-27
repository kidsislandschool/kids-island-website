import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check exact class values in DB
const { data, error } = await db.from('students').select('class, section').order('class_order');
if (error) {
  console.error('Error:', error);
} else {
  const counts = {};
  data.forEach(row => {
    const cls = row.class;
    const section = row.section || '';
    const key = `${cls} ${section}`.trim();
    counts[key] = (counts[key] || 0) + 1;
  });
  console.log('All classes in DB:', JSON.stringify(counts, null, 2));
  console.log('Total students:', data.length);
  
  // Check specific classes
  const targetClasses = ['LKG', 'UKG', 'Play Group'];
  for (const cls of targetClasses) {
    const classData = data.filter(r => r.class === cls);
    console.log(`\n${cls}: ${classData.length} students`);
    if (classData.length > 0) {
      const sections = [...new Set(classData.map(r => r.section || ''))];
      console.log(`  Sections:`, sections);
    }
  }
}