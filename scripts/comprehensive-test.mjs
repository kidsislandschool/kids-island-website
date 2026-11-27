import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function testEverything() {
  console.log("=== COMPREHENSIVE SYSTEM TEST ===\n");
  
  // 1. Check media bucket
  const { data: buckets } = await db.storage.listBuckets();
  const mediaBucket = buckets?.find(b => b.id === 'media');
  console.log("1. Media bucket:", mediaBucket ? "EXISTS" : "MISSING");
  if (mediaBucket) {
    console.log("   Public:", mediaBucket.public);
    console.log("   Size limit:", mediaBucket.file_size_limit);
    console.log("   MIME types:", mediaBucket.allowed_mime_types);
  }
  
  // 2. Test staff login
  console.log("\n2. Staff login test:");
  const { data: staff } = await db.from('staff').select('*').eq('email', 'test2@example.com').single();
  console.log("   Staff found:", !!staff, staff?.name);
  
  // 3. Test materials
  const { data: materials } = await db.from('materials').select('*').limit(5);
  console.log("\n3. Materials in DB:", materials?.length || 0);
  materials?.forEach(m => console.log(`   - ${m.title} (${m.status}) by ${m.created_by}`));
  
  // 4. Test published materials
  const { data: pubMaterials } = await db.from('materials').select('*').eq('status', 'published').limit(5);
  console.log("\n4. Published materials:", pubMaterials?.length || 0);
  
  // 5. Test upload to storage
  console.log("\n5. Testing storage upload:");
  const testContent = Buffer.from("test content");
  const testPath = `test/test-${Date.now()}.txt`;
  try {
    const { error } = await db.storage.from('media').upload(testPath, testContent, {
      contentType: 'text/plain',
      upsert: true
    });
    if (error) {
      console.log("   Upload failed:", error.message);
    } else {
      console.log("   Upload successful");
      const { data } = db.storage.from('media').getPublicUrl(testPath);
      console.log("   Public URL:", data.publicUrl);
      await db.storage.from('media').remove([testPath]);
    }
  } catch (e) {
    console.log("   Upload error:", e.message);
  }
  
  // 6. Test staff session
  const { data: sessions } = await db.from('staff_sessions').select('*').limit(3);
  console.log("\n6. Staff sessions:", sessions?.length || 0);
  
  // 7. Check materials table structure
  const { data: matCols } = await db.rpc('run_query', { 
    q: "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='materials' order by ordinal_position" 
  });
  console.log("\n7. Materials table columns:", matCols?.map(c => c.column_name).join(', '));
  
  // 8. Check uploads table
  const { data: upCols } = await db.rpc('run_query', { 
    q: "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='uploads' order by ordinal_position" 
  });
  console.log("8. Uploads table columns:", upCols?.map(c => c.column_name).join(', '));
  
  // 8. Check staff table
  const { data: staffCols } = await db.rpc('run_query', { 
    q: "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='staff' order by ordinal_position" 
  });
  console.log("9. Staff table columns:", staffCols?.map(c => c.column_name).join(', '));
  
  // 10. Check staff_sessions table
  const { data: ssCols } = await db.rpc('run_query', { 
    q: "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='staff_sessions' order by ordinal_position" 
  });
  console.log("10. Staff_sessions table columns:", ssCols?.map(c => c.column_name).join(', '));
  
  console.log("\n=== TEST COMPLETE ===");
}

testEverything().catch(console.error);