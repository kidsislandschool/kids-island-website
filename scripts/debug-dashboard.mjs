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

// Simulate the exact dashboard page execution
async function testDashboardPage() {
  const cookieName = "ki_staff_session";
  
  // First, let's create a valid session and get the cookie value
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const STAFF_sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
  
  const { data: sessionData } = await db
    .from('staff_sessions')
    .insert({
      token_hash: STAFF_sha256(token),
      user_id: 15,
      expires_at: expires,
      ip: '127.0.0.1',
      user_agent: 'test',
    })
    .select()
    .single();
  
  const cookieValue = token;
  console.log("Cookie value:", cookieValue);
  
  // Now simulate getStaffSession() with this cookie
  // This mimics what the server component does
  const jar = { get: (name) => name === cookieName ? { value: cookieValue } : undefined };
  const tokenFromCookie = jar.get(cookieName)?.value;
  
  if (!tokenFromCookie) {
    console.log("No token in cookie");
    return;
  }
  
  const { data: row, error: rowError } = await db
    .from('staff_sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      staff!inner (id, email, name, status)
    `)
    .eq('token_hash', STAFF_sha256(tokenFromCookie))
    .is('revoked_at', null)
    .single();
  
  console.log("Session lookup:", { row, rowError });
  
  if (rowError || !row) {
    console.log("Session invalid");
    return;
  }
  
  if (new Date(row.expires_at).getTime() < Date.now()) {
    console.log("Session expired");
    return;
  }
  
  // Now test the dashboard data queries
  const { data: myMaterials } = await db
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('created_by', row.staff.id)
    .order('created_at', { ascending: false })
    .range(0, 4);
  
  console.log("My materials:", myMaterials);
  
  const { data: allMaterials } = await db
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log("All materials:", allMaterials);
  
  // Clean up
  await db.from('staff_sessions').delete().eq('id', sessionData.id);
}

testDashboardPage().catch(console.error);