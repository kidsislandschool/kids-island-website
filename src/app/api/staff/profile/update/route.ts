import { getDirectDb } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getStaffSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const designation = formData.get("designation") as string;
  const qualification = formData.get("qualification") as string;
  const bio = formData.get("bio") as string;
  const subjects = formData.get("subjects") as string;
  const photo = formData.get("photo") as string;
  const requestFacultyDisplay = formData.get("request_faculty_display") === "on";

  if (!name) return Response.json({ error: "Name is required." }, { status: 422 });

  const db = getDirectDb();

  // Update staff table
  await db.update('staff', {
    name,
    phone: phone || null,
    designation: designation || null,
    qualification: qualification || null,
    bio: bio || null,
    photo: photo || null,
    updated_at: new Date().toISOString(),
  }, { id: session.user.id });

  // Update faculty table (public profile)
  const staffProfile = await db.selectOne('staff', '*', { id: session.user.id });
  if (staffProfile) {
    const faculty = await db.selectOne('faculty', '*', { email: staffProfile.email });
    
    // Determine faculty status
    let facultyStatus = 'draft';
    if (faculty) {
      facultyStatus = faculty.status;
    }
    
    // If staff requests faculty display, set status to 'needs_review' for admin approval
    if (requestFacultyDisplay && facultyStatus !== 'published') {
      facultyStatus = 'needs_review';
    }
    
    await db.update('faculty', {
      name,
      designation: designation || 'Faculty Member',
      qualification: qualification || '',
      bio: bio || '',
      photo: photo || null,
      subjects: subjects || '',
      status: facultyStatus,
      updated_at: new Date().toISOString(),
    }, { email: staffProfile.email });
  }

  return Response.json({ ok: true, redirect: "/staff/dashboard/profile?success=1" });
}