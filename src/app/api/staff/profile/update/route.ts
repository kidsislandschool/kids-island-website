import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { getStaffSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: FormDataEntryValue | null, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const session = await getStaffSession();
  if (!session) return jsonError("Not authenticated", 401);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 40);
  const designation = clean(formData.get("designation"), 120);
  const qualification = clean(formData.get("qualification"), 200);
  const bio = clean(formData.get("bio"), 2000);
  const subjects = clean(formData.get("subjects"), 300);
  const photo = clean(formData.get("photo"), 1000);
  const requestFacultyDisplay = formData.get("request_faculty_display") === "on";

  if (!name) return jsonError("Name is required.", 422);
  if (photo && !photo.startsWith("/") && !/^https?:\/\//i.test(photo)) {
    return jsonError("That photo link is not valid. Upload the image again.", 422);
  }

  const now = new Date().toISOString();

  try {
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .update({
        name,
        phone: phone || null,
        designation: designation || null,
        qualification: qualification || null,
        bio: bio || null,
        photo: photo || null,
        updated_at: now,
      })
      .eq("id", session.user.id)
      .select("id, name, email, phone, designation, qualification, bio, photo, created_at, updated_at")
      .maybeSingle();

    if (staffError) throw staffError;
    if (!staff) return jsonError("Profile not found", 404);

    let faculty: Record<string, unknown> | null = null;

    if (staff.email) {
      const { data: existing, error: findError } = await supabaseAdmin
        .from("faculty")
        .select("id, status")
        .eq("email", staff.email)
        .maybeSingle();

      if (findError) throw findError;

      const status =
        existing?.status === "published"
          ? "published"
          : requestFacultyDisplay
            ? "needs_review"
            : existing?.status ?? "draft";

      const values = {
        name,
        email: staff.email,
        designation: designation || "Faculty Member",
        qualification: qualification || null,
        bio: bio || null,
        photo: photo || null,
        subjects: subjects || null,
        status,
        updated_at: now,
      };

      if (existing) {
        const { data: updated, error } = await supabaseAdmin
          .from("faculty")
          .update(values)
          .eq("id", existing.id)
          .select("*")
          .maybeSingle();
        if (error) throw error;
        faculty = updated;
      } else {
        const { data: created, error } = await supabaseAdmin
          .from("faculty")
          .insert(values)
          .select("*")
          .single();
        if (error) throw error;
        faculty = created;
      }
    }

    await logAudit({
      userId: null,
      action: "staff_profile_updated",
      entity: "staff",
      entityId: session.user.id,
      detail: {
        photoChanged: Boolean(photo),
        facultyStatus: faculty?.status ?? null,
        requestFacultyDisplay,
      },
      ip: clientIp(req),
    }).catch(() => {});

    return Response.json({ ok: true, profile: staff, faculty });
  } catch (error) {
    console.error("POST /api/staff/profile/update error:", error);
    return jsonError("Could not save your profile. Please try again.", 500);
  }
}
