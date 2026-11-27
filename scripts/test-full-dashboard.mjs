import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Simulate the exact dashboard queries
async function testDashboard() {
  // 1. Check staff user 15 exists and is approved
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('id, name, email, status')
    .eq('id', 15)
    .single();
  console.log('Staff user 15:', staff, staffError);

  // 2. Check getStaffMaterials for staffId=15
  let query = db.from('materials').select('*', { count: 'exact' }).eq('created_by', 15);
  query = query.order('created_at', { ascending: false }).range(0, 4);
  const { data: myMaterials, error: myMaterialsError, count } = await query;
  console.log('My materials:', { data: myMaterials, error: myMaterialsError, count });

  // 3. Check getPublishedMaterials
  const { data: allMaterials, error: allMaterialsError } = await db
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log('All published materials:', { data: allMaterials, error: allMaterialsError });
}

testDashboard().catch(console.error);