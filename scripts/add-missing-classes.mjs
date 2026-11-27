import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Add missing classes with sample students
const missingClasses = [
  { class: "9", sections: ["A", "B"], baseCount: 20 },
  { class: "10", sections: ["A", "B"], baseCount: 20 },
  { class: "11", sections: ["A", "B"], baseCount: 15 },
  { class: "12", sections: ["A", "B"], baseCount: 15 },
];

const firstNames = ["Aarav", "Aditi", "Arjun", "Ananya", "Dev", "Diya", "Ishaan", "Kiara", "Krish", "Meera", "Neel", "Nisha", "Rohan", "Riya", "Samar", "Sia", "Vivaan", "Zara"];
const lastNames = ["Sharma", "Patel", "Singh", "Gupta", "Kumar", "Agarwal", "Jain", "Verma", "Reddy", "Nair", "Iyer", "Menon", "Das", "Bose", "Roy", "Mukherjee", "Banerjee", "Chatterjee"];
const fatherNames = ["Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh", "Ganesh", "Harish", "Naresh", "Umesh", "Mukesh"];
const motherNames = ["Priya", "Sunita", "Anita", "Neeta", "Geeta", "Seeta", "Reeta", "Meeta", "Beeta", "Leeta"];
const addresses = ["Aligarh", "Delhi", "Mumbai", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur"];

async function addStudents() {
  for (const cls of missingClasses) {
    for (const section of cls.sections) {
      const existing = await db.from('students').select('id').eq('class', cls.class).eq('section', section).limit(1);
      if (existing.data && existing.data.length > 0) {
        console.log(`Class ${cls.class} Section ${section} already has students, skipping`);
        continue;
      }
      
      const students = [];
      for (let i = 0; i < cls.baseCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fatherName = fatherNames[Math.floor(Math.random() * fatherNames.length)];
        const motherName = motherNames[Math.floor(Math.random() * motherNames.length)];
        const address = addresses[Math.floor(Math.random() * addresses.length)];
        const phone = `9${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        const altPhone = `8${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        const admissionNumber = `${Math.floor(Math.random() * 9000) + 1000}/${20 + Math.floor(Math.random() * 10)}`;
        
        students.push({
          admission_number: admissionNumber,
          first_name: firstName,
          last_name: lastName,
          class: cls.class,
          section: section,
          class_order: parseInt(cls.class) + 2,
          serial_no: i + 1,
          enrollment_status: "active",
          date_of_birth: `${2010 - parseInt(cls.class)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          gender: Math.random() > 0.5 ? "Male" : "Female",
          father_name: fatherName,
          mother_name: motherName,
          phone: phone,
          alternate_phone: altPhone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.kidsaligarh.com`,
          address: address,
          aadhaar_number: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
          apaar_id: null,
          pen_number: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
          caste: "General",
          stream: parseInt(cls.class) >= 11 ? (Math.random() > 0.5 ? "PCM" : "PCB") : null,
          remark: null,
          class_teacher: "TBD",
          photo: null,
          status: "published",
          created_by: null,
          data_source: "seed-2026",
        });
      }
      
      const { error } = await db.from('students').insert(students);
      if (error) {
        console.error(`Error inserting Class ${cls.class} Section ${section}:`, error.message);
      } else {
        console.log(`Added ${cls.baseCount} students to Class ${cls.class} Section ${section}`);
      }
    }
  }
  
  console.log("Done!");
}

addStudents().catch(console.error);