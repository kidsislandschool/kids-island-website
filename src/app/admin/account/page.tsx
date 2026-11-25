import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { ProfileForm, PasswordForm } from "@/components/admin/account-forms";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Account" };

export default async function AdminAccountPage() {
  const user = await requireAdmin();
  const db = getDb();
  const profile = db
    .prepare("SELECT id, email, name, role, created_at, last_login_at FROM users WHERE id = ?")
    .get(user.id) as
    | { id: number; email: string; name: string; role: string; created_at: string; last_login_at: string | null }
    | undefined;
  const activeSessions = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM sessions
         WHERE user_id = ? AND revoked_at IS NULL AND expires_at > datetime('now')`
      )
      .get(user.id) as { c: number }
  ).c;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="System"
        title="Your account"
        description="Manage the single Master Admin profile and password for this phase. All account changes are audit-logged."
      >
        <Link
          href="/admin/audit-log"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="clock" className="h-3.5 w-3.5" />
          Audit log
        </Link>
      </AdminPageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <AdminCard className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-200 text-blue">
                <Icon name="user" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Profile</h2>
                <p className="text-[11px] font-semibold text-muted">Display name and sign-in email.</p>
              </div>
            </div>
            <ProfileForm name={profile?.name ?? user.name} email={profile?.email ?? user.email} />
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF6E3] text-[#9A5B00]">
                <Icon name="lock" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Password</h2>
                <p className="text-[11px] font-semibold text-muted">
                  Changing it signs out every other device automatically.
                </p>
              </div>
            </div>
            <PasswordForm />
          </AdminCard>
        </div>

        <aside className="flex flex-col gap-4">
          <AdminCard className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-[14px] font-extrabold text-white">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold text-navy-900">{profile?.name ?? user.name}</p>
                <p className="truncate text-[10.5px] font-semibold text-muted">{profile?.email ?? user.email}</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#EAF9F1] px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-[#167A4A]">
              <Icon name="shield" className="h-3 w-3" /> Master Admin
            </span>
            <dl className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
              <Meta label="Account created" value={profile?.created_at ? formatDate(profile.created_at) : "—"} />
              <Meta label="Last sign-in" value={profile?.last_login_at ? formatDateTime(profile.last_login_at) : "This session"} />
              <Meta label="Active sessions" value={`${activeSessions} device${activeSessions === 1 ? "" : "s"}`} />
            </dl>
          </AdminCard>

          <AdminCard className="bg-navy p-5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-yellow">
              <Icon name="lock" className="h-4 w-4" />
            </span>
            <h2 className="mt-3 font-display text-[16px] font-semibold text-white">Security notes</h2>
            <ul className="mt-2.5 space-y-2 text-[11px] font-semibold leading-relaxed text-white/60">
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Sessions are stored hashed and expire after seven days.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Repeated failed sign-ins trigger a temporary lockout.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Password resets are run on the server with <code className="rounded bg-white/10 px-1 text-[9.5px]">npm run reset-admin</code>.</li>
            </ul>
          </AdminCard>

          <div className="rounded-xl border border-line bg-white px-4 py-3 text-[10.5px] font-semibold leading-relaxed text-muted">
            This phase supports one Master Admin role only. Additional staff accounts and role-based permissions are
            not enabled.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="text-right text-[10.5px] font-bold text-navy-900">{value}</dd>
    </div>
  );
}
