import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await db.rpc("run_query", {
  q: `select c.conrelid::regclass::text as table_name, c.conname, pg_get_constraintdef(c.oid) as def
      from pg_constraint c
      where c.connamespace='public'::regnamespace and c.conrelid::regclass::text in ('uploads','audit_log','sessions','staff_sessions','content')
      order by table_name, conname`,
});
if (error) console.log(error); else console.log(JSON.stringify(data, null, 1));
