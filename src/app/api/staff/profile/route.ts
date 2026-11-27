import { getDirectDb } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDirectDb();
  const profile = await db.selectOne('staff', '*', { id: session.user.id }) as
    | { id: number; name: string; email: string; phone: string | null; designation: string | null; qualification: string | null; bio: string | null; photo: string | null; created_at: string; updated_at: string }
    | undefined;

  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  const faculty = await db.selectOne('faculty', '*', { email: profile.email }) as
    | { id: number; name: string; email: string; designation: string | null; qualification: string | null; bio: string | null; photo: string | null; subjects: string | null; status: string; order_index: number; featured: boolean; created_at: string; updated_at: string }
    | undefined;

  return Response.json({ profile, faculty });
}