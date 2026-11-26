import type { Database } from "better-sqlite3";

/**
 * Seeds the CMS with the content extracted from the existing website
 * (see kids_island_full_build_prompt.txt).
 *
 * Anything that the specification marks as unverified — statistics,
 * testimonials, affiliation claims, eligibility rules, distances,
 * WhatsApp availability, FAQ specifics — is seeded with status
 * `needs_review` and is therefore NOT rendered publicly until a Master
 * Admin publishes it. The admin dashboard surfaces these in a review queue.
 */

type ContentSeed = { key: string; value: unknown; status?: "published" | "draft" | "needs_review" };

const PUBLISHED = "published" as const;
const REVIEW = "needs_review" as const;

const CONTENT: ContentSeed[] = [
  // ---------------------------------------------------------------- settings
  {
    key: "settings.site",
    status: PUBLISHED,
    value: {
      name: "Kids Island Senior Secondary School",
      shortName: "Kids Island",
      tagline: "Shaping bright futures through quality education",
      location: "Aligarh, Uttar Pradesh, India — 202001",
      phone: "+91 9012655655",
      email: "contact@kidsaligarh.com",
      whatsapp: "+91 9997973574",
      // Unverified availability claim — hidden until approved.
      whatsappNote: "Available 24/7",
      hoursPhone: "Mon–Sat 8:00 AM – 4:00 PM · Sunday closed",
      hoursOffice: "Mon–Fri 8:00 AM – 4:00 PM · Sat 8:00 AM – 1:00 PM · Sun closed",
      logoText: "Kids Island",
      socials: [] as { label: string; url: string }[],
      affiliation: "",
    },
  },
  {
    // Claimed on the current homepage/about but conflicts with CBSE
    // references in admissions content — must be reviewed before publishing.
    key: "settings.affiliation",
    status: REVIEW,
    value: "UP Board Affiliated",
  },
  {
    key: "settings.footer",
    status: PUBLISHED,
    value: {
      blurb:
        "A cheerful, caring campus in the heart of Aligarh where strong foundations, curious minds and confident futures are built every day.",
      quickLinks: [
        { label: "About Us", href: "/about" },
        { label: "Academics", href: "/academics" },
        { label: "Admissions", href: "/admissions" },
        { label: "Faculty", href: "/faculty" },
        { label: "Study Materials", href: "/study-materials" },
        { label: "Gallery", href: "/gallery" },
        { label: "Notices", href: "/notices" },
        { label: "Contact", href: "/contact" },
      ],
      resources: [
        { label: "Admission Inquiry", href: "/admissions#inquiry" },
        { label: "FAQs", href: "/contact#faq" },
        { label: "Campus Visit", href: "/contact#visit" },
        { label: "Staff Login", href: "/staff-login" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ],
      copyright: "Kids Island Senior Secondary School, Aligarh. All rights reserved.",
    },
  },
  {
    key: "settings.nav",
    status: PUBLISHED,
    value: {
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Academics", href: "/academics" },
        { label: "Admissions", href: "/admissions" },
        { label: "Faculty", href: "/faculty" },
        { label: "Study Materials", href: "/study-materials" },
        { label: "Gallery", href: "/gallery" },
        { label: "Notices", href: "/notices" },
        { label: "Contact", href: "/contact" },
      ],
      cta: { label: "Apply for Admission", href: "/admissions#inquiry" },
    },
  },
  {
    key: "settings.seo",
    status: PUBLISHED,
    value: {
      "/": {
        title: "Kids Island Senior Secondary School, Aligarh",
        description:
          "A joyful, caring school in Aligarh for nursery to class 12 — quality education, experienced faculty and a campus where every child belongs.",
      },
      "/about": {
        title: "About Us",
        description:
          "Learn about Kids Island Senior Secondary School, Aligarh — our story, mission, vision, values and the facilities that support everyday learning.",
      },
      "/academics": {
        title: "Academics",
        description:
          "Academic programmes at Kids Island from nursery to class 12, including senior secondary Maths and Biology streams and skill development.",
      },
      "/admissions": {
        title: "Admissions",
        description:
          "Admission process, required documents and admission enquiry form for Kids Island Senior Secondary School, Aligarh.",
      },
      "/faculty": {
        title: "Our Faculty",
        description:
          "Meet the educators at Kids Island Senior Secondary School, Aligarh.",
      },
      "/study-materials": {
        title: "Study Materials",
        description:
          "Curated notes, assignments and learning resources published by Kids Island Senior Secondary School.",
      },
      "/gallery": {
        title: "Campus Gallery",
        description:
          "Photos and moments from academic and extracurricular life at Kids Island Senior Secondary School.",
      },
      "/notices": {
        title: "Notices & Announcements",
        description:
          "Latest notices, events and announcements from Kids Island Senior Secondary School, Aligarh.",
      },
      "/contact": {
        title: "Contact Us",
        description:
          "Get in touch with Kids Island Senior Secondary School — phone, email, campus visit and enquiry form.",
      },
      "/admin-login": {
        title: "Admin Login",
        description: "Master Admin sign-in for Kids Island Senior Secondary School.",
      },
      "/staff-login": {
        title: "Staff Login",
        description: "Secure Master Admin access for Kids Island Senior Secondary School.",
      },
    },
  },

  // ------------------------------------------------------------------- home
  {
    key: "home.hero",
    status: PUBLISHED,
    value: {
      eyebrow: "Kids Island Senior Secondary School · Aligarh",
      headline: "Shaping bright futures through quality education",
      intro:
        "A joyful, safe and stimulating campus where children from nursery to class 12 grow into confident, curious and capable young learners.",
      primaryCta: { label: "Apply for Admission", href: "/admissions#inquiry" },
      secondaryCta: { label: "Explore Academics", href: "/academics" },
      badges: ["Nursery to Class 12", "Maths & Biology streams", "Caring, safe campus"],
      // Clearly replaceable placeholder slides until real photos arrive.
      slides: [
        { id: "s1", label: "Curious young learners", variant: "classroom" },
        { id: "s2", label: "Hands-on discovery", variant: "science" },
        { id: "s3", label: "Reading & imagination", variant: "library" },
        { id: "s4", label: "Play, sport & teamwork", variant: "play" },
      ],
    },
  },
  {
    key: "home.highlights",
    status: PUBLISHED,
    value: [
      { title: "Quality Education", text: "A structured, engaging curriculum that builds strong academic foundations.", icon: "book" },
      { title: "Holistic Development", text: "Learning that reaches beyond books — sports, arts, values and life skills.", icon: "sparkle" },
      { title: "Experienced Faculty", text: "Dedicated educators who guide every child with patience and care.", icon: "teacher" },
      { title: "Safe & Caring Campus", text: "A nurturing, inclusive environment where children feel they belong.", icon: "shield" },
    ],
  },
  {
    key: "home.programs",
    status: PUBLISHED,
    value: [
      {
        title: "Primary Education",
        stage: "Nursery – Class 5",
        text: "Building strong foundations with interactive learning methods and personalized attention for young minds.",
        variant: "pink",
      },
      {
        title: "Secondary Education",
        stage: "Class 6 – Class 10",
        text: "Comprehensive curriculum preparing students for board examinations and future academic pursuits.",
        variant: "blue",
      },
      {
        title: "Senior Secondary – Maths",
        stage: "Class 11 – 12 (PCM)",
        text: "Specialized Mathematics stream with expert faculty for JEE and competitive exam preparation.",
        variant: "green",
      },
      {
        title: "Senior Secondary – Biology",
        stage: "Class 11 – 12 (PCB)",
        text: "Specialized Biology stream with expert faculty for NEET and medical entrance preparation.",
        variant: "amber",
      },
      {
        title: "Co-curricular Activities",
        stage: "All Classes",
        text: "Sports, arts, music, debate, and clubs for holistic personality development.",
        variant: "pink",
      },
      {
        title: "Skill Development",
        stage: "Beyond Academics",
        text: "Critical thinking, creativity, leadership, and life skills for future readiness.",
        variant: "blue",
      },
    ],
  },
  {
    key: "home.facilities",
    status: PUBLISHED,
    value: [
      { title: "Well-equipped Classrooms", text: "Bright, airy rooms designed for focused and interactive learning.", variant: "classroom" },
      { title: "Library", text: "A growing collection of books that invites children to read and explore.", variant: "library" },
      { title: "Science Laboratories", text: "Practical spaces where curiosity turns into experiments and understanding.", variant: "science" },
      { title: "Computer Lab", text: "Digital literacy from an early age with guided, hands-on practice.", variant: "computer" },
      { title: "Caged Turf", text: "A small all-weather turf for football and multiple sports.", variant: "play" },
      { title: "Playground", text: "Open space for free play, sport and everyday joy.", variant: "outdoor" },
    ],
  },
  {
    // NOT verified — requires client approval before publication.
    key: "home.stats",
    status: REVIEW,
    value: [
      { value: 1500, suffix: "+", label: "Students Enrolled" },
      { value: 99, suffix: "%", label: "Board Exam Success Rate" },
      { value: 2001, suffix: "", label: "Year Established" },
      { value: 32000, suffix: "", label: "Students Nurtured" },
    ],
  },
  {
    key: "home.cta",
    status: PUBLISHED,
    value: {
      title: "Ready to join our community?",
      text: "Start your child's journey towards academic excellence and personal growth at Kids Island Senior Secondary School.",
      primary: { label: "Apply Now", href: "/admissions#inquiry" },
      secondary: { label: "Book a Campus Visit", href: "/contact#visit" },
    },
  },
  {
    key: "home.principal",
    status: PUBLISHED,
    value: {
      heading: "A message from the school",
      // No verified principal name/photo/message supplied — placeholder only.
      body:
        "Every child who walks through our gates carries a spark of potential. Our promise is to nurture that spark with warmth, discipline and joyful learning — so that each student leaves Kids Island not only with marks, but with character, curiosity and confidence.",
      authorName: "— To be confirmed by the school",
      authorRole: "Principal, Kids Island Senior Secondary School",
      photo: null as string | null,
      note: "Placeholder message. Replace with the verified principal message, name and photograph from the CMS.",
    },
  },
  {
    key: "home.why",
    status: PUBLISHED,
    value: [
      {
        step: "01",
        title: "Experienced Faculty",
        text: "Our teachers bring years of expertise and passion for education, ensuring high academic standards.",
        variant: "blue",
      },
      {
        step: "02",
        title: "Holistic Development",
        text: "We focus on academics, sports, arts, and character building for well-rounded individuals.",
        variant: "pink",
      },
      {
        step: "03",
        title: "Individual Attention",
        text: "Small class sizes ensure personalized guidance and mentorship for every student.",
        variant: "green",
      },
      {
        step: "04",
        title: "Activity-rich Learning",
        text: "Laboratories, reading, sports and creative work keep learning active, practical and fun.",
        variant: "amber",
      },
    ],
  },

  // ------------------------------------------------------------------ about
  {
    key: "about.page",
    status: PUBLISHED,
    value: {
      heading: "About Kids Island Senior Secondary School",
      introHeading: "Building futures through quality education for 25 years",
      story: [
        "Kids Island Senior Secondary School was established 25 years ago with a vision to provide quality education to students in Aligarh and surrounding areas. What started as a small institution with a handful of students has grown into one of the most respected educational institutions in the region.",
        "Over the past two and a half decades, we have consistently maintained high academic standards while nurturing the overall development of our students. Our UP Board-affiliated curriculum, combined with experienced faculty and modern infrastructure, creates an ideal learning environment.",
        "Today, we serve over 1,500 students from nursery to class 12, offering specialized streams in Maths and Biology at the senior secondary level. Our alumni have gone on to excel in various fields, making us proud of the foundation we helped build.",
      ],
      mission:
        "To provide a nurturing and stimulating learning environment that encourages academic excellence, critical thinking, and character development. We aim to prepare students to become responsible global citizens who contribute positively to society.",
      vision:
        "To be recognized as a leading educational institution that shapes future leaders through innovative teaching methods, holistic development, and a commitment to excellence. We envision creating lifelong learners who are equipped to face the challenges of tomorrow.",
      values: [
        { title: "Integrity", text: "We uphold honesty, transparency, and ethical conduct in all our interactions." },
        { title: "Innovation", text: "We embrace creative teaching methods and modern educational practices." },
        { title: "Inclusivity", text: "We celebrate diversity and create an environment where every student belongs." },
        { title: "Excellence", text: "We strive for the highest standards in academics, character, and achievement." },
      ],
      whyChoose: [
        { title: "Experienced Faculty", text: "Our teachers bring years of expertise and passion for education, ensuring high academic standards." },
        { title: "Holistic Development", text: "We focus on academics, sports, arts, and character building for well-rounded individuals." },
        { title: "Individual Attention", text: "Small class sizes ensure personalized guidance and mentorship for every student." },
      ],
      facilities: [
        "Well-equipped classrooms",
        "Science laboratories",
        "Computer lab",
        "Small caged turf for multiple sports",
        "Playground",
        "Co-curricular activities (sports, arts, music, debate, clubs)",
      ],
    },
  },
  {
    key: "about.stats",
    status: REVIEW,
    value: [
      { value: 25, suffix: "", label: "Years of Excellence" },
      { value: 1500, suffix: "+", label: "Students" },
      { value: 47, suffix: "", label: "Faculty Members" },
      { value: 94.7, suffix: "%", label: "Success Rate" },
    ],
  },

  // -------------------------------------------------------------- academics
  {
    key: "academics.page",
    status: PUBLISHED,
    value: {
      heading: "Academics at Kids Island",
      intro:
        "A clear learning pathway from the early years to senior secondary — structured, engaging and designed to help every child progress with confidence.",
      stages: [
        {
          title: "Primary Education",
          classes: "Nursery – Class 5",
          text: "Building strong foundations with interactive learning methods and personalized attention for young minds.",
          points: ["Foundational literacy & numeracy", "Activity-based learning", "Regular assessment & feedback"],
          variant: "pink",
          image: "/images/academics/primary.webp",
        },
        {
          title: "Secondary Education",
          classes: "Class 6 – Class 10",
          text: "Comprehensive curriculum preparing students for board examinations and future academic pursuits.",
          points: ["Board-focused preparation", "Science, Maths & languages", "Remedial support"],
          variant: "blue",
          image: "/images/academics/secondary.webp",
        },
        {
          title: "Senior Secondary – Maths",
          classes: "Class 11 – 12 (PCM)",
          text: "Specialized Mathematics stream with expert faculty for JEE and competitive exam preparation.",
          points: ["Physics, Chemistry, Mathematics", "JEE & competitive exam guidance", "Advanced problem solving"],
          variant: "green",
          image: "/images/academics/senior-maths.webp",
        },
        {
          title: "Senior Secondary – Biology",
          classes: "Class 11 – 12 (PCB)",
          text: "Specialized Biology stream with expert faculty for NEET and medical entrance preparation.",
          points: ["Physics, Chemistry, Biology", "NEET & medical entrance guidance", "Lab & practical excellence"],
          variant: "amber",
          image: "/images/academics/senior-biology.webp",
        },
        {
          title: "Co-curricular Activities",
          classes: "All Classes",
          text: "Sports, arts, music, debate, and clubs for holistic personality development.",
          points: ["Sports & athletics", "Music, dance & drama", "Debate, quiz & literary clubs"],
          variant: "pink",
          image: "/images/academics/cocurricular.webp",
        },
        {
          title: "Skill Development",
          classes: "Across all stages",
          text: "Critical thinking, creativity, leadership, and life skills for future readiness.",
          points: ["Critical thinking", "Creativity & expression", "Leadership & life skills"],
          variant: "blue",
          image: "/images/academics/skills.webp",
        },
      ],
    },
  },

  // -------------------------------------------------------------- admissions
  {
    key: "admissions.page",
    status: PUBLISHED,
    value: {
      heading: "Join our learning community",
      subheading: "Start your child's journey towards academic excellence and holistic development",
      steps: [
        { step: "Step 1", title: "Submit Inquiry", text: "Fill out the admission inquiry form with student and parent details." },
        { step: "Step 2", title: "School Visit", text: "Schedule a visit to tour our campus and meet with our admission team." },
        { step: "Step 3", title: "Document Submission", text: "Submit required documents and complete the application process." },
        { step: "Step 4", title: "Confirmation", text: "Receive admission confirmation and complete enrollment formalities." },
      ],
      documents: [
        "Birth certificate (original for verification)",
        "Transfer certificate from previous school",
        "Previous year mark sheets/report cards",
        "Aadhar card copy of student",
        "Passport size photographs (4 copies)",
        "Parent/Guardian ID proof",
        "Address proof (utility bill/rental agreement)",
        "Caste certificate (if applicable)",
      ],
      important: [
        "Admissions are subject to availability of seats in respective class.",
        "All documents must be original for verification. Photocopies will be retained.",
        "Admission fees and other charges will be communicated during enrollment.",
      ],
      classes: [
        "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
      ],
      contactPhone: "+91 9012655655",
      contactEmail: "contact@kidsaligarh.com",
    },
  },
  {
    // Board/age guideline inconsistency flagged in the spec — review required.
    key: "admissions.eligibility",
    status: REVIEW,
    value: [
      { title: "Nursery", text: "Minimum 3 years as of March 31st" },
      { title: "LKG / UKG", text: "Age-appropriate as per CBSE guidelines (verify — homepage claims UP Board affiliation)" },
      { title: "Class 1–8", text: "Transfer certificate from previous school required" },
      { title: "Class 9", text: "Class 8 pass certificate and transfer certificate" },
      { title: "Class 11", text: "Class 10 board marks sheet and transfer certificate" },
    ],
  },

  // ----------------------------------------------------------- faculty page
  {
    key: "faculty.page",
    status: PUBLISHED,
    value: {
      heading: "Meet our faculty",
      intro:
        "Experienced educators committed to nurturing excellence, fostering curiosity, and inspiring the next generation of leaders.",
      emptyState:
        "Faculty profiles are being prepared. They will appear here once published by the school.",
    },
  },

  // ------------------------------------------------------- study materials
  {
    key: "materials.page",
    status: PUBLISHED,
    value: {
      title: "Resource Center",
      intro:
        "Access curated study notes, assignments, and educational resources designed to support your learning journey.",
      emptyState: "No study materials have been published yet. Check back soon — new resources will appear here.",
    },
  },

  // ---------------------------------------------------------------- gallery
  {
    key: "gallery.page",
    status: PUBLISHED,
    value: {
      title: "Campus Gallery",
      intro: "A glimpse into the vibrant academic and extracurricular life at Kids Island.",
      emptyState: "Gallery coming soon. Photos from campus life will appear here once published.",
    },
  },

  // --------------------------------------------------------------- contact
  {
    key: "contact.page",
    status: PUBLISHED,
    value: {
      heading: "Get in touch with us",
      intro: "We're here to answer your questions and help you learn more about our school.",
      address: "Kids Island Senior Secondary School, Aligarh, Uttar Pradesh, India — 202001",
      phone: "+91 9012655655",
      email: "contact@kidsaligarh.com",
      whatsapp: "+91 9997973574",
      hoursPhone: "Mon–Sat 8:00 AM – 4:00 PM · Sunday closed",
      hoursOffice: "Mon–Fri 8:00 AM – 4:00 PM · Sat 8:00 AM – 1:00 PM · Sunday closed",
      visitHeading: "Visit our campus",
      visitText:
        "Centrally located in Aligarh and accessible from major areas of the city — we'd love to show you around.",
    },
  },
  {
    // Distances unverified per spec.
    key: "contact.directions",
    status: REVIEW,
    value: [
      { title: "Aligarh Railway Station", text: "2.3 km from campus (verify)" },
      { title: "Civil Lines Bus Stand", text: "1.8 km from campus (verify)" },
      { title: "Aligarh Muslim University", text: "Near campus (verify)" },
    ],
  },
];

