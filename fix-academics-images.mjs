import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fixAcademicsImages() {
  // Get current academics.page content
  const { data: content, error: fetchError } = await db
    .from("content")
    .select("*")
    .eq("key", "academics.page")
    .single();

  if (fetchError) {
    console.error("Error fetching:", fetchError.message);
    return;
  }

  // Parse the JSON string value
  let current = typeof content.value === 'string' ? JSON.parse(content.value) : content.value;
  
  console.log("Current stages:", current.stages?.map(s => ({ title: s.title, image: s.image })));

  // Update with correct images
  if (current.stages) {
    current.stages = current.stages.map(stage => {
      if (stage.title === "Co-curricular Activities") {
        return { ...stage, image: "/images/co-curricular.jpg" };
      }
      if (stage.title === "Sports") {
        return { ...stage, image: "/images/sports.jpg" };
      }
      return stage;
    });
  }

  const { error } = await db
    .from("content")
    .update({
      value: JSON.stringify(current),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "academics.page");

  if (error) {
    console.error("Error updating:", error.message);
  } else {
    console.log("✅ Fixed academics.page images!");
    console.log("Updated stages:", current.stages?.map(s => ({ title: s.title, image: s.image })));
  }
}

fixAcademicsImages().catch(console.error);