import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function updateAboutPage() {
  const { error } = await db.from('content').upsert({
    key: 'about.page',
    value: JSON.stringify({
      heading: "About Kids Island Senior Secondary School",
      introHeading: "Building futures through quality education for 25 years",
      story: [
        "Kids Island Senior Secondary School was established 25 years ago with a vision to provide quality education to students in Aligarh and surrounding areas. What started as a small institution with a handful of students has grown into one of the most respected educational institutions in the region.",
        "Over the past two and a half decades, we have consistently maintained high academic standards while nurturing the overall development of our students. Our UP Board-affiliated curriculum, combined with experienced faculty and modern infrastructure, creates an ideal learning environment.",
        "Today, we serve over 1,500 students from nursery to class 12, offering specialized streams in Maths and Biology at the senior secondary level. Our alumni have gone on to excel in various fields, making us proud of the foundation we helped build."
      ],
      mission: "To provide a nurturing and stimulating learning environment that encourages academic excellence, critical thinking, and character development. We aim to prepare students to become responsible global citizens who contribute positively to society.",
      vision: "To be recognized as a leading educational institution that shapes future leaders through innovative teaching methods, holistic development, and a commitment to excellence. We envision creating lifelong learners who are equipped to face the challenges of tomorrow.",
      values: [
        { title: "Integrity", text: "We uphold honesty, transparency, and ethical conduct in all our interactions." },
        { title: "Innovation", text: "We embrace creative teaching methods and modern educational practices." },
        { title: "Inclusivity", text: "We celebrate diversity and create an environment where every student belongs." },
        { title: "Excellence", text: "We strive for the highest standards in academics, character, and achievement." }
      ],
      whyChoose: [
        { title: "Experienced Faculty", text: "Our teachers bring years of expertise and passion for education, ensuring high academic standards." },
        { title: "Holistic Development", text: "We focus on academics, sports, arts, and character building for well-rounded individuals." },
        { title: "Individual Attention", text: "Small class sizes ensure personalized guidance and mentorship for every student." }
      ],
      facilities: ["Well-equipped classrooms", "Projector Hall", "Science laboratories", "Computer lab", "Small caged turf for multiple sports", "Playground"],
      storyPhoto: "/images/school/school-building.webp",
      storyInset: "/images/school/classroom.webp"
    }),
    status: 'published',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  
  if (error) console.error("Error:", error.message);
  else console.log("about.page updated");
}

updateAboutPage().catch(console.error);