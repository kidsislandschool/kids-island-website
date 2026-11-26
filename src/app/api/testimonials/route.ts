import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const {
    parent_name,
    student_name,
    student_class,
    rating,
    title,
    quote,
    email,
    phone,
    consent,
  } = body as {
    parent_name: string;
    student_name: string;
    student_class: string;
    rating: number;
    title: string;
    quote: string;
    email: string;
    phone: string;
    consent: boolean;
  };

  if (!parent_name || !student_name || !student_class || !title || !quote || !email || !phone || !consent) {
    return jsonError("All fields are required", 422);
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return jsonError("Rating must be between 1 and 5", 422);
  }

  if (quote.length < 20) {
    return jsonError("Review must be at least 20 characters", 422);
  }

  try {
    const author_role = `Parent of ${student_name} (${student_class})`;

    const { data: inserted, error } = await supabaseAdmin
      .from("testimonials")
      .insert({
        quote: `${quote}\n\n— ${title}`,
        author_name: parent_name,
        author_role,
        order_index: 0,
        status: "needs_review",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("testimonial insert error:", error);
      return jsonError("Could not save review. Please try again.", 500);
    }

    return Response.json({ ok: true, id: inserted.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return jsonError("Failed to submit review", 500);
  }
}