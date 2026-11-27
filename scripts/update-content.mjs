import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const i = line.indexOf("=");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function updateContent(key, value, status = "published") {
  const { error } = await db.from("content").upsert({
    key,
    value: JSON.stringify(value),
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  
  if (error) {
    console.error(`Error updating ${key}:`, error.message);
  } else {
    console.log(`Updated ${key}`);
  }
}

// 1. Homepage programs - 7 programs
const homePrograms = [
  {
    id: "kindergarten",
    title: "Kindergarten",
    stage: "Nursery – UKG",
    text: "Gentle first steps in a warm, play-based environment where curiosity leads the way.",
    variant: "pink"
  },
  {
    id: "primary",
    title: "Primary Education",
    stage: "Classes 1 – 5",
    text: "Building strong foundations with interactive learning methods and personalized attention for young minds.",
    variant: "blue"
  },
  {
    id: "secondary",
    title: "Secondary Education",
    stage: "Classes 6 – 10",
    text: "Core subjects deepen; study habits and critical thinking take root. Regular assessments track progress.",
    variant: "green"
  },
  {
    id: "senior-secondary",
    title: "Senior Secondary Education",
    stage: "Classes 11 – 12",
    text: "Specialized streams in Maths and Biology with expert faculty guidance and board-focused rigour.",
    variant: "amber"
  },
  {
    id: "skill-development",
    title: "Skill Development",
    stage: "All Classes",
    text: "Public speaking, debate, STEM, robotics, AI awareness and future-ready capabilities.",
    variant: "pink"
  },
  {
    id: "sports",
    title: "Sports",
    stage: "All Classes",
    text: "Athletics, team sports, yoga and physical fitness building character through play.",
    variant: "blue"
  },
  {
    id: "co-curricular",
    title: "Co-curricular Activities",
    stage: "All Classes",
    text: "Dancing, singing, cultural events, performing arts, creativity and extracurricular expression.",
    variant: "green"
  }
];

// 2. Academics page - 7 stages
const academicsPage = {
  heading: "Academics at Kids Island",
  intro: "A clear learning pathway from the early years to senior secondary.",
  stages: [
    {
      title: "Kindergarten",
      classes: "Nursery – UKG",
      text: "Foundational years focused on literacy, numeracy and curiosity through play-based methods.",
      points: [
        "Play-based learning for Nursery–UKG",
        "Phonics and early reading programme",
        "Hands-on maths with manipulatives",
        "Art, music and movement every week"
      ],
      variant: "pink",
      image: "/images/academics/academics-kindergarten.webp"
    },
    {
      title: "Primary Education",
      classes: "Class 1 – 5",
      text: "Building strong foundations with interactive learning methods and personalized attention for young minds.",
      points: [
        "Interactive learning methods",
        "Personalized attention for each child",
        "Strong focus on literacy and numeracy",
        "Regular project-based assessments"
      ],
      variant: "blue",
      image: "/images/academics/academics-primary.webp"
    },
    {
      title: "Secondary Education",
      classes: "Class 6 – 10",
      text: "Core subjects deepen; study habits and critical thinking take root. Regular assessments track progress.",
      points: [
        "Science labs and computer lab access",
        "Structured homework and revision cycles",
        "Olympiad and competitive exam exposure",
        "Career awareness sessions from Class 9"
      ],
      variant: "green",
      image: "/images/academics/academics-secondary.webp"
    },
    {
      title: "Senior Secondary",
      classes: "Class 11 – 12",
      text: "Specialised streams with expert faculty. Board-focused rigour balanced with concept clarity and application.",
      points: [
        "Maths stream: Physics, Chemistry, Maths",
        "Biology stream: Physics, Chemistry, Biology",
        "Dedicated board exam preparation",
        "University and entrance counselling"
      ],
      variant: "amber",
      image: "/images/academics/academics-senior.webp"
    },
    {
      title: "Skill Development",
      classes: "All Classes",
      text: "Beyond academics, we focus on developing critical thinking, creativity, communication and leadership.",
      points: [
        "Public speaking and debate clubs",
        "STEM projects and science fairs",
        "Robotics and AI awareness",
        "Practical skill-building and problem-solving"
      ],
      variant: "pink",
      image: "/images/academics/academics-skills.webp"
    },
    {
      title: "Sports",
      classes: "All Classes",
      text: "Physical fitness, team sports, athletics and yoga building character through play.",
      points: [
        "Athletics and track events",
        "Team sports: football, cricket, basketball",
        "Yoga and mindfulness",
        "Inter-school competitions"
      ],
      variant: "blue",
      image: "/images/academics/academics-sports.webp"
    },
    {
      title: "Co-curricular Activities",
      classes: "All Classes",
      text: "Cultural expression, performing arts, creativity and extracurricular activities for holistic development.",
      points: [
        "Dancing and singing",
        "Cultural events and festivals",
        "Performing arts and theatre",
        "Art, craft and creative expression"
      ],
      variant: "green",
      image: "/images/academics/academics-cocurricular.webp"
    }
  ]
};

// 3. Home stats - updated with 32,000 and 99%
const homeStats = [
  { label: "Students Enrolled", value: 1500, suffix: "+" },
  { label: "Years of Excellence", value: 25, suffix: "" },
  { label: "Students Nurtured", value: 32000, suffix: "" },
  { label: "Board Exam Success Rate", value: 99, suffix: "%" }
];

// 4. About stats - same figures
const aboutStats = [
  { label: "Students Enrolled", value: "1500+" },
  { label: "Years of Excellence", value: "25" },
  { label: "Students Nurtured", value: "32,000" },
  { label: "Board Exam Success Rate", value: "99%" }
];

await updateContent("home.programs", homePrograms);
await updateContent("academics.page", academicsPage);
await updateContent("home.stats", homeStats);
await updateContent("about.stats", aboutStats);

console.log("\nAll content updates complete!");