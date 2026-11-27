import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Check staff_audit_log table
const { data, error } = await db.from('staff_audit_log').select('*').limit(5);
console.log('staff_audit_log:', data, error);

// Check if we can insert into staff_sessions
const { data: insertData, error: insertError } = await db.from('staff_sessions').insert({
  token_hash: 'test_hash',
  user_id: 15,
  expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  ip: '127.0.0.1',
  user_agent: 'test'
}).select().single();
console.log('Insert test:', insertData, insertError);

// Clean up test insert
if (!insertError && insertData) {
  await db.from('staff_sessions').delete().eq('id', insertData.id);
}