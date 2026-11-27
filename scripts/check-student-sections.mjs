import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function checkStudentSections() {
  console.log("=== CHECKING STUDENT SECTIONS ===\n");
  
  const { data: students, error } = await db
    .from('students')
    .select('class, section')
    .eq('status', 'published');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log("Total students:", students.length);
  
  const sectionCounts = {};
  students.forEach(s => {
    const cls = s.class || 'unknown';
    const section = s.section || 'none';
    const key = cls + ' ' + section;
    sectionCounts[key] = (sectionCounts[key] || 0) + 1;
  });
  
  const classOrder = ['Play Group', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  
  classOrder.forEach(cls => {
    ['A', 'B', ''].forEach(section => {
      const key = cls + ' ' + section;
      const count = sectionCounts[key] || 0;
      if (count > 0 || section === '') {
        console.log(key + ': ' + count + ' students');
      }
    });
  });
  
  const noSection = students.filter(s => !s.section || s.section === '').length;
  console.log('\nStudents without section: ' + noSection);
  
  const { data: dupCheck } = await db
    .from('students')
    .select('admission_number')
    .eq('status', 'published');
  
  const admissionNumbers = dupCheck?.map(s => s.admission_number) || [];
  const duplicates = admissionNumbers.filter((num, i) => admissionNumbers.indexOf(num) !== i);
  console.log('Duplicate admission numbers: ' + duplicates.length);
  if (duplicates.length > 0) {
    console.log('Duplicates:', duplicates);
  }
}

checkStudentSections().catch(console.error);