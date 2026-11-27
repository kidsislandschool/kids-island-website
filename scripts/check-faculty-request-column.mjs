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
  
  // Check if column exists by trying to select it
  const { data, error } = await db
    .from('staff')
    .select('faculty_request_status')
    .limit(1);
  
  console.log("Column check:", error?.message || "OK");
  
  if (error && error.message.includes('column "faculty_request_status" does not exist')) {
    console.log("Column does not exist, needs to be added via Supabase dashboard or migration");
    console.log("Run this SQL in Supabase dashboard:");
    console.log("ALTER TABLE public.staff ADD COLUMN faculty_request_status TEXT DEFAULT 'none' CHECK (faculty_request_status IN ('none', 'pending', 'approved', 'rejected'));");
  } else if (!error) {
    console.log("Column already exists");
  } else {
    console.log("Error checking column:", error.message);
  }
}

addFacultyRequestColumn().catch(console.error);