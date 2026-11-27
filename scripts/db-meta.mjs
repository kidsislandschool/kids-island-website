import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function q(label, sql) {
  const { data, error } = await db.rpc("run_query", { q: sql });
  console.log("\n==== " + label + " ====");
  if (error) {
    console.log("ERROR", error.message);
    return;
  }
  console.log(JSON.stringify(data, null, 1));
}

await q(
  "students columns",
  `select column_name, data_type, is_nullable, column_default
   from information_schema.columns
   where table_schema='public' and table_name in ('students','red_flags','notices','testimonials')
   order by table_name, ordinal_position`
);
await q(
  "constraints",
  `select c.conrelid::regclass::text as table_name, c.conname, pg_get_constraintdef(c.oid) as def
   from pg_constraint c
   where c.connamespace = 'public'::regnamespace
     and c.conrelid::regclass::text in ('students','red_flags','notices','testimonials','faculty','staff','materials','faqs')
   order by table_name, c.conname`
);
await q(
  "indexes",
  `select tablename, indexname, indexdef from pg_indexes
   where schemaname='public' and tablename in ('students','red_flags','notices','testimonials','faculty','staff','materials','faqs','inquiries','gallery_albums','gallery_photos')
   order by tablename, indexname`
);
await q(
  "rls",
  `select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r' order by c.relname`
);
await q(
  "policies",
  `select tablename, policyname, permissive, roles, cmd, qual, with_check
   from pg_policies where schemaname='public' order by tablename, policyname`
);
await q(
  "functions",
  `select n.nspname as schema, p.proname, pg_get_function_arguments(p.oid) as args, pg_get_function_result(p.oid) as result
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' order by p.proname`
);
