import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/auth";
import { sendContactFormNotification } from "@/lib/email";
import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .default("")
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .max(25)
  .default("")
  .refine((v) => /^[+\d][\d\s\-()]{6,24}$/.test(v), "Enter a valid phone number");

const schema = z
  .object({
    type: z.literal("contact"),
    name: z.string().trim().min(2, "Please enter your name").max(120),
    email: optionalEmail,
    phone: phoneField,
    message: z.string().trim().min(5, "Please tell us how we can help").max(3000),
    website: z.string().max(0).optional().default(""),
  });

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return jsonError("Too many submissions. Please try again later or call the school office.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return Response.json({ error: "Please check the highlighted fields.", fields }, { status: 422 });
  }

  const data = parsed.data;
  if (data.website) {
    return Response.json({ ok: true, reference: "KI-00000" }, { status: 201 });
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("inquiries")
    .insert({
      type: "contact",
      name: data.name,
      parent_name: null,
      email: data.email || null,
      phone: data.phone || null,
      class_apply: null,
      message: data.message || null,
      ip,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("contact insert error:", insertError);
    return jsonError("Could not save your message. Please call the school office.", 500);
  }

  const id = inserted.id;
  await logAudit({
    action: "inquiry_received",
    entity: "contact",
    entityId: id,
    detail: { name: data.name },
    ip,
  }).catch(() => {});

  sendContactFormNotification({
    name: data.name,
    email: data.email || "",
    phone: data.phone || undefined,
    message: data.message || "",
  }).catch((err) => console.error("Failed to send contact notification:", err));

  return Response.json(
    { ok: true, id, reference: `KI-${String(id).padStart(5, "0")}` },
    { status: 201 }
  );
}