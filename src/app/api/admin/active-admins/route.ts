import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Get active admin sessions (not revoked, not expired)
  const { data: sessions, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      created_at,
      users!inner (id, email, name, role)
    `)
    .eq('users.role', 'master_admin')
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error("Error fetching active admin sessions:", error);
    return Response.json({ error: "Could not fetch active admins" }, { status: 500 });
  }

  // Group by user to count unique active admins
  const uniqueAdmins = new Map();
  for (const session of sessions ?? []) {
    const userId = session.user_id;
    if (!uniqueAdmins.has(userId)) {
      uniqueAdmins.set(userId, {
        id: session.users.id,
        name: session.users.name,
        email: session.users.email,
        role: session.users.role,
        lastLogin: session.created_at,
      });
    }
  }

  return Response.json({
    ok: true,
    activeCount: uniqueAdmins.size,
    admins: Array.from(uniqueAdmins.values()),
  });
}