import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function updateContent(key, value, status = "published") {
  const { error } = await db.from("content").upsert({
    key,
    value: JSON.stringify(value),
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  
  if (error) {
    console.error(`Error updating ${key}:`, error.message);
  } else {
    console.log(`Updated ${key}`);
  }
}

const siteSettings = {
  name: "Kids Island Senior Secondary School",
  shortName: "Kids Island",
  tagline: "Shaping bright futures through quality education",
  location: "Aligarh, Uttar Pradesh, India — 202001",
  phone: "+91 9012655655",
  email: "contact@kidsaligarh.com",
  whatsapp: "+91 9997973574",
  whatsappNote: "",
  hoursPhone: "Mon-Sat 8:00 AM - 4:00 PM; Sunday closed",
  hoursOffice: "Mon-Fri 8:00 AM - 4:00 PM; Sat 8:00 AM - 1:00 PM; Sun closed",
  logoText: "Kids Island",
  socials: [
    { label: "Facebook", url: "https://facebook.com/kidsislandaligarh" },
    { label: "Instagram", url: "https://instagram.com/kidsislandaligarh" },
    { label: "YouTube", url: "https://www.youtube.com/@kidsislandaligarhschool" }
  ],
  affiliation: ""
};

await updateContent("settings.site", siteSettings);
console.log("Done!");