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

async function testUploadFlow() {
  console.log("=== UPLOAD FLOW TEST ===\n");
  
  // 1. Login
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('*')
    .eq('email', 'test2@example.com')
    .single();
  
  if (staffError || !staff || staff.status !== 'approved') {
    console.log('Staff lookup failed:', staffError?.message);
    return;
  }
  console.log('1. Staff found:', staff.name);
  
  // 2. Verify password
  const stored = staff.password_hash;
  const parts = stored.split('$');
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  const actual = crypto.scryptSync('@KIBA2001@', salt, expected.length, { N: 16384, r: 8, p: 1 });
  const valid = crypto.timingSafeEqual(actual, expected);
  console.log('2. Password valid:', valid);
  if (!valid) return;
  
  // 3. Create session
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const STAFF_sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
  
  const { data: sessionData } = await db
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
  
  console.log('3. Session created');
  
  // 4. Test file upload via staff API (simulating frontend)
  console.log('\n4. Testing file upload via /api/staff/uploads...');
  
  // Create a test PDF
  const pdfContent = Buffer.from("%PDF-1.4 test content");
  const formData = new FormData();
  formData.append("file", new Blob([pdfContent], { type: "application/pdf" }), "test.pdf");
  
  // Simulate the fetch with credentials
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'vercel.app')}/api/staff/uploads`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: {
      "Cookie": `ki_staff_session=${token}`
    }
  });
  
  console.log("Upload response status:", res.status);
  const data = await res.json().catch(() => ({}));
  console.log("Upload response:", data);
  
  // Clean up
  await db.from('staff_sessions').delete().eq('id', sessionData.id);
  console.log("\n✅ Upload flow test complete!");
}

testUploadFlow().catch(console.error);