import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data, error } = await db.rpc("run_query", {
  q: `select class, section, class_order, count(*)::int as n
      from students
      group by class, section, class_order
      order by class_order, section`,
});
if (error) console.error(error);
else console.table(data);

const { data: total } = await db.rpc("run_query", { q: `select count(*)::int as total from students` });
console.log("total:", total);
