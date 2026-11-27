import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function addFacultyRequestColumn() {
  console.log("=== ADDING FACULTY REQUEST STATUS COLUMN ===\n");
  
  // Check if column exists
  const { data: columns, error: colError } = await db
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'staff')
    .eq('column_name', 'faculty_request_status');
  
  console.log("Column check:", columns, colError?.message);
  
  if (!columns || columns.length === 0) {
    console.log("Adding faculty_request_status column...");
    // Use raw SQL via RPC
    const { error } = await db.rpc('run_query', { 
      q: "ALTER TABLE public.staff ADD COLUMN faculty_request_status TEXT DEFAULT 'none' CHECK (faculty_request_status IN ('none', 'pending', 'approved', 'rejected'))" 
    });
    if (error) {
      console.error("Error adding column:", error.message);
    } else {
      console.log("Column added successfully");
    }
  } else {
    console.log("Column already exists");
  }
}

addFacultyRequestColumn().catch(console.error);