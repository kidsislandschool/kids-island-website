import { getAdminInquiries } from "@/lib/admin-data";
import { jsonError } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 20, 100);

  const result = await getAdminInquiries({ type, status, search, page, perPage });
  return Response.json({
    ok: true,
    rows: result.rows,
    total: result.total,
    page: result.page,
    perPage,
    pages: result.pages,
  });
}
