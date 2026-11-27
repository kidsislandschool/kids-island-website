const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const spec = await res.json();
const defs = spec.definitions || spec.components?.schemas || {};
for (const t of ["students", "red_flags", "notices", "materials", "testimonials", "faqs", "inquiries", "gallery_albums", "gallery_photos"]) {
  const d = defs[t];
  console.log("\n==", t, d ? "" : "(not found)");
  if (d) {
    const props = d.properties || {};
    for (const [k, v] of Object.entries(props)) {
      console.log(`  ${k}: ${v.type ?? v.format ?? JSON.stringify(v).slice(0,60)}${v.format ? " ("+v.format+")" : ""}`);
    }
  }
}
