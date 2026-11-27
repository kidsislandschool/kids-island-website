import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check exact class values with char codes
const { data, error } = await db
  .from('students')
  .select('class')
  .in('class', ['LKG', 'UKG', 'Play Group']);
  
if (error) {
  console.error('Error:', error);
} else {
  const unique = [...new Set(data.map(r => r.class))];
  console.log('Unique class values:', unique);
  unique.forEach(cls => {
    console.log(`  "${cls}" (length: ${cls.length}, char codes: ${[...cls].map(c => c.charCodeAt(0)).join(',')})`);
  });
}