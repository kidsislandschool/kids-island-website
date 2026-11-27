import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminCounts } from "@/lib/admin-data";
import { AdminPageHeader, AdminStat } from "@/components/admin/ui";
import { RedFlagsManager } from "@/components/admin/red-flags-manager";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Red Flags | Kids Island Admin" },
};

export default async function AdminRedFlagsPage() {
  const user = await requireAdmin();
  if (!user) notFound();

  const counts = await adminCounts();

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Student discipline"
        title="Red Flags"
        description="Every disciplinary flag raised by an administrator. Resolve a flag once the issue is handled, or reopen it if it recurs."
      >
        <Link
          href="/admin/students"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="alert-triangle" className="h-4 w-4" />
          Assign from students
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AdminStat label="Active flags" value={counts.redFlags.active} icon="alert-triangle" tone="pink" hint="Needs attention" />
        <AdminStat label="Resolved" value={counts.redFlags.resolved} icon="check-circle" tone="mint" hint="Closed records" />
        <AdminStat label="Total flags" value={counts.redFlags.total} icon="shield" tone="blue" hint="All time" />
      </div>

      <RedFlagsManager />
    </div>
  );
}
