import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import { LoginForm as StaffLoginForm } from "@/components/staff/staff-login-form";
import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import { Cloud, Sparkle } from "@/components/ui/clouds";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teacher Portal Login",
  description: "Staff portal login for Kids Island Senior Secondary School.",
  robots: { index: false, follow: false },
};

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const session = await getStaffSession();
  if (session) redirect("/staff/dashboard");
  const { next, registered } = await searchParams;

  return (
    <div className="min-h-svh bg-paper flex">
      {/* Brand panel - shows on desktop, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy to-navy-700" />
        <Cloud className="absolute top-10 left-10 text-sky/20 w-[140px] h-[140px]" />
        <Cloud className="absolute bottom-20 right-20 text-sky/15 w-[200px] h-[200px]" />
        <Sparkle className="absolute top-1/3 left-1/4 text-yellow/30 w-[48px] h-[48px]" />
        <Sparkle className="absolute bottom-1/3 right-1/4 text-blue/30 w-[36px] h-[36px]" />
        
        <div className="relative z-10 w-full max-w-md text-center">
          <Logo className="mx-auto mb-12" light markOnly />
          <h1 className="relative z-20 font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4" style={{ color: '#FFFFFF' }}>
            Teacher Portal
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">
            Access your dashboard to upload study materials, manage your profile, and stay connected.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Icon name="book" className="h-4 w-4" /> Study Materials</span>
            <span className="flex items-center gap-1.5"><Icon name="user" className="h-4 w-4" /> Profile</span>
            <span className="flex items-center gap-1.5"><Icon name="lock" className="h-4 w-4" /> Secure</span>
          </div>
        </div>
      </div>

      {/* Form panel - full width on mobile, half on desktop */}
      <div className="flex-1 flex min-h-svh items-center justify-center bg-paper p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex flex-col items-center gap-1.5 text-navy-900 hover:text-navy-700 mb-6">
              <Logo className="h-9 w-9" compact />
            </Link>
            <h2 className="font-display text-2xl font-semibold text-navy-900 mb-2">Welcome Back</h2>
            <p className="text-muted">Sign in to access your teacher dashboard</p>
          </div>

          {registered && (
            <div className="mb-6 rounded-xl border border-[#CBE7D7] bg-[#EFFAF3] px-4 py-3 text-center text-[#167A4A] font-semibold flex items-center justify-center gap-2">
              <Icon name="check-circle" className="h-5 w-5" />
              Registration successful! Please sign in.
            </div>
          )}

          <StaffLoginForm next={next} />

          <p className="mt-8 text-center text-sm text-muted">
            Don&apos;t have access yet?{" "}
            <Link href="/staff-signup" className="text-navy-700 hover:text-navy-900 underline font-semibold">
              Request access
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