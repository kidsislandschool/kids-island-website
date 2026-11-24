import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 20, 100);

  const where: string[] = [];
  const params: unknown[] = [];
  if (type === "admission" || type === "contact") {
    where.push("type = ?");
    params.push(type);
  }
  if (status && ["new", "read", "replied", "closed"].includes(status)) {
    where.push("status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)");
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM inquiries ${sqlWhere} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage);
  const total = (
    getDb().prepare(`SELECT COUNT(*) AS c FROM inquiries ${sqlWhere}`).get(...params) as { c: number }
  ).c;

  return Response.json({ ok: true, rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) });
}
