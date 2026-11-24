import { destroySession, getSession } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getSession();
  await destroySession();
  if (session) {
    logAudit({
      userId: session.user.id,
      action: "logout",
      entity: "master_admin",
      entityId: session.user.id,
      ip: clientIp(req),
    });
  }
  return Response.json({ ok: true });
}
