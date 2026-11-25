import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal Login",
  description: "Master admin login for Kids Island Senior Secondary School.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="min-h-svh bg-paper flex">
      {/* Brand panel - shows on desktop, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy to-navy-700" />
        <div className="relative z-10 w-full max-w-md text-center">
          <Logo className="mx-auto mb-12" light hideSubtitle />
          <h1 className="relative z-20 font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4" style={{ color: '#FFFFFF' }}>
            Admin Portal
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">
            Master admin access to manage website content, admissions, staff, and system settings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Icon name="shield" className="h-4 w-4" /> Master Admin</span>
            <span className="flex items-center gap-1.5"><Icon name="database" className="h-4 w-4" /> Content CMS</span>
            <span className="flex items-center gap-1.5"><Icon name="lock" className="h-4 w-4" /> Secure</span>
          </div>
        </div>
      </div>

      {/* Form panel - full width on mobile, half on desktop */}
      <div className="flex-1 flex min-h-svh items-center justify-center bg-paper p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex flex-col items-center gap-1.5 text-navy-900 hover:text-navy-700 mb-6">
              <Logo className="h-9 w-9" compact hideSubtitle />
            </Link>
            <h2 className="font-display text-2xl font-semibold text-navy-900 mb-2">Admin Login</h2>
            <p className="text-muted">Sign in to access the admin dashboard</p>
          </div>

          <LoginForm next={next} />

          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/staff-login" className="text-navy-700 hover:text-navy-900 underline font-semibold">
              Teacher/Staff login instead
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 block text-center text-sm text-muted hover:text-navy-700 flex items-center justify-center gap-1"
          >
            <Icon name="arrow-left" className="h-4 w-4" /> Back to school website
          </Link>
        </div>
      </div>
    </div>
  );
}