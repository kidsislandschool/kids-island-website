import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fixPrincipalPhoto() {
  // Get current content
  const { data: content, error: fetchError } = await db
    .from("content")
    .select("value")
    .eq("key", "home.principal")
    .single();

  if (fetchError) {
    console.error("Error fetching:", fetchError.message);
    return;
  }

  const current = content?.value || {};
  console.log("Current photo:", current.photo);

  // Update with correct photo
  const updated = {
    ...current,
    photo: "/images/school/founder.jpeg"
  };

  const { error } = await db
    .from("content")
    .update({
      value: updated,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "home.principal");

  if (error) {
    console.error("Error updating:", error.message);
  } else {
    console.log("✅ Fixed! Photo set to /images/school/founder.jpeg");
  }
}

fixPrincipalPhoto().catch(console.error);