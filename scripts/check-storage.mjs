import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function q(label, sql) {
  const { data, error } = await db.rpc("run_query", { q: sql });
  console.log("\n==", label, "==");
  if (error) console.log("ERR", error.message);
  else console.log(JSON.stringify(data, null, 1));
}

await q("buckets", "select id, name, public, file_size_limit, allowed_mime_types, created_at from storage.buckets order by name");
await q("storage policies", "select id, bucket_id, name, definition from storage.policies order by bucket_id, name");
await q("uploads columns", "select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='uploads' order by ordinal_position");
await q("uploads count", "select count(*)::int as n from uploads");
