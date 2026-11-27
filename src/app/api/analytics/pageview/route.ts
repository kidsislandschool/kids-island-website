import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, referrer, userAgent } = body;

    if (!path) return Response.json({ error: "Path required" }, { status: 400 });

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";

    // Insert page view
    const { error } = await supabaseAdmin.from("page_views").insert({
      path,
      referrer: referrer || null,
      user_agent: userAgent || req.headers.get("user-agent") || null,
      ip,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to record page view:", error);
      return Response.json({ error: "Could not record page view" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}