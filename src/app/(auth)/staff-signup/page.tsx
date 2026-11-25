import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import { StaffSignupForm } from "@/components/staff/staff-signup-form";

export const metadata: Metadata = {
  title: "Teacher Portal Access Request",
  description: "Register as a staff member at Kids Island Senior Secondary School.",
  robots: { index: false, follow: false },
};

export default function StaffSignupPage() {
  return (
    <div className="min-h-svh bg-paper flex">
      {/* Brand panel - shows on desktop, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy to-navy-700" />
        <Cloud className="absolute top-10 left-10 text-sky/20 w-[140px] h-[140px]" />
        <Cloud className="absolute bottom-20 right-20 text-sky/15 w-[200px] h-[200px]" />
        <Sparkle className="absolute top-1/3 left-1/4 text-yellow/30 w-[48px] h-[48px]" />
        <Sparkle className="absolute bottom-1/3 right-1/4 text-sky/30 w-[36px] h-[36px]" />
        
        <div className="relative z-10 w-full max-w-md text-center">
          <Logo className="mx-auto mb-8" light />
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
            Join Our Teaching Team
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">
            Create your teacher account to access the portal. Your profile will be reviewed by the admin before activation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Icon name="shield" className="h-4 w-4" /> Secure</span>
            <span className="flex items-center gap-1.5"><Icon name="user-check" className="h-4 w-4" /> Admin Approval</span>
            <span className="flex items-center gap-1.5"><Icon name="lock" className="h-4 w-4" /> Encrypted</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex min-h-svh items-center justify-center bg-paper p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-xl">
          <div className="mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-navy-900 hover:text-navy-700 mb-6">
              <Logo className="h-9 w-9" compact />
              <span className="font-display text-xl font-semibold">Kids Island</span>
            </Link>
            <h2 className="font-display text-2xl font-semibold text-navy-900 mb-2">Request Teacher Access</h2>
            <p className="text-muted">Fill in your details below. Admin will review and approve your account.</p>
          </div>

          <StaffSignupForm />
        </div>
      </div>
    </div>
  );
}