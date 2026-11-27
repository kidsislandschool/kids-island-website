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

async function fixGalleryImages() {
  console.log("=== FIXING GALLERY IMAGES ===\n");
  
  // Get all gallery photos with local paths
  const { data: photos, error } = await db
    .from('gallery_photos')
    .select('id, url, caption, alt, album_id')
    .neq('url', '')
    .limit(50);
  
  if (!photos || photos.length === 0) {
    console.log("No photos found");
    return;
  }
  
  console.log(`Found ${photos.length} photos to check\n`);
  
  for (const photo of photos) {
    const url = photo.url;
    
    // Check if URL is a local path
    if (url.startsWith('/images/') || url.startsWith('/uploads/')) {
      console.log(`\nFixing photo ${photo.id}: ${url}`);
      
      // Try to find the file locally
      const localPath = path.join(process.cwd(), 'public', url);
      
      if (fs.existsSync(localPath)) {
        console.log(`  Found local file: ${localPath}`);
        
        // Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = path.basename(url);
        const ext = path.extname(url).toLowerCase();
        const mimeType = ext === '.webp' ? 'image/webp' : 
                         ext === '.png' ? 'image/png' : 
                         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
        
        const storedName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
        const storagePath = `gallery/${storedName}`;
        
        const { data: uploadData, error: uploadError } = await db.storage
          .from('media')
          .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: false,
            cacheControl: '31536000',
          });
        
        if (uploadError) {
          console.log(`  Upload failed: ${uploadError.message}`);
        } else {
          const { data: pubData } = db.storage.from('media').getPublicUrl(storagePath);
          console.log(`  Uploaded to: ${pubData.publicUrl}`);
          
          // Update the database
          const { error: updateError } = await db
            .from('gallery_photos')
            .update({ url: pubData.publicUrl })
            .eq('id', photo.id);
          
          if (updateError) {
            console.log(`  Update failed: ${updateError.message}`);
          } else {
            console.log(`  Database updated successfully`);
          }
        }
      } else {
        console.log(`  Local file not found: ${localPath}`);
      }
    } else if (url.startsWith('https://')) {
      console.log(`Photo ${photo.id}: Already using external URL: ${url}`);
    }
  }
  
  console.log("\n=== DONE ===");
}

fixGalleryImages().catch(console.error);