import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fixKindergartenImage() {
  console.log("=== FIXING KINDERGARTEN IMAGE ===\n");
  
  // Get the Skill Development image
  const skillImagePath = '/images/academics/academics-skills.webp';
  const localPath = path.join(process.cwd(), 'public', skillImagePath);
  
  console.log(`Checking for Skill Development image at: ${localPath}`);
  
  if (!fs.existsSync(localPath)) {
    console.log(`Skill Development image not found at: ${localPath}`);
    return;
  }
  
  console.log(`Found Skill Development image at: ${localPath}`);
  
  // Upload to Supabase Storage
  const fileBuffer = fs.readFileSync(localPath);
  const ext = '.webp';
  const mimeType = 'image/webp';
  
  const storedName = `${Date.now()}-${crypto.randomUUID()}.webp`;
  const storagePath = `academics/${storedName}`;
  
  const { data: uploadData, error: uploadError } = await db.storage
    .from('media')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: '31536000',
    });
  
  if (uploadError) {
    console.log(`Upload failed: ${uploadError.message}`);
    return;
  }
  
  const { data: pubData } = db.storage.from('media').getPublicUrl(storagePath);
  console.log(`Uploaded to: ${pubData.publicUrl}`);
  
  // Update the academics.page content to use the new image URL for Kindergarten
  const { data: academicsData } = await db.from('content').select('key, value, status').eq('key', 'academics.page').single();
  
  if (!academicsData) {
    console.log("Academics page content not found");
    return;
  }
  
  const academics = JSON.parse(academicsData.value);
  
  // Update the Kindergarten stage image (index 0)
  academics.stages[0].image = pubData.publicUrl;
  
  const { error } = await db.from('content').upsert({
    key: 'academics.page',
    value: JSON.stringify(academics),
    status: 'published',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  
  if (error) {
    console.error("Error updating academics.page:", error.message);
  } else {
    console.log("academics.page updated with new Kindergarten image");
  }
  
  console.log("\n=== DONE ===");
}

fixKindergartenImage().catch(console.error);