import { loadEnv } from "./load-env";
// Load env first
loadEnv();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  loadEnv();
  
  console.log("Seeding content from inventory...");

  const contentUpdates = [
    // HOME (/)
    {
      key: "home.hero",
      value: {
        eyebrow: "Kids Island Senior Secondary School · Aligarh",
        headline: "Shaping bright futures through quality education",
        intro: "A joyful, safe and stimulating campus where children from nursery to class 12 grow into confident, curious and capable young learners.",
        primaryCta: { label: "Apply for Admission", href: "/admissions#inquiry" },
        secondaryCta: { label: "Explore Academics", href: "/academics" },
        badges: ["Nursery to Class 12", "Maths & Biology streams", "Caring, safe campus"],
        slides: [
          { id: "s1", label: "Curious young learners", variant: "classroom" },
          { id: "s2", label: "Hands-on discovery", variant: "science" },
          { id: "s3", label: "Reading & imagination", variant: "library" },
          { id: "s4", label: "Play, sport & teamwork", variant: "play" },
        ],
      },
      status: "published"
    },
    {
      key: "home.stats",
      value: [
        { label: "Students Enrolled", value: "1500+" },
        { label: "Years of Excellence", value: "25" },
        { label: "Experienced Faculty", value: "47" },
        { label: "Board Exam Success Rate", value: "94.7%" },
      ],
      status: "published"
    },
    {
      key: "home.why",
      value: [
        { id: "1", title: "Experienced Faculty", description: "Our teachers bring years of expertise and passion for education, ensuring high academic standards.", icon: "user-group" },
        { id: "2", title: "Holistic Development", description: "We focus on academics, sports, arts, and character building for well-rounded individuals.", icon: "award" },
        { id: "3", title: "Individual Attention", description: "Small class sizes ensure personalized guidance and mentorship for every student.", icon: "user" },
        { id: "4", title: "Modern Facilities", description: "Well-equipped classrooms, library, science labs, computer lab, and sports areas.", icon: "building" },
      ],
      status: "published"
    },
    {
      key: "home.cta",
      value: {
        title: "Ready to join our community?",
        text: "Start your child's journey towards academic excellence and personal growth at Kids Island Senior Secondary School.",
        primary: { label: "Apply Now", href: "/admissions#inquiry" },
        secondary: { label: "Book a Campus Visit", href: "/contact#visit" },
      },
      status: "published"
    },
    {
      key: "home.programs",
      value: [
        {
          id: "primary",
          title: "Primary Education",
          description: "Building strong foundations with interactive learning methods and personalized attention for young minds.",
          icon: "book-open",
        },
        {
          id: "secondary",
          title: "Secondary Education",
          description: "Comprehensive curriculum preparing students for board examinations and future academic pursuits.",
          icon: "graduation-cap",
        },
        {
          id: "senior-secondary",
          title: "Senior Secondary",
          description: "Specialized streams in Maths and Biology with expert faculty guidance.",
          icon: "flask-conical",
        },
        {
          id: "skill-development",
          title: "Skill Development",
          description: "Beyond academics, we focus on developing critical thinking, creativity, and leadership skills.",
          icon: "sparkles",
        },
      ],
      status: "published"
    },
    {
      key: "home.testimonials",
      value: [
        {
          id: 1,
          quote: "The dedication of teachers at Kids Island is remarkable. My daughter has shown tremendous improvement in both academics and confidence.",
          author_name: "Priya Sharma",
          author_role: "Parent of Class 10 Student",
        },
        {
          id: 2,
          quote: "Excellent infrastructure and teaching methodology. The school has prepared my son well for competitive examinations.",
          author_name: "Rajesh Kumar",
          author_role: "Parent of Class 12 Student",
        },
        {
          id: 3,
          quote: "A nurturing environment where children are encouraged to explore their interests while maintaining academic excellence.",
          author_name: "Anita Verma",
          author_role: "Parent of Class 8 Student",
        },
      ],
      status: "published"
    },

    // ABOUT (/about)
    {
      key: "about.page",
      value: {
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
          { title: "Excellence", text: "We strive for the highest standards in academics, character, and achievement." },
        ],
        whyChoose: [
          { title: "Experienced Faculty", text: "Our teachers bring years of expertise and passion for education, ensuring high academic standards." },
          { title: "Holistic Development", text: "We focus on academics, sports, arts, and character building for well-rounded individuals." },
          { title: "Individual Attention", text: "Small class sizes ensure personalized guidance and mentorship for every student." },
        ],
        facilities: [
          "Well-equipped classrooms",
          "Projector Hall",
          "Science laboratories",
          "Computer lab",
          "Small caged turf for multiple sports",
          "Playground"
        ],
      },
      status: "published"
    },
    {
      key: "about.stats",
      value: [
        { label: "Years of Excellence", value: "25" },
        { label: "Students", value: "1500+" },
        { label: "Faculty Members", value: "47" },
        { label: "Success Rate", value: "94.7%" },
      ],
      status: "published"
    },

    // ADMISSIONS (/admissions)
    {
      key: "admissions.page",
      value: {
        heading: "Join our learning community",
        subheading: "Start your child's journey towards academic excellence and holistic development",
        steps: [
          { step: "1", title: "Submit Inquiry", text: "Fill out the admission inquiry form with student and parent details." },
          { step: "2", title: "School Visit", text: "Schedule a visit to tour our campus and meet with our admission team." },
          { step: "3", title: "Document Submission", text: "Submit required documents and complete the application process." },
          { step: "4", title: "Confirmation", text: "Receive admission confirmation and complete enrollment formalities." },
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
          "Admissions subject to seat availability.",
          "All documents must be original for verification; photocopies retained.",
          "Fees/charges communicated during enrollment.",
        ],
        classes: [
          "Nursery — Minimum 3 years as of March 31st",
          "LKG/UKG — Age-appropriate as per CBSE guidelines",
          "Class 1-8 — Transfer certificate from previous school required",
          "Class 9 — Class 8 pass certificate and transfer certificate",
          "Class 11 — Class 10 board marks sheet and transfer certificate",
        ],
        contactPhone: "+91 9012655655",
        contactEmail: "contact@kidsaligarh.com",
      },
      status: "published"
    },

    // CONTACT (/contact)
    {
      key: "contact.page",
      value: {
        heading: "Get in touch with us",
        intro: "We're here to answer your questions and help you learn more about our school.",
        address: "Kids Island Senior Secondary School, Aligarh, Uttar Pradesh, India - 202001",
        phone: "+91 9012655655",
        email: "contact@kidsaligarh.com",
        whatsapp: "+91 9997973574",
        hoursPhone: "Mon-Sat 8:00 AM - 4:00 PM; Sunday closed",
        hoursOffice: "Mon-Fri 8:00 AM - 4:00 PM; Sat 8:00 AM - 1:00 PM; Sun closed",
        visitHeading: "Visit our campus",
        visitText: "We welcome you to visit our campus and experience our learning environment firsthand. Schedule a visit to meet our faculty and tour our facilities.",
      },
      status: "published"
    },
    {
      key: "contact.directions",
      value: [
        { title: "Centrally Located", text: "Centrally located in Aligarh, easily accessible from all major areas; well-connected by public transportation and ample parking." },
        { title: "Distances", text: "2.3 km from Aligarh Railway Station; 1.8 km from Civil Lines Bus Stand; Near Aligarh Muslim University." },
      ],
      status: "published"
    },
    {
      key: "contact.faqs",
      value: [
        { question: "What are the school timings?", answer: "School hours are 8:00 AM to 2:30 PM for all classes. Office remains open until 4:00 PM on weekdays.", category: "General", sort_order: 1 },
        { question: "Do you provide transportation?", answer: "Yes, school bus services covering major areas of Aligarh. Transportation details and routes are provided during admission.", category: "Transport", sort_order: 2 },
        { question: "How can I schedule a campus visit?", answer: "Call +91 9012655655, WhatsApp +91 9997973574, or fill out the contact form.", category: "Visit", sort_order: 3 },
        { question: "What is the student-teacher ratio?", answer: "We maintain a healthy student-teacher ratio to ensure personalized attention for every student.", category: "Academic", sort_order: 4 },
      ],
      status: "published"
    },

    // FACULTY (/faculty)
    {
      key: "faculty.page",
      value: {
        heading: "Meet our faculty",
        intro: "Experienced educators committed to nurturing excellence, fostering curiosity, and inspiring the next generation of leaders.",
        emptyState: "No faculty profiles available at the moment.",
      },
      status: "published"
    },

    // STUDY MATERIALS (/study-materials)
    {
      key: "materials.page",
      value: {
        title: "Resource Center",
        intro: "Access curated study notes, assignments, and educational resources designed to support your learning journey.",
        emptyState: "No materials found. We couldn't find any study materials matching your current filters. Try adjusting your search criteria.",
      },
      status: "published"
    },

    // GALLERY (/gallery)
    {
      key: "gallery.page",
      value: {
        title: "Campus Gallery",
        intro: "A glimpse into the vibrant academic and extracurricular life at Kids Island.",
        emptyState: "Gallery coming soon! We are currently curating our best moments to share with you. Check back later.",
      },
      status: "published"
    },

    // SETTINGS
    {
      key: "settings.site",
      value: {
        name: "Kids Island Senior Secondary School",
        shortName: "Kids Island",
        tagline: "Shaping bright futures through quality education",
        location: "Aligarh, Uttar Pradesh, India — 202001",
        phone: "+91 9012655655",
        email: "contact@kidsaligarh.com",
        whatsapp: "+91 9997973574",
        whatsappNote: "",
        hoursPhone: "Mon-Sat 8:00 AM - 4:00 PM; Sunday closed",
        hoursOffice: "Mon-Fri 8:00 AM - 4:00 PM; Sat 8:00 AM - 1:00 PM; Sun closed",
        logoText: "Kids Island",
        socials: [
          { label: "Facebook", url: "https://facebook.com/kidsislandaligarh" },
          { label: "Instagram", url: "https://instagram.com/kidsislandaligarh" },
          { label: "YouTube", url: "https://youtube.com/@kidsislandaligarh" },
        ],
        affiliation: "",
      },
      status: "published"
    },
    {
      key: "settings.nav",
      value: {
        links: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Admissions", href: "/admissions" },
          { label: "Academics", href: "/academics" },
          { label: "Faculty", href: "/faculty" },
          { label: "Gallery", href: "/gallery" },
          { label: "Notices", href: "/notices" },
          { label: "Study Materials", href: "/study-materials" },
          { label: "Contact", href: "/contact" },
        ],
        cta: { label: "Apply for Admission", href: "/admissions#inquiry" },
      },
      status: "published"
    },
    {
      key: "settings.footer",
      value: {
        blurb: "Kids Island Senior Secondary School is committed to providing quality education in a nurturing environment. We believe every child deserves the opportunity to learn, grow, and succeed.",
        quickLinks: [
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Admissions", href: "/admissions" },
          { label: "Academics", href: "/academics" },
          { label: "Faculty", href: "/faculty" },
          { label: "Contact", href: "/contact" },
        ],
        resources: [
          { label: "Gallery", href: "/gallery" },
          { label: "Notices", href: "/notices" },
          { label: "Study Materials", href: "/study-materials" },
          { label: "FAQs", href: "/contact#faqs" },
        ],
        legal: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
        ],
        copyright: "Kids Island Senior Secondary School, Aligarh.",
      },
      status: "published"
    },
    {
      key: "settings.seo",
      value: {},
      status: "published"
    },
  ];

  console.log(`Updating ${contentUpdates.length} content blocks...`);

  for (const update of contentUpdates) {
    const { data, error } = await supabaseAdmin
      .from('content')
      .upsert({
        key: update.key,
        value: JSON.stringify(update.value),
        status: update.status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error(`Error updating ${update.key}:`, error.message);
    } else {
      console.log(`✓ Updated: ${update.key}`);
    }
  }

  // Also update site settings
  console.log("Updating site settings...");
  const { error: settingsError } = await supabaseAdmin
    .from('content')
    .upsert({
      key: 'settings.site',
      value: JSON.stringify(contentUpdates.find(u => u.key === 'settings.site')?.value),
      status: 'published',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (settingsError) {
    console.error("Error updating settings.site:", settingsError.message);
  } else {
    console.log("✓ Updated: settings.site");
  }

  console.log("Content seeding complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});