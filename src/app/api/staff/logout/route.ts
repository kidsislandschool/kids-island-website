import { destroyStaffSession, getStaffSession } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getStaffSession();
  await destroyStaffSession();
  if (session) {
    logAudit({
      userId: session.user.id,
      action: "staff_logout",
      entity: "staff",
      entityId: session.user.id,
      ip: clientIp(req),
    });
  }
  return Response.json({ ok: true });
}