"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormAlert, inputClass } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fd.get("email") ?? ""),
          password: String(fd.get("password") ?? ""),
          next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }
      router.replace(data.redirect ?? "/staff/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <FormAlert>{error}</FormAlert>}
      <Field label="Email Address" htmlFor="staff-email" required>
        <input
          id="staff-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="teacher@school.edu"
          className={inputClass}
        />
      </Field>
      <Field label="Password" htmlFor="staff-password" required>
        <div className="relative">
          <input
            id="staff-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Your password"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-paper-2 hover:text-navy"
          >
            <Icon name={show ? "eye-off" : "eye"} className="h-5 w-5" />
          </button>
        </div>
      </Field>

      <Button type="submit" full size="lg" disabled={loading} className="mt-2">
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />
            Signing in…
          </>
        ) : (
          <>
            <Icon name="lock" className="h-5 w-5" />
            Sign in to Teacher Portal
          </>
        )}
      </Button>

      <p className="rounded-xl bg-paper-2 px-4 py-3 text-[11px] font-semibold leading-relaxed text-muted text-center">
        Forgot password? Contact the school administrator to reset it.
      </p>
    </form>
  );
}