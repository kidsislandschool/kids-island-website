import type { Metadata } from "next";
import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDirectDb } from "@/lib/db";
import { StaffShell } from "@/components/staff/staff-shell";
import { Icon } from "@/components/ui/icon";
import { UploadInput } from "@/components/admin/upload-input";
import { AdminField, adminInput, adminTextarea } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  const db = getDirectDb();
  const profile = await db.selectOne('staff', '*', { id: session.user.id }) as
    | { id: number; name: string; email: string; phone: string | null; designation: string | null; qualification: string | null; bio: string | null; photo: string | null; created_at: string; updated_at: string }
    | undefined;

  if (!profile) redirect("/staff-login");

  // Also fetch the linked faculty profile
  const faculty = await db.selectOne('faculty', '*', { email: profile.email }) as
    | { id: number; name: string; email: string; designation: string | null; qualification: string | null; bio: string | null; photo: string | null; subjects: string | null; status: string; order_index: number; featured: boolean; created_at: string; updated_at: string }
    | undefined;

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/staff/dashboard" className="inline-flex items-center gap-1.5 text-blue hover:underline text-[11.5px] font-extrabold">
              <Icon name="arrow-left" className="h-4 w-4" /> Back to dashboard
            </Link>
            <h1 className="mt-1 font-display text-[24px] font-semibold text-navy-900">My Profile</h1>
            <p className="mt-1 text-[13px] font-semibold text-muted">Update your personal information and public faculty profile.</p>
          </div>
        </div>

        <form action={async (formData: FormData) => {
          "use server";
          const db = (await import("@/lib/db")).getDirectDb();
          const { getStaffSession } = await import("@/lib/auth");
          const session = await getStaffSession();
          if (!session) throw new Error("Not authenticated");
          
          const name = formData.get("name") as string;
          const phone = formData.get("phone") as string;
          const designation = formData.get("designation") as string;
          const qualification = formData.get("qualification") as string;
          const bio = formData.get("bio") as string;
          const subjects = formData.get("subjects") as string;
          const photo = formData.get("photo") as string;
          const requestFacultyDisplay = formData.get("request_faculty_display") === "on";

          if (!name) throw new Error("Name is required.");

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
        }} className="space-y-6">
          <StaffCard title="Profile Photo">
            <AdminField label="Current Photo" htmlFor="photo_upload">
              {profile.photo ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border border-line bg-paper-2">
                    <img src={profile.photo} alt="" className="h-full w-full object-cover" />
                  </div>
                  <Link href={profile.photo} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline text-sm">
                    View full size
                  </Link>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full border border-line bg-paper-2 flex items-center justify-center">
                  <Icon name="user" className="h-10 w-10 text-muted" />
                </div>
              )}
            </AdminField>

            <AdminField label="Update Photo" htmlFor="photo_upload" help="Upload a new photo (JPG, PNG, WebP — max 12 MB). Will be auto-cropped to square.">
              <UploadInput
                id="photo_upload"
                kind="image"
                value={profile.photo ?? ""}
                onChange={(url) => {
                  const photoInput = document.getElementById('photo_hidden');
                  if (photoInput) photoInput.value = url ?? '';
                }}
                uploadEndpoint="/api/staff/uploads"
              />
              <input type="hidden" id="photo_hidden" name="photo" value={profile.photo ?? ""} />
            </AdminField>
          </StaffCard>

          <StaffCard title="Personal Information">
            <AdminField label="Full Name *" htmlFor="name" required>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={profile.name}
                className={adminInput}
                placeholder="Your full name"
              />
            </AdminField>

            <AdminField label="Email Address" htmlFor="email" help="This is your login email. Cannot be changed here.">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                className={adminInput}
                disabled
              />
            </AdminField>

            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Phone Number" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone ?? ""}
                  className={adminInput}
                  placeholder="+91 98765 43210"
                />
              </AdminField>

              <AdminField label="Designation" htmlFor="designation">
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  defaultValue={profile.designation ?? faculty?.designation ?? ""}
                  className={adminInput}
                  placeholder="e.g. Senior Teacher, TGT Mathematics"
                />
              </AdminField>
            </div>

            <AdminField label="Qualification" htmlFor="qualification">
              <input
                id="qualification"
                name="qualification"
                type="text"
                defaultValue={profile.qualification ?? faculty?.qualification ?? ""}
                className={adminInput}
                placeholder="e.g. M.Sc Mathematics, B.Ed"
              />
            </AdminField>

            <AdminField label="Subjects Taught" htmlFor="subjects" help="Subjects you teach (e.g. Mathematics, Physics, Chemistry).">
              <input
                id="subjects"
                name="subjects"
                type="text"
                defaultValue={faculty?.subjects ?? ""}
                className={adminInput}
                placeholder="e.g. Mathematics, Physics"
              />
            </AdminField>

            <AdminField label="About Me" htmlFor="bio" help="A short bio for students and parents to see on the public faculty page.">
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className={adminTextarea}
                defaultValue={profile.bio ?? faculty?.bio ?? ""}
                placeholder="Write a few lines about your teaching experience, philosophy, or interests…"
              />
            </AdminField>
          </StaffCard>

          <StaffCard title="Account Info" variant="subtle">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">Joined</dt>
                <dd className="mt-1 font-bold text-navy-900">{formatDateTime(profile.created_at)}</dd>
              </div>
              <div>
                <dt className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">Last Updated</dt>
                <dd className="mt-1 font-bold text-navy-900">{formatDateTime(profile.updated_at)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[11px] font-semibold text-muted">
              To change your password, contact the administrator.
            </p>
            {faculty && (
              <p className="mt-2 text-[11px] font-semibold text-green-700">
                ✓ Public faculty profile is linked and will be updated.
              </p>
            )}
            {!faculty && (
              <p className="mt-2 text-[11px] font-semibold text-amber-700">
                ⚠ No public faculty profile found. One will be created on next save.
              </p>
            )}
            {faculty && (
              <div className="mt-4 rounded-xl border border-line bg-paper-2/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-5 w-5 place-items-center shrink-0 rounded bg-blue-100">
                    <Icon name="info" className="h-2.5 w-2.5 text-blue" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-navy-900">Public Faculty Profile</h3>
                    <p className="mt-1 text-[11.5px] font-semibold text-muted">
                      {faculty.status === 'published' && (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF9F1] px-2 py-0.5 text-[9.5px] font-extrabold text-[#167A4A]">
                            <Icon name="check-circle" className="h-2.5 w-2.5" /> Published
                          </span>
                          <span className="ml-2">Your faculty profile is publicly visible on the website.</span>
                        </>
                      )}
                      {faculty.status === 'draft' && (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E3] px-2 py-0.5 text-[9.5px] font-extrabold text-[#9A5B00]">
                            <Icon name="edit" className="h-2.5 w-2.5" /> Draft
                          </span>
                          <span className="ml-2">Your faculty profile is saved as a draft and not publicly visible.</span>
                        </>
                      )}
                      {faculty.status === 'needs_review' && (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E3] px-2 py-0.5 text-[9.5px] font-extrabold text-[#9A5B00]">
                            <Icon name="clock" className="h-2.5 w-2.5" /> Pending Review
                          </span>
                          <span className="ml-2">Your faculty profile is pending admin approval to be published.</span>
                        </>
                      )}
                    </p>
                    {faculty.status !== 'published' && (
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-bold text-navy transition hover:bg-cream cursor-pointer">
                          <input
                            type="checkbox"
                            name="request_faculty_display"
                            defaultChecked={false}
                            className="h-4 w-4 rounded border-navy/30 text-navy focus:ring-navy"
                          />
                          Request public faculty profile display
                        </label>
                        <p className="mt-2 text-[10.5px] font-semibold text-muted">
                          Check this box to request admin approval for publishing your faculty profile on the public website.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </StaffCard>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/staff/dashboard"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
            >
              <Icon name="check" className="h-4 w-4" strokeWidth={2.6} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </StaffShell>
  );
}

function StaffCard({ title, variant, children }: { title: string; variant?: "subtle"; children: React.ReactNode }) {
  return (
    <div className={cn(
      "rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]",
      variant === "subtle" && "bg-navy/5 border-navy/20"
    )}>
      <h2 className="font-display text-[17px] font-semibold text-navy-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}