"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Field, FormAlert, inputClass, textareaClass } from "./fields";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";

type Status = "idle" | "submitting" | "success" | "error";

export function InquiryForm({
  type,
  classes,
  compact = false,
}: {
  type: "admission" | "contact";
  classes?: string[];
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const isAdmission = type === "admission";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      type,
      name: String(fd.get("name") ?? ""),
      parentName: String(fd.get("parentName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      classApply: String(fd.get("classApply") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    setErrors({});
    setStatus("submitting");
    setMessage("");
    try {
      const endpoint = isAdmission ? "/api/inquiries" : "/api/contact";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again or call the school office.");
        setErrors(data.fields ?? {});
        return;
      }
      setSubmittedName(payload.name.trim());
      setReference(data.reference ?? "");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.md, ease: EASE.out }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-[#CBE7D7] bg-[#F4FCF7] px-6 py-10 text-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-mint text-[#167A4A]">
            <Icon name="check" className="h-8 w-8" strokeWidth={2.6} />
          </span>
          <div>
            <h3 className="text-2xl text-navy-900">Thank you{submittedName ? `, ${submittedName.split(" ")[0]}` : ""}!</h3>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted">
              Your {isAdmission ? "admission enquiry" : "message"} has reached the school office. Our team will get in touch with you shortly.
            </p>
            {reference && (
              <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-extrabold tracking-wider text-navy shadow-sm">
                Reference: {reference}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setStatus("idle")} type="button">
            Send another message
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          initial={false}
          className="grid gap-4"
        >
          {status === "error" && message && <FormAlert>{message}</FormAlert>}

          <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
            <Field
              label={isAdmission ? "Student name" : "Your name"}
              htmlFor={`${type}-name`}
              required
              error={errors.name}
            >
              <input
                id={`${type}-name`}
                name="name"
                autoComplete="name"
                required
                placeholder={isAdmission ? "Student's full name" : "Your full name"}
                className={inputClass}
              />
            </Field>

            {isAdmission ? (
              <Field label="Parent / guardian name" htmlFor="parent-name" required error={errors.parentName}>
                <input
                  id="parent-name"
                  name="parentName"
                  autoComplete="name"
                  required
                  placeholder="Parent or guardian"
                  className={inputClass}
                />
              </Field>
            ) : (
              <Field label="Phone number" htmlFor="contact-phone" required error={errors.phone}>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+91 00000 00000"
                  className={inputClass}
                />
              </Field>
            )}

            {isAdmission && (
              <Field label="Phone number" htmlFor="admission-phone" required error={errors.phone}>
                <input
                  id="admission-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+91 00000 00000"
                  className={inputClass}
                />
              </Field>
            )}

            <Field
              label="Email address"
              htmlFor={`${type}-email`}
              required={!isAdmission}
              error={errors.email}
              hint={isAdmission ? "Optional, but helpful for written follow-ups." : undefined}
            >
              <input
                id={`${type}-email`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>

            {isAdmission && (
              <Field label="Class applying for" htmlFor="class-apply" required error={errors.classApply}>
                <div className="relative">
                  <select
                    id="class-apply"
                    name="classApply"
                    required
                    defaultValue=""
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="" disabled>
                      Select a class
                    </option>
                    {(classes ?? []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                </div>
              </Field>
            )}
          </div>

          <Field
            label={isAdmission ? "Additional message" : "Your message"}
            htmlFor={`${type}-message`}
            required={!isAdmission}
            error={errors.message}
          >
            <textarea
              id={`${type}-message`}
              name="message"
              required={!isAdmission}
              placeholder={isAdmission ? "Anything we should know before we call?" : "How can we help you?"}
              className={textareaClass}
            />
          </Field>

          {/* honeypot — hidden from real users and assistive tech */}
          <div aria-hidden className="hidden">
            <label htmlFor={`${type}-website`}>Website</label>
            <input id={`${type}-website`} name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xs text-[11px] font-semibold leading-snug text-muted">
              Your details are shared only with the school office and are not used for marketing.
            </p>
            <Button type="submit" disabled={status === "submitting"} className="group/btn shrink-0">
              {status === "submitting" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />
                  Sending…
                </>
              ) : (
                <>
                  {isAdmission ? "Submit inquiry" : "Send message"}
                  <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
