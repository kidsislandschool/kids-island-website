import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import crypto from "node:crypto";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Simulate the exact dashboard page execution with detailed logging
async function testDashboardPage() {
  console.log("=== Testing Staff Dashboard Page ===\n");
  
  // 1. Check staff_sessions table
  const { data: sessions, error: sessionsError } = await db
    .from('staff_sessions')
    .select('*')
    .limit(5);
  console.log("Staff sessions:", sessions?.length, sessionsError || "OK");
  
  // 2. Check staff table
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('id, name, email, status')
    .limit(5);
  console.log("Staff:", staff?.length, staffError || "OK");
  
  // 3. Test getStaffSessionByToken with a known valid session
  if (sessions && sessions.length > 0) {
    const tokenHash = sessions[0].token_hash;
    const { data: row, error } = await db
      .from('staff_sessions')
      .select(`
        token_hash,
        expires_at,
        user_id,
        staff!inner (id, email, name, status)
      `)
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .single();
    
    console.log("Session lookup:", { row: !!row, error: error?.message });
    
    if (row) {
      console.log("Staff from session:", row.staff);
      
      // 4. Test dashboard queries
      const { data: myMaterials } = await db
        .from('materials')
        .select('*', { count: 'exact' })
        .eq('created_by', row.staff.id)
        .order('created_at', { ascending: false })
        .range(0, 4);
      console.log("My materials:", myMaterials?.length);
      
      const { data: allMaterials } = await db
        .from('materials')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      console.log("All published materials:", allMaterials?.length);
    }
  }
  
  // 5. Check if there are any pending migrations or schema issues
  const { data: tables } = await db.rpc('run_query', { q: "select table_name from information_schema.tables where table_schema='public' and table_name like 'staff%'" });
  console.log("Staff-related tables:", tables);
}

testDashboardPage().catch(console.error);