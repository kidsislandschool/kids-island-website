import type { Metadata } from "next";
import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
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

  const db = getDb();
  const profile = db.prepare("SELECT * FROM staff WHERE id = ?").get(session.user.id) as
    | { id: number; name: string; email: string; phone: string | null; designation: string | null; qualification: string | null; bio: string | null; photo: string | null; created_at: string; updated_at: string }
    | undefined;

  if (!profile) redirect("/staff-login");

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/staff/dashboard" className="inline-flex items-center gap-1.5 text-blue hover:underline text-[11.5px] font-extrabold">
              <Icon name="arrow-left" className="h-4 w-4" /> Back to dashboard
            </Link>
            <h1 className="mt-1 font-display text-[24px] font-semibold text-navy-900">My Profile</h1>
            <p className="mt-1 text-[13px] font-semibold text-muted">Update your personal information and profile picture.</p>
          </div>
        </div>

        <form action={async (formData: FormData) => {
          "use server";
          const db = (await import("@/lib/db")).getDb();
          const { getStaffSession } = await import("@/lib/auth");
          const session = await getStaffSession();
          if (!session) throw new Error("Not authenticated");
          
          const name = formData.get("name") as string;
          const phone = formData.get("phone") as string;
          const designation = formData.get("designation") as string;
          const qualification = formData.get("qualification") as string;
          const bio = formData.get("bio") as string;
          const photo = formData.get("photo") as string;

          if (!name) throw new Error("Name is required.");

          db.prepare(
            `UPDATE staff SET name = ?, phone = ?, designation = ?, qualification = ?, bio = ?, photo = ?, updated_at = datetime('now')
             WHERE id = ?`
          ).run(name, phone || null, designation || null, qualification || null, bio || null, photo || null, session.user.id);
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
                onChange={() => {}}
              />
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
                  defaultValue={profile.designation ?? ""}
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
                defaultValue={profile.qualification ?? ""}
                className={adminInput}
                placeholder="e.g. M.Sc Mathematics, B.Ed"
              />
            </AdminField>

            <AdminField label="About Me" htmlFor="bio" help="A short bio for students and parents to see.">
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className={adminTextarea}
                defaultValue={profile.bio ?? ""}
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