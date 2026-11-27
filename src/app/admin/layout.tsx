import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { adminCounts, getRedFlagCount, getStudentCount, getPendingStaffCount } from "@/lib/admin-data";
import { AdminShell, type AdminNavGroup } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Kids Island Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [counts, redFlagCounts, studentCount, pendingStaffCount] = await Promise.all([
    adminCounts(),
    getRedFlagCount(),
    getStudentCount(),
    getPendingStaffCount(),
  ]);

  const groups: AdminNavGroup[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/admin", icon: "dashboard" }],
    },
    {
      label: "Admissions",
      items: [
        { label: "Admissions", href: "/admin/admissions", icon: "graduation", badge: counts.inquiriesNew },
        { label: "Enquiries", href: "/admin/inquiries", icon: "mail", badge: counts.inquiriesNew },
      ],
    },
    {
      label: "Students",
      items: [
        { label: "Students", href: "/admin/students", icon: "users", badge: studentCount },
        { label: "Red Flags", href: "/admin/red-flags", icon: "alert-triangle", badge: counts.redFlags.active },
      ],
    },
    {
      label: "School content",
      items: [
        { label: "Faculty", href: "/admin/faculty", icon: "user-group" },
        { label: "Study materials", href: "/admin/materials", icon: "book" },
        { label: "Gallery", href: "/admin/gallery", icon: "image" },
        { label: "Notices", href: "/admin/notices", icon: "megaphone" },
        { label: "Testimonials", href: "/admin/testimonials", icon: "quote", badge: counts.testimonialsReview },
        { label: "FAQs", href: "/admin/faqs", icon: "info", badge: counts.faqsReview },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Staff Accounts", href: "/admin/staff", icon: "users", badge: pendingStaffCount },
        { label: "Account", href: "/admin/account", icon: "user" },
      ],
    },
  ];

  return (
    <AdminShell user={{ name: user.name, email: user.email }} groups={groups}>
      {children}
    </AdminShell>
  );
}
