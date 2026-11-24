import type { Metadata } from "next";
import Link from "next/link";
import { hashPassword } from "@/lib/password";
import { createStaff, getStaffByEmail } from "@/lib/staff";
import { logAudit } from "@/lib/audit";
import { clientIp, jsonError } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().max(25).optional(),
  designation: z.string().trim().max(100).optional(),
  qualification: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
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

  const { name, email, phone, designation, qualification, bio, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await getStaffByEmail(normalizedEmail);
  if (existing) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = hashPassword(password);
  const result = createStaff({
    email: normalizedEmail,
    name,
    phone: phone ?? undefined,
    designation: designation ?? undefined,
    qualification: qualification ?? undefined,
    bio: bio ?? undefined,
    password_hash: passwordHash,
  });

  const ip = clientIp(req);
  logAudit({
    action: "staff_signup",
    entity: "staff",
    entityId: result.id,
    detail: { name, email: normalizedEmail },
    ip,
  });

  return Response.json({
    ok: true,
    message: "Your account has been created and is pending admin approval. You will be able to log in once approved.",
  }, { status: 201 });
}