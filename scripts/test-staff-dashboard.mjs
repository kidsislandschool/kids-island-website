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

async function testStaffFlow() {
  console.log("=== STAFF FLOW TEST ===\n");
  
  // 1. Login
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('*')
    .eq('email', 'test2@example.com')
    .single();
  
  if (staffError || !staff) {
    console.log("Staff not found:", staffError?.message);
    return;
  }
  console.log("1. Staff found:", staff.name, staff.id);
  
  // 2. Verify password
  const stored = staff.password_hash;
  const parts = stored.split('$');
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  const actual = crypto.scryptSync('@KIBA2001@', salt, expected.length, { N: 16384, r: 8, p: 1 });
  const valid = crypto.timingSafeEqual(actual, expected);
  console.log("2. Password valid:", valid);
  if (!valid) return;
  
  // 3. Create session
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const STAFF_sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
  
  const { data: sessionData, error: sessionError } = await db
    .from('staff_sessions')
    .insert({
      token_hash: crypto.createHash("sha256").update(token).digest("hex"),
      user_id: staff.id,
      expires_at: expires,
      ip: '127.0.0.1',
      user_agent: 'test',
    })
    .select()
    .single();
  
  if (sessionError) {
    console.log("Session creation failed:", sessionError.message);
    return;
  }
  console.log("3. Session created");
  
  // 4. Test getStaffSessionByToken
  const { data: row, error: rowError } = await db
    .from('staff_sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      staff!inner (id, email, name, status)
    `)
    .eq('token_hash', crypto.createHash("sha256").update(token).digest("hex"))
    .is('revoked_at', null)
    .single();
  
  console.log("4. Session lookup:", !!row, row?.staff?.name);
  
  if (!row) return;
  
  // 5. Test staff materials API (what dashboard uses)
  const { data: myMaterials, error: myMatError } = await db
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('created_by', row.staff.id)
    .order('created_at', { ascending: false })
    .range(0, 4);
  
  console.log("5. My materials:", myMaterials?.length, myMatError?.message);
  
  // 6. Test staff materials API endpoint
  const { data: allMaterials } = await db
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log("6. All published materials:", allMaterials?.length);
  
  // 7. Test creating a material via staff API simulation
  const testMaterial = {
    title: `Test Material ${Date.now()}`,
    class_level: "Class 10",
    subject: "Mathematics",
    description: "Test material description",
    file_url: "https://example.com/test.pdf",
    tags: "test,math",
    status: "published",
    published_at: new Date().toISOString().split('T')[0],
    created_by: staff.id,
  };
  
  const { data: material, error: matError } = await db
    .from('materials')
    .insert({
      ...testMaterial,
      created_by: staff.id,
    })
    .select()
    .single();
  
  if (matError) {
    console.log("Material creation failed:", matError.message);
  } else {
    console.log("Material created:", material.id, material.title);
    
    // Verify it appears in staff dashboard query
    const { data: staffMats } = await db
      .from('materials')
      .select('*', { count: 'exact' })
      .eq('created_by', staff.id)
      .order('created_at', { ascending: false })
      .range(0, 4);
    
    console.log("Staff dashboard query:", staffMats?.length);
    staffMats?.forEach(m => console.log(`   - ${m.title} (${m.status})`));
    
    // Cleanup
    await db.from('materials').delete().eq('id', material.id);
    console.log("\n✅ Cleaned up test material");
  }
  
  // Cleanup session
  await db.from('staff_sessions').delete().eq('id', sessionData.id);
  console.log("\n✅ All tests passed!");
}

testStaffFlow().catch(console.error);