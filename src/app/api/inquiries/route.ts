import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/auth";
import { sendInquiryNotification, sendContactFormNotification } from "@/lib/email";

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
    type: z.enum(["admission", "contact"]),
    name: z.string().trim().min(2, "Please enter a name").max(120),
    parentName: z.string().trim().max(120).default(""),
    email: optionalEmail,
    phone: phoneField,
    classApply: z.string().trim().max(40).default(""),
    message: z.string().trim().max(3000).default(""),
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.type === "admission") {
      if (data.parentName.length < 2) {
        ctx.addIssue({ code: "custom", path: ["parentName"], message: "Please enter the parent or guardian name" });
      }
      if (!data.phone) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "A phone number is required for admission enquiries" });
      }
      if (!data.classApply) {
        ctx.addIssue({ code: "custom", path: ["classApply"], message: "Please select the class" });
      }
    } else {
      if (!data.phone && !data.email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email address or a phone number" });
      }
      if (data.message.length < 5) {
        ctx.addIssue({ code: "custom", path: ["message"], message: "Please tell us how we can help" });
      }
    }
  });

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const ip = clientIp(req);
  if (!rateLimit(`inquiry:${ip}`, 5, 10 * 60_000)) {
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
    // Honeypot filled — silently accept so bots don't retry.
    return Response.json({ ok: true, reference: "KI-00000" }, { status: 201 });
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("inquiries")
    .insert({
      type: data.type,
      name: data.name,
      parent_name: data.parentName || null,
      email: data.email || null,
      phone: data.phone || null,
      class_apply: data.classApply || null,
      message: data.message || null,
      ip,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("inquiry insert error:", insertError);
    return jsonError("Could not save your enquiry. Please call the school office.", 500);
  }

  const id = inserted.id;
  await logAudit({
    action: "inquiry_received",
    entity: data.type,
    entityId: id,
    detail: { name: data.name },
    ip,
  }).catch(() => {});

  // Send email notification (don't await - fire and forget)
  if (data.type === "admission") {
    sendInquiryNotification({
      id,
      type: "admission",
      name: data.name,
      parentName: data.parentName || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      classApplying: data.classApply || undefined,
      message: data.message || "",
    }).catch(err => console.error("Failed to send inquiry notification:", err));
  } else {
    sendContactFormNotification({
      name: data.name,
      email: data.email || "",
      phone: data.phone || undefined,
      message: data.message || "",
    }).catch(err => console.error("Failed to send contact notification:", err));
  }

  return Response.json(
    { ok: true, id, reference: `KI-${String(id).padStart(5, "0")}` },
    { status: 201 }
  );
}
