import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function testGalleryImages() {
  console.log("=== GALLERY IMAGES TEST ===\n");
  
  // Check gallery_albums
  const { data: albums, error: albumsError } = await db
    .from('gallery_albums')
    .select('id, title, cover_photo, status')
    .eq('status', 'published');
  
  console.log("Albums:", albums?.length, albumsError?.message);
  
  if (albums && albums.length > 0) {
    const albumIds = albums.map(a => a.id);
    const { data: photos, error: photosError } = await db
      .from('gallery_photos')
      .select('id, album_id, url, caption, alt, status')
      .in('album_id', albumIds)
      .eq('status', 'published');
    
    console.log("Photos:", photos?.length, photosError?.message);
    
    if (photos && photos.length > 0) {
      // Test first few image URLs
      for (const photo of photos.slice(0, 5)) {
        console.log(`\nPhoto ${photo.id}:`);
        console.log("  URL:", photo.url);
        console.log("  Alt:", photo.alt);
        console.log("  Caption:", photo.caption);
        
        // Test if URL is accessible
        try {
          const response = await fetch(photo.url, { method: 'HEAD' });
          console.log(`  Status: ${response.status} ${response.statusText}`);
          console.log(`  Content-Type: ${response.headers.get('content-type')}`);
          console.log(`  Content-Length: ${response.headers.get('content-length')}`);
          console.log(`  Cache-Control: ${response.headers.get('cache-control')}`);
        } catch (e) {
          console.log(`  Fetch error: ${e.message}`);
        }
      }
    }
  }
  
  // Check storage bucket
  const { data: buckets } = await db.storage.listBuckets();
  const mediaBucket = buckets?.find(b => b.id === 'media');
  console.log("\nMedia bucket:", mediaBucket ? "EXISTS" : "MISSING");
  if (mediaBucket) {
    console.log("  Public:", mediaBucket.public);
    console.log("  File size limit:", mediaBucket.file_size_limit);
    console.log("  MIME types:", mediaBucket.allowed_mime_types);
  }
}

testGalleryImages().catch(console.error);