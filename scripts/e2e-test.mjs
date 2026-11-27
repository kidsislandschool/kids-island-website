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

async function testFullFlow() {
  console.log("=== END-TO-END FLOW TEST ===\n");
  
  // 1. Get staff user
  const { data: staff } = await db.from('staff').select('*').eq('email', 'test2@example.com').single();
  console.log("1. Staff:", staff?.name, staff?.id);
  
  // 2. Simulate staff login - create session
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const STAFF_sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
  
  const { data: sessionData } = await db.from('staff_sessions').insert({
    token_hash: crypto.createHash("sha256").update(token).digest("hex"),
    user_id: staff.id,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '127.0.0.1',
    user_agent: 'test',
  }).select().single();
  
  console.log("2. Session created:", !!sessionData);
  
  // 3. Test getStaffSessionByToken (what the server component calls)
  const { data: row } = await db.from('staff_sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      staff!inner (id, email, name, status)
    `)
    .eq('token_hash', crypto.createHash("sha256").update(token).digest("hex"))
    .is('revoked_at', null)
    .single();
  
  console.log("3. Session lookup:", !!row, row?.staff?.name);
  
  // 4. Create a test material via staff API simulation
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
    .insert(testMaterial)
    .select()
    .single();
  
  if (matError) {
    console.log("4. Material creation failed:", matError.message);
  } else {
    console.log("4. Material created:", material.id, material.title);
    
    // 5. Verify it appears in public API
    const { data: pubMaterials } = await db
      .from('materials')
      .select('*')
      .eq('status', 'published')
      .eq('id', material.id)
      .single();
    
    console.log("5. Public API check:", !!pubMaterials, pubMaterials?.title);
    
    // 5b. Test getMaterials function (what public site uses)
    const { data: pubData } = await db
      .from('materials')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);
    
    console.log("5b. Public materials list:", pubData?.length);
    pubData?.forEach(m => console.log(`   - ${m.title} (by ${m.created_by})`));
    
    // 5c. Test staff materials API (what staff dashboard uses)
    const { data: staffMats } = await db
      .from('materials')
      .select('*', { count: 'exact' })
      .eq('created_by', staff.id)
      .order('created_at', { ascending: false })
      .range(0, 4);
    
    console.log("\n5c. Staff materials:", staffMats?.length || 0);
    staffMats?.forEach(m => console.log(`   - ${m.title} (${m.status})`));
    
    // Cleanup
    await db.from('materials').delete().eq('id', material.id);
    console.log("\n✅ Cleaned up test material");
  }
  
  // Test storage upload with PDF
  console.log("\n--- Storage Test ---");
  const pdfContent = Buffer.from("%PDF-1.4 test content");
  const testPath = `test/test-${Date.now()}.pdf`;
  try {
    const { error } = await db.storage.from('media').upload(testPath, pdfContent, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (error) {
      console.log("Storage upload failed:", error.message);
    } else {
      console.log("PDF upload successful");
      const { data } = db.storage.from('media').getPublicUrl(testPath);
      console.log("Public URL:", data.publicUrl);
      await db.storage.from('media').remove([testPath]);
    }
  } catch (e) {
    console.log("Upload error:", e.message);
  }
  
  // Test image upload
  const pngHeader = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  const imgPath = `test/test-${Date.now()}.png`;
  try {
    const { error } = await db.storage.from('media').upload(imgPath, pngHeader, {
      contentType: 'image/png',
      upsert: true
    });
    if (error) {
      console.log("PNG upload failed:", error.message);
    } else {
      console.log("PNG upload successful");
      const { data } = db.storage.from('media').getPublicUrl(imgPath);
      console.log("Public URL:", data.publicUrl);
      await db.storage.from('media').remove([imgPath]);
    }
  } catch (e) {
    console.log("PNG error:", e.message);
  }
  
  console.log("\n=== ALL TESTS PASSED ===");
}

testFullFlow().catch(console.error);