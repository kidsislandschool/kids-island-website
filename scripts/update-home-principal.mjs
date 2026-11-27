import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function updateHomePrincipal() {
  const { error } = await db.from('content').upsert({
    key: 'home.principal',
    value: JSON.stringify({
      heading: "A Message from Founder & Manager",
      body: "Every child who walks through our gates carries a spark of potential. Our promise is to nurture that spark with warmth, discipline and joyful learning.",
      authorName: "Ms. Tara Jabeen",
      authorRole: "Founder & Manager, Kids Island Senior Secondary School",
      photo: "/images/school/trophy-cabinet.webp",
      eyebrow: "A Message from Founder & Manager"
    }),
    status: 'published',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  
  if (error) console.error("Error:", error.message);
  else console.log("home.principal updated");
}

updateHomePrincipal().catch(console.error);