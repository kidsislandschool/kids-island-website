"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/forms/fields";
import Link from "next/link";

function EyeIcon({ show }: { show: boolean }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
        </>
      )}
    </svg>
  );
}

export function StaffSignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/staff/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          designation: String(fd.get("designation") ?? ""),
          qualification: String(fd.get("qualification") ?? ""),
          bio: String(fd.get("bio") ?? ""),
          password: String(fd.get("password") ?? ""),
          confirmPassword: String(fd.get("confirmPassword") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/staff-login?registered=1"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {success && (
        <div className="mb-6 rounded-xl border border-[#CBE7D7] bg-[#EFFAF3] px-4 py-3 text-center text-[#167A4A] font-semibold flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Account created! Redirecting to login&hellip;
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[#A32D4B] font-semibold" role="alert">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name *" htmlFor="name" required error={fieldErrors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={inputClass}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email Address *" htmlFor="email" required error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="teacher@school.edu"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone Number" htmlFor="phone" error={fieldErrors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Designation" htmlFor="designation" error={fieldErrors.designation}>
            <input
              id="designation"
              name="designation"
              type="text"
              className={inputClass}
              placeholder="e.g. Senior Teacher, TGT Math"
            />
          </Field>
        </div>

        <Field label="Qualification" htmlFor="qualification" error={fieldErrors.qualification}>
          <input
            id="qualification"
            name="qualification"
            type="text"
            className={inputClass}
            placeholder="e.g. M.Sc Mathematics, B.Ed"
          />
        </Field>

        <Field label="About You" htmlFor="bio" error={fieldErrors.bio}>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            className={inputClass}
            placeholder="Brief intro: teaching experience, subjects, philosophy..."
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password *" htmlFor="password" required error={fieldErrors.password}>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                className={`${inputClass} pr-12`}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-paper-2 hover:text-navy"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </Field>
          <Field label="Confirm Password *" htmlFor="confirmPassword" required error={fieldErrors.confirmPassword}>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                className={`${inputClass} pr-12`}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-paper-2 hover:text-navy"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                <EyeIcon show={showConfirm} />
              </button>
            </div>
          </Field>
        </div>

        <p className="text-sm text-muted text-center">
          By registering, you agree that your account requires admin approval before you can access the teacher portal.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-navy px-6 text-[12px] font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" d="M4 12a8 8 0 018-8V0" /></svg>
              Creating account&hellip;
            </>
          ) : (
            "Request Access"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already requested access?{" "}
        <a href="/staff-login" className="text-blue hover:underline font-semibold">
          Sign in
        </a>
      </p>

      <a
        href="/"
        className="mt-4 block text-center text-sm text-muted hover:text-navy flex items-center justify-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to school website
      </a>
    </div>
  );
}