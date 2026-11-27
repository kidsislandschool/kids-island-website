import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { supabaseAdmin } from "@/lib/supabase";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const user = await requireAdmin();
  if (!user) return null;

  // Fetch analytics data
  const [
    totalViewsResult,
    viewsByPathResult,
    viewsByDateResult,
    uniqueVisitorsResult,
    topReferrersResult,
  ] = await Promise.all([
    // Total page views
    supabaseAdmin.from("page_views").select("*", { count: "exact", head: true }),
    // Views by path
    supabaseAdmin
      .from("page_views")
      .select("path")
      .order("created_at", { ascending: false })
      .limit(10000),
    // Views by date (last 30 days)
    supabaseAdmin
      .from("page_views")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true }),
    // Unique visitors (by IP)
    supabaseAdmin.from("page_views").select("ip"),
    // Top referrers
    supabaseAdmin
      .from("page_views")
      .select("referrer")
      .not("referrer", "is", null)
      .limit(5000),
  ]);

  const totalViews = totalViewsResult.count ?? 0;

  // Process views by path
  const pathCounts = new Map<string, number>();
  if (viewsByPathResult.data) {
    for (const row of viewsByPathResult.data) {
      const path = row.path || "/";
      pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
    }
  }
  const topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Process views by date
  const dateCounts = new Map<string, number>();
  if (viewsByDateResult.data) {
    for (const row of viewsByDateResult.data) {
      const date = row.created_at.split("T")[0];
      dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
    }
  }
  // Fill missing dates with 0
  const last30Days: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    last30Days.push({ date, count: dateCounts.get(date) ?? 0 });
  }

  // Unique visitors
  const uniqueIps = new Set<string>();
  if (uniqueVisitorsResult.data) {
    for (const row of uniqueVisitorsResult.data) {
      if (row.ip && row.ip !== "unknown") uniqueIps.add(row.ip);
    }
  }
  const uniqueVisitors = uniqueIps.size;

  // Top referrers
  const referrerCounts = new Map<string, number>();
  if (topReferrersResult.data) {
    for (const row of topReferrersResult.data) {
      const ref = row.referrer || "Direct";
      // Simplify referrer to domain
      let domain = ref;
      try {
        const url = new URL(ref);
        domain = url.hostname.replace("www.", "");
      } catch {
        domain = ref;
      }
      referrerCounts.set(domain, (referrerCounts.get(domain) ?? 0) + 1);
    }
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Website analytics"
        title="Analytics"
        description="Track visitor activity and page performance. Data updates in real-time."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Page Views"
          value={totalViews.toLocaleString()}
          icon="globe"
          color="bg-blue-100 text-blue"
        />
        <StatCard
          label="Unique Visitors (30d)"
          value={uniqueVisitors.toLocaleString()}
          icon="users"
          color="bg-green-100 text-green"
        />
        <StatCard
          label="Avg. Views/Day (30d)"
          value={Math.round((last30Days.reduce((sum, d) => sum + d.count, 0) / 30) * 10) / 10}
          icon="trending-up"
          color="bg-purple-100 text-purple"
        />
        <StatCard
          label="Top Pages Tracked"
          value={topPaths.length.toString()}
          icon="file-text"
          color="bg-amber-100 text-amber"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views by Date */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
          <h3 className="font-display text-[17px] font-semibold text-navy-900 mb-4">Page Views (Last 30 Days)</h3>
          <div className="h-64 flex items-end gap-1.5" style={{ height: "256px" }}>
            {last30Days.map((day, i) => {
              const maxCount = Math.max(...last30Days.map(d => d.count), 1);
              const height = (day.count / maxCount) * 200;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end min-w-0">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all duration-300 bg-navy hover:bg-blue",
                      day.count === 0 && "bg-line"
                    )}
                    style={{ height: `${Math.max(height, day.count > 0 ? 4 : 0)}px` }}
                    title={`${day.date}: ${day.count} views`}
                  />
                  <span className="mt-2 text-[8px] font-semibold text-muted transform -rotate-45 origin-top-left whitespace-nowrap">
                    {day.date.split("-").slice(1).join("/")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Pages */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
          <h3 className="font-display text-[17px] font-semibold text-navy-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {topPaths.map(([path, count], i) => (
              <div key={path} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "shrink-0 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-extrabold",
                    i < 3 ? "bg-yellow text-navy-900" : "bg-paper-2 text-muted"
                  )}>
                    {i + 1}
                  </span>
                  <span className="truncate text-[12px] font-semibold text-navy-900" title={path}>
                    {path}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-4 w-24 bg-paper-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy rounded-full transition-all duration-500"
                      style={{ width: `${(count / (topPaths[0]?.[1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-extrabold text-muted shrink-0">{count.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {topPaths.length === 0 && (
              <p className="text-center text-muted py-8">No page view data yet. Visit the site to generate analytics.</p>
            )}
          </div>
        </div>
      </div>

      {/* Referrers & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Referrers */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
          <h3 className="font-display text-[17px] font-semibold text-navy-900 mb-4">Top Referrers</h3>
          <div className="space-y-3">
            {topReferrers.map(([domain, count], i) => (
              <div key={domain} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "shrink-0 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-extrabold",
                    i < 3 ? "bg-yellow text-navy-900" : "bg-paper-2 text-muted"
                  )}>
                    {i + 1}
                  </span>
                  <span className="truncate text-[12px] font-semibold text-navy-900">{domain}</span>
                </div>
                <span className="text-[11px] font-extrabold text-muted shrink-0">{count.toLocaleString()}</span>
              </div>
            ))}
            {topReferrers.length === 0 && (
              <p className="text-center text-muted py-8">No referrer data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
          <h3 className="font-display text-[17px] font-semibold text-navy-900 mb-4">Recent Page Views</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {viewsByPathResult.data?.slice(0, 20).map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-paper-2/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="mouse-pointer" className="h-4 w-4 text-muted shrink-0" />
                  <span className="truncate text-[11.5px] font-semibold text-navy-900" title={row.path}>
                    {row.path}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted shrink-0">
                  {row.created_at ? new Date(row.created_at).toLocaleTimeString() : "—"}
                </span>
              </div>
            ))}
            {(!viewsByPathResult.data || viewsByPathResult.data.length === 0) && (
              <p className="text-center text-muted py-8">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-muted">{label}</p>
          <p className="mt-1 font-display text-[28px] font-semibold text-navy-900">{value}</p>
        </div>
        <span className={cn("shrink-0 grid h-12 w-12 place-items-center rounded-xl", color)}>
          <Icon name={icon} className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}