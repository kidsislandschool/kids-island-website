import { hashPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase";
import { jsonError } from "@/lib/audit";

export async function POST(req: Request) {
  // Security: Only allow in development or with a secret token
  const authHeader = req.headers.get("authorization");
  const secret = process.env.BOOTSTRAP_SECRET;
  
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { email, name, password } = body as { email?: string; name?: string; password?: string };
  
  if (!email || !password) {
    return jsonError("Email and password are required", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Invalid email address", 400);
  }
  if (password.length < 12) {
    return jsonError("Password must be at least 12 characters", 400);
  }

  // Check if master admin already exists
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('role', 'master_admin')
    .single();

  if (existing) {
    return jsonError("Master Admin already exists", 409);
  }

  const passwordHash = hashPassword(password);
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: email.trim().toLowerCase(),
      name: name?.trim() || "Master Admin",
      role: 'master_admin',
      password_hash: passwordHash,
    })
    .select('id, email, name, role')
    .single();

  if (error) {
    return jsonError("Failed to create admin: " + error.message, 500);
  }

  return Response.json({
    ok: true,
    message: "Master Admin created successfully",
    user: { id: data.id, email: data.email, name: data.name, role: data.role }
  });
}