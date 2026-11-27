import type { Metadata } from "next";
import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaffMaterials, getPublishedMaterials } from "@/lib/data";
import { StaffShell } from "@/components/staff/staff-shell";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatDateTime } from "@/lib/utils";
import { CloudDivider } from "@/components/ui/clouds";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function StaffDashboardPage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  const myMaterials = await getStaffMaterials({ staffId: session.user.id, perPage: 5 });
  const allMaterials = await getPublishedMaterials({ limit: 5 });
  const firstName = session.user.name.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[13px] font-semibold text-muted">{greeting}, {firstName}.</p>
          <h1 className="mt-1 font-display text-[28px] font-semibold text-navy-900">Teacher Dashboard</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Materials" value={myMaterials.rows.length} icon="book" href="/staff/dashboard/materials" />
          <StatCard label="Total Materials" value={allMaterials.length} icon="folder" href="/staff/dashboard/materials" />
        </div>

        <CloudDivider />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-[17px] font-semibold text-navy-900">My Recent Materials</h2>
              <Link href="/staff/dashboard/materials" className="text-[11.5px] font-extrabold text-blue hover:underline">View all →</Link>
            </div>
            {myMaterials.rows.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="book" className="h-12 w-12 mx-auto text-muted/30" />
                <p className="mt-3 text-[13px] text-muted">No materials uploaded yet.</p>
                <Link
                  href="/staff/dashboard/materials/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 text-[12px] font-extrabold text-white transition hover:bg-navy-700"
                >
                  <Icon name="plus" className="h-4 w-4" /> Upload your first material
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {myMaterials.rows.map((material) => (
                  <li key={material.id} className="flex items-start gap-3 p-3 rounded-xl border border-line bg-paper-2/50">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green shrink-0">
                      <Icon name="book" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/study-materials`} target="_blank" rel="noopener noreferrer" className="block">
                        <p className="font-bold text-navy-900 line-clamp-1">{material.title}</p>
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <span>{material.class_level}</span>
                        <span>·</span>
                        <span>{material.subject}</span>
                        <span>·</span>
                        <span>{formatDate(material.created_at)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-[17px] font-semibold text-navy-900">All School Materials</h2>
              <Link href="/staff/dashboard/materials" className="text-[11.5px] font-extrabold text-blue hover:underline">View all →</Link>
            </div>
            {allMaterials.length === 0 ? (
              <p className="text-[13px] text-muted text-center py-4">No materials published yet.</p>
            ) : (
              <ul className="space-y-3">
                {allMaterials.map((material) => (
                  <li key={material.id} className="flex items-start gap-3 p-3 rounded-xl border border-line bg-paper-2/50">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-200 text-blue shrink-0">
                      <Icon name="book" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/study-materials`} target="_blank" rel="noopener noreferrer" className="block">
                        <p className="font-bold text-navy-900 line-clamp-1">{material.title}</p>
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <span>{material.class_level}</span>
                        <span>·</span>
                        <span>{material.subject}</span>
                        <span>·</span>
                        <span>{formatDate(material.created_at)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <CloudDivider />

        <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
          <h2 className="font-display text-[17px] font-semibold text-navy-900 mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/staff/dashboard/materials/new"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green group-hover:bg-navy group-hover:text-yellow transition">
                <Icon name="plus" className="h-6 w-6" />
              </div>
              <span className="font-display text-[15px] font-semibold text-navy-900">Upload Material</span>
              <span className="text-[11px] font-semibold text-muted">Share notes, PDFs, assignments</span>
            </Link>
            <Link
              href="/staff/dashboard/profile"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-purple group-hover:bg-navy group-hover:text-yellow transition">
                <Icon name="user" className="h-6 w-6" />
              </div>
              <span className="font-display text-[15px] font-semibold text-navy-900">My Profile</span>
              <span className="text-[11px] font-semibold text-muted">Update details, photo, bio</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-orange group-hover:bg-navy group-hover:text-yellow transition">
                <Icon name="arrow-up-right" className="h-6 w-6" />
              </div>
              <span className="font-display text-[15px] font-semibold text-navy-900">View Website</span>
              <span className="text-[11px] font-semibold text-muted">See the school website</span>
            </Link>
          </div>
        </section>
      </div>
    </StaffShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue group-hover:bg-navy group-hover:text-yellow transition">
        <Icon name={icon as any} className="h-5 w-5" />
      </div>
      <span className="font-display text-[22px] font-semibold text-navy-900">{value}</span>
      <span className="text-[11px] font-bold text-muted">{label}</span>
    </Link>
  );
}