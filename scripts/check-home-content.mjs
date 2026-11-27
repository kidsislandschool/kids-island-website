import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function checkHomepageContent() {
  const { data } = await db.from('content').select('key, value, status').ilike('key', 'home.%').order('key');
  console.log("Home content keys:", JSON.stringify(data?.map(d => d.key) || [], null, 2));
  
  for (const item of data || []) {
    console.log(`\n=== ${item.key} (${item.status}) ===`);
    console.log(item.value);
  }
}

checkHomepageContent().catch(console.error);