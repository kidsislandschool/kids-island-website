"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAR_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const STAR_OUTLINE_SVG = (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export function ReviewForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    parent_name: "",
    student_name: "",
    student_class: "",
    rating: 5,
    title: "",
    quote: "",
    email: "",
    phone: "",
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.parent_name.trim()) newErrors.parent_name = "Your name is required";
    if (!formData.student_name.trim()) newErrors.student_name = "Student's name is required";
    if (!formData.student_class.trim()) newErrors.student_class = "Class/grade is required";
    if (!formData.title.trim()) newErrors.title = "Review title is required";
    if (!formData.quote.trim()) newErrors.quote = "Your review is required";
    if (formData.quote.trim().length < 20) newErrors.quote = "Review must be at least 20 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-]{10,}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone number";
    if (!formData.consent) newErrors.consent = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");

      setStep("success");
    } catch (err) {
      setError((err as Error)?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-6 rounded-2xl border border-[#CBE7D7] bg-[#F4FCF7] px-6 py-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-[#EAF9F1]"
          >
            <Icon name="check" className="h-10 w-10 text-[#167A4A]" />
          </motion.div>
          <div>
            <h3 className="font-display text-[24px] font-semibold text-navy-900">Thank you!</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#167A4A]">
              Your review has been submitted for review. The school office will verify and publish it shortly.
            </p>
          </div>
          <Button onClick={() => router.push("/")} className="mt-2">
            <Icon name="home" className="h-4 w-4" /> Back to Home
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="font-display text-[20px] font-semibold text-navy-900">Your Details</h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="parent_name" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Your Name *
            </label>
            <input
              id="parent_name"
              type="text"
              required
              value={formData.parent_name}
              onChange={(e) => handleChange("parent_name", e.target.value)}
              className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition", errors.parent_name ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
              placeholder="e.g. Priya Sharma"
              disabled={submitting}
            />
            {errors.parent_name && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.parent_name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition", errors.email ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
              placeholder="you@example.com"
              disabled={submitting}
            />
            {errors.email && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition", errors.phone ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
              placeholder="+91 98765 43210"
              disabled={submitting}
            />
            {errors.phone && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="student_name" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Student's Name *
            </label>
            <input
              id="student_name"
              type="text"
              required
              value={formData.student_name}
              onChange={(e) => handleChange("student_name", e.target.value)}
              className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition", errors.student_name ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
              placeholder="e.g. Aarav Sharma"
              disabled={submitting}
            />
            {errors.student_name && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.student_name}</p>}
          </div>

          <div>
            <label htmlFor="student_class" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Class / Grade *
            </label>
            <select
              id="student_class"
              required
              value={formData.student_class}
              onChange={(e) => handleChange("student_class", e.target.value)}
              className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition appearance-none", errors.student_class ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
              disabled={submitting}
            >
              <option value="">Select class…</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={`Class ${n}`}>Class {n}</option>
              ))}
            </select>
            {errors.student_class && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.student_class}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="font-display text-[20px] font-semibold text-navy-900">Your Review</h3>

        <div className="mt-6">
          <label className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
            Overall Rating *
          </label>
          <div className="mt-3 flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleChange("rating", star)}
                className={cn(
                  "transition-transform duration-150",
                  star <= formData.rating ? "text-yellow" : "text-navy/20 hover:text-yellow"
                )}
                disabled={submitting}
              >
                {star <= formData.rating ? STAR_SVG : STAR_OUTLINE_SVG}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="title" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
            Review Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition", errors.title ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
            placeholder="e.g. Wonderful school with caring teachers"
            disabled={submitting}
          />
          {errors.title && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.title}</p>}
        </div>

        <div className="mt-6">
          <label htmlFor="quote" className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
            Your Review * (min. 20 characters)
          </label>
          <textarea
            id="quote"
            required
            rows={5}
            value={formData.quote}
            onChange={(e) => handleChange("quote", e.target.value)}
            className={cn("mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-semibold outline-none transition resize-none", errors.quote ? "border-[#C23B5A] focus:border-[#C23B5A]" : "border-line focus:border-blue focus:ring-4 focus:ring-blue/10")}
            placeholder="Share your experience — what do you love about Kids Island? How has your child grown? Any specific teachers or programs that made a difference?"
            disabled={submitting}
          />
          <p className={`mt-1.5 text-[11px] font-semibold ${formData.quote.length < 20 && formData.quote.length > 0 ? "text-[#C23B5A]" : "text-muted"}`}>
            {formData.quote.length} / 20 characters minimum
          </p>
          {errors.quote && <p className="mt-1.5 text-[11px] font-bold text-[#C23B5A]">{errors.quote}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-white bg-white p-6 shadow-soft">
        <h3 className="font-display text-[20px] font-semibold text-navy-900">Consent</h3>

        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => handleChange("consent", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-line bg-white text-blue focus:ring-2 focus:ring-blue/20"
              disabled={submitting}
            />
            <div className="text-[13px] leading-relaxed text-navy/85">
              <span className="font-extrabold">I consent to my testimonial being published</span> on the Kids Island website and marketing
              materials after school office review. I understand my name and child's class may be shown.
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => handleChange("consent", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-line bg-white text-blue focus:ring-2 focus:ring-blue/20"
              disabled={submitting}
            />
            <div className="text-[13px] leading-relaxed text-navy/85">
              <span className="font-extrabold">I confirm the information is accurate</span> and based on my genuine experience as a parent.
            </div>
          </label>

          {errors.consent && <p className="text-[11px] font-bold text-[#C23B5A]">{errors.consent}</p>}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4A]" role="alert">
          <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" onClick={() => router.push("/")} variant="outline" disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="group/btn">
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting…
            </>
          ) : (
            <>
              <Icon name="send" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}