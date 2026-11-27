import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(url, key);

async function inspect(table) {
  const { data, error } = await db.from(table).select("*").limit(1);
  if (error) {
    console.log(`\n${table}: ERROR`, error.message);
    return;
  }
  console.log(`\n${table}: columns =`, data[0] ? Object.keys(data[0]) : "(empty table)");
  const { count } = await db.from(table).select("*", { count: "exact", head: true });
  console.log(`${table}: rows =`, count);
  if (data[0]) console.log(`${table}: sample =`, JSON.stringify(data[0], null, 2).slice(0, 800));
}

(async () => {
  for (const t of ["students", "red_flags", "faculty", "staff", "users", "notices"]) {
    await inspect(t);
  }
})();
