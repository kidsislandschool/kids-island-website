import { getDb } from "@/lib/db";

export type StaffRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  designation: string | null;
  qualification: string | null;
  bio: string | null;
  photo: string | null;
  status: "pending" | "approved" | "rejected";
  password_hash: string;
  created_at: string;
  updated_at: string;
  approved_by: number | null;
  approved_at: string | null;
};

export async function createStaff(data: {
  email: string;
  name: string;
  phone?: string;
  designation?: string;
  qualification?: string;
  bio?: string;
  password_hash: string;
}): Promise<{ id: number }> {
  const db = getDb();
  const info = await db
    .prepare(
      `INSERT INTO staff (email, name, phone, designation, qualification, bio, password_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .run(
      data.email.toLowerCase(),
      data.name,
      data.phone ?? null,
      data.designation ?? null,
      data.qualification ?? null,
      data.bio ?? null,
      data.password_hash
    );
  return { id: Number(info.lastInsertRowid) };
}

export async function getStaffByEmail(email: string): Promise<StaffRow | undefined> {
  return getDb()
    .prepare("SELECT * FROM staff WHERE email = ?")
    .get(email.toLowerCase()) as StaffRow | undefined;
}

export async function getStaffById(id: number): Promise<StaffRow | undefined> {
  return getDb().prepare("SELECT * FROM staff WHERE id = ?").get(id) as StaffRow | undefined;
}

export async function listStaff(opts: { status?: string; search?: string } = {}): Promise<StaffRow[]> {
  const db = getDb();
  let sql = "SELECT * FROM staff";
  const params: any[] = [];
  const where: string[] = [];
  if (opts.status) {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.search) {
    where.push("(name LIKE ? OR email LIKE ? OR designation LIKE ?)");
    const term = `%${opts.search}%`;
    params.push(term, term, term);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY created_at DESC";
  return db.prepare(sql).all(...params) as StaffRow[];
}

export async function updateStaffStatus(id: number, status: "approved" | "rejected", adminId: number): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE staff SET status = ?, approved_by = ?, approved_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    )
    .run(status, adminId, id);
}

export async function updateStaffProfile(id: number, data: Partial<StaffRow>): Promise<void> {
  const db = getDb();
  const fields: string[] = [];
  const params: any[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "password_hash" || key === "status" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    params.push(value);
  }
  if (!fields.length) return;
  fields.push("updated_at = datetime('now')");
  params.push(id);
  await db.prepare(`UPDATE staff SET ${fields.join(", ")} WHERE id = ?`).run(...params);
}

export async function countStaffByStatus(): Promise<{ status: string; c: number }[]> {
  const db = getDb();
  return db
    .prepare("SELECT status, COUNT(*) AS c FROM staff GROUP BY status")
    .all() as { status: string; c: number }[];
}