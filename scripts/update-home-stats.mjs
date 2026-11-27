import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function updateHomeStats() {
  const { error } = await db.from('content').upsert({
    key: 'home.stats',
    value: JSON.stringify([
      { label: "Students Enrolled", value: 1500, suffix: "+" },
      { label: "Years of Excellence", value: 25, suffix: "" },
      { label: "Students Nurtured", value: 32000, suffix: "+" },
      { label: "Board Exam Success Rate", value: 99, suffix: "%" }
    ]),
    status: 'published',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  
  if (error) console.error("Error:", error.message);
  else console.log("home.stats updated");
}

updateHomeStats().catch(console.error);