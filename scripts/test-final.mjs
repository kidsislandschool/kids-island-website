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

const STAFF_sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");

// Test the exact flow: login -> cookie -> dashboard
async function testFullFlow() {
  console.log("=== Full Login + Dashboard Flow Test ===\n");
  
  // 1. Login
  const email = 'test2@example.com';
  const password = '@KIBA2001@';
  
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('id, name, email, status, password_hash')
    .eq('email', email)
    .single();
  
  if (staffError || !staff || staff.status !== 'approved') {
    console.log('Staff lookup failed:', staffError?.message);
    return;
  }
  console.log('1. Staff found:', staff.name, staff.email);
  
  // 2. Verify password
  const stored = staff.password_hash;
  const parts = stored.split('$');
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  const actual = crypto.scryptSync('@KIBA2001@', salt, expected.length, { N: 16384, r: 8, p: 1 });
  const valid = crypto.timingSafeEqual(actual, expected);
  console.log('2. Password valid:', valid);
  if (!valid) return;
  
  // 3. Create session (simulate createStaffSession)
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: sessionData, error: sessionError } = await db
    .from('staff_sessions')
    .insert({
      token_hash: STAFF_sha256(token),
      user_id: staff.id,
      expires_at: expires,
      ip: '127.0.0.1',
      user_agent: 'test',
    })
    .select()
    .single();
  
  if (sessionError) {
    console.log('Session creation failed:', sessionError.message);
    return;
  }
  console.log('3. Session created, token:', token.slice(0, 20) + '...');
  
  // 4. Test getStaffSessionByToken (what the server component calls)
  const { data: row, error: rowError } = await db
    .from('staff_sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      staff!inner (id, email, name, status)
    `)
    .eq('token_hash', STAFF_sha256(token))
    .is('revoked_at', null)
    .single();
  
  if (rowError || !row) {
    console.log('Session lookup failed:', rowError?.message);
    return;
  }
  console.log('4. Session lookup OK, staff:', row.staff.name);
  
  // 5. Test dashboard queries exactly as dashboard page does
  const { data: myMaterials } = await db
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('created_by', row.staff.id)
    .order('created_at', { ascending: false })
    .range(0, 4);
  console.log('5. My materials query:', { count: myMaterials?.length });
  
  const { data: allMaterials } = await db
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log('6. All published materials:', allMaterials?.length);
  
  // 7. Clean up
  await db.from('staff_sessions').delete().eq('id', sessionData.id);
  console.log('\n✅ All tests passed!');
}

testFullFlow().catch(console.error);