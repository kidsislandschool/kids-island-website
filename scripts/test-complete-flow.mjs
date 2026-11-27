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

// Simulate the full login flow
async function testLoginFlow() {
  const email = 'test2@example.com';
  const password = '@KIBA2001@';

  // 1. Get staff user
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('id, name, email, status, password_hash')
    .eq('email', email)
    .single();
  
  console.log('Staff lookup:', staff, staffError);

  if (!staff || staff.status !== 'approved') {
    console.log('Staff not found or not approved');
    return;
  }

  // 2. Verify password
  const stored = staff.password_hash;
  const parts = stored.split('$');
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  const actual = crypto.scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
  const valid = crypto.timingSafeEqual(actual, expected);
  console.log('Password valid:', valid);

  if (!valid) {
    console.log('Invalid password');
    return;
  }

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
  
  console.log('Session created:', sessionData, sessionError);

  if (sessionError) return;

  // 4. Test getStaffSessionByToken
  const { data: sessionRow, error: sessionRowError } = await db
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
  
  console.log('Session lookup:', sessionRow, sessionRowError);

  if (sessionRowError) return;

  // 5. Simulate dashboard queries with this session
  const sessionUserId = sessionRow.staff.id;
  console.log('Session user ID:', sessionUserId);

  // Dashboard queries
  const { data: myMaterials } = await db
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('created_by', sessionUserId)
    .order('created_at', { ascending: false })
    .range(0, 4);
  
  console.log('My materials:', myMaterials);

  const { data: allMaterials } = await db
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('All published materials:', allMaterials);
}

testLoginFlow().catch(console.error);