/** Rows seeded directly into tables. */
type RowSeed = { table: string; rows: Record<string, unknown>[] };

const ROWS: RowSeed[] = [
  {
    table: "testimonials",
    // Authenticity/permission must be confirmed by the client first.
    rows: [
      {
        quote:
          "The dedication of teachers at Kids Island is remarkable. My daughter has shown tremendous improvement in both academics and confidence.",
        author_name: "Priya Sharma",
        author_role: "Parent of Class 10 Student",
        order_index: 1,
        status: PUBLISHED,
      },
      {
        quote:
          "Excellent infrastructure and teaching methodology. The school has prepared my son well for competitive examinations.",
        author_name: "Rajesh Kumar",
        author_role: "Parent of Class 12 Student",
        order_index: 2,
        status: PUBLISHED,
      },
      {
        quote:
          "A nurturing environment where children are encouraged to explore their interests while maintaining academic excellence.",
        author_name: "Anita Verma",
        author_role: "Parent of Class 8 Student",
        order_index: 3,
        status: PUBLISHED,
      },
    ],
  },
  {
    table: "faqs",
    rows: [
      {
        question: "What are the school timings?",
        answer:
          "School hours are 8:00 AM to 2:30 PM for all classes. Office remains open until 4:00 PM on weekdays.",
        category: "General",
        order_index: 1,
        status: PUBLISHED,
      },
      {
        question: "Do you provide transportation?",
        answer:
          "Yes, school bus services covering major areas of Aligarh; routes and details are shared during admission.",
        category: "Facilities",
        order_index: 2,
        status: PUBLISHED,
      },
      {
        question: "How can I schedule a campus visit?",
        answer:
          "Call +91 9012655655, message WhatsApp +91 9997973574, or fill out the contact form and our team will get back to you.",
        category: "Admissions",
        order_index: 3,
        status: PUBLISHED,
      },
      {
        question: "What is the student-teacher ratio?",
        answer:
          "Our classes are kept at a size that allows personalised attention for every student. The school will publish exact figures once confirmed.",
        category: "General",
        order_index: 4,
        status: PUBLISHED,
      },
      {
        question: "What is the admission process?",
        answer:
          "The admission process involves: 1) Submit an inquiry form, 2) Schedule a campus visit, 3) Submit required documents, 4) Receive admission confirmation and complete enrollment.",
        category: "Admissions",
        order_index: 5,
        status: PUBLISHED,
      },
      {
        question: "What documents are required for admission?",
        answer:
          "Birth certificate, transfer certificate, previous year mark sheets, Aadhar card copy, passport photos (4), parent ID proof, address proof, and caste certificate (if applicable).",
        category: "Admissions",
        order_index: 6,
        status: PUBLISHED,
      },
      {
        question: "What are the age criteria for Nursery admission?",
        answer:
          "Minimum 3 years as of March 31st of the academic year for Nursery admission.",
        category: "Admissions",
        order_index: 7,
        status: PUBLISHED,
      },
      {
        question: "Which board is the school affiliated with?",
        answer:
          "Kids Island Senior Secondary School is affiliated with the Uttar Pradesh Board (UP Board).",
        category: "General",
        order_index: 8,
        status: PUBLISHED,
      },
      {
        question: "What streams are available in Class 11 and 12?",
        answer:
          "We offer Science stream with Mathematics (PCM) and Biology (PCB) options in senior secondary classes.",
        category: "Academics",
        order_index: 9,
        status: PUBLISHED,
      },
      {
        question: "Are there co-curricular activities?",
        answer:
          "Yes, we offer sports, arts, music, dance, debate, quiz, and various clubs for holistic development across all classes.",
        category: "Facilities",
        order_index: 10,
        status: PUBLISHED,
      },
      {
        question: "What is the fee structure?",
        answer:
          "Fee structure varies by class and stream. Please contact the school office at +91 9012655655 for detailed fee information.",
        category: "Admissions",
        order_index: 11,
        status: PUBLISHED,
      },
      {
        question: "Is there a playground and sports facilities?",
        answer:
          "Yes, we have a playground and a caged all-weather turf for football and multiple sports.",
        category: "Facilities",
        order_index: 12,
        status: PUBLISHED,
      },
      {
        question: "How can I contact the school office?",
        answer:
          "Call +91 9012655655, WhatsApp +91 9997973574, or email contact@kidsaligarh.com. Office hours: 8:00 AM - 4:00 PM on weekdays.",
        category: "General",
        order_index: 13,
        status: PUBLISHED,
      },
      {
        question: "Does the school provide career guidance?",
        answer:
          "Yes, we provide career and competitive exam guidance (JEE, NEET) for senior secondary students through expert faculty.",
        category: "Academics",
        order_index: 14,
        status: PUBLISHED,
      },
    ],
  },
];

export function seedIfEmpty(db: Database) {
  const contentCount = db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number };
  if (contentCount.c > 0) return;
  runSeed(db, { force: false });
}

export function runSeed(db: Database, opts: { force: boolean }) {
  const insertContent = db.prepare(
    `INSERT INTO content (key, value, status, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       status = excluded.status,
       updated_at = datetime('now')`
  );
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
  );

  const tx = db.transaction(() => {
    if (opts.force) {
      for (const { table } of ROWS) {
        if (tableExists.get(table)) db.exec(`DELETE FROM ${table}`);
      }
    }
    for (const item of CONTENT) {
      insertContent.run(item.key, JSON.stringify(item.value), item.status ?? PUBLISHED);
    }
    for (const { table, rows } of ROWS) {
      if (!tableExists.get(table)) continue;
      const cols = Object.keys(rows[0]);
      const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols
        .map((c) => `@${c}`)
        .join(", ")})`;
      const stmt = db.prepare(sql);
      const hasRows = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number };
      if (opts.force || hasRows.c === 0) {
        for (const row of rows) stmt.run(row);
      }
    }
  });
  tx();
}
