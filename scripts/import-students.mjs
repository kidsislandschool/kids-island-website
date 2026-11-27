import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SOURCE = "import-2026";
const rows = JSON.parse(fs.readFileSync("scripts/students.json", "utf8"));

function splitName(name) {
  const tokens = String(name).trim().split(/\s+/);
  if (tokens.length === 1) return { first: tokens[0], last: "" };
  return { first: tokens[0], last: tokens.slice(1).join(" ") };
}

// sequential roll numbers per class+section, following the source order
const counters = new Map();
const payload = rows.map((r) => {
  const key = `${r.class}|${r.section}`;
  const n = (counters.get(key) ?? 0) + 1;
  counters.set(key, n);
  const { first, last } = splitName(r.name);
  return {
    admission_number: r.admission_number,
    first_name: first,
    last_name: last,
    class: r.class,
    section: r.section || "",
    class_order: r.class_order,
    serial_no: n,
    enrollment_status: "active",
    status: "published",
    date_of_birth: r.date_of_birth,
    gender: r.gender,
    father_name: r.father_name,
    mother_name: r.mother_name,
    address: r.address,
    phone: r.phone,
    alternate_phone: r.alternate_phone,
    aadhaar_number: r.aadhaar_number,
    apaar_id: r.apaar_id,
    pen_number: r.pen_number,
    caste: r.caste,
    stream: r.stream,
    remark: r.remark,
    class_teacher: r.class_teacher,
    data_source: SOURCE,
  };
});

console.log("Deleting previous import batch…");
const { error: delError } = await db.from("students").delete().eq("data_source", SOURCE);
if (delError) {
  console.error("delete error", delError);
  process.exit(1);
}

let inserted = 0;
for (let i = 0; i < payload.length; i += 200) {
  const batch = payload.slice(i, i + 200);
  const { error } = await db.from("students").insert(batch);
  if (error) {
    console.error(`insert error at ${i}:`, error);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`  inserted ${inserted}/${payload.length}`);
}

const { count } = await db.from("students").select("*", { count: "exact", head: true });
console.log(`\nDone. students table now has ${count} rows.`);

// sanity: per-class counts
const { data: all } = await db
  .from("students")
  .select("class, section, class_order")
  .order("class_order", { ascending: true });
const groups = new Map();
for (const r of all ?? []) {
  const k = `${r.class}${r.section ? "-" + r.section : ""}`;
  groups.set(k, (groups.get(k) ?? 0) + 1);
}
console.log([...groups.entries()].map(([k, v]) => `${k}:${v}`).join("  "));
