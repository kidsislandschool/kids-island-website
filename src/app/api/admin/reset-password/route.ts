import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and newPassword required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('role', 'master_admin')
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Master admin not found" }, { status: 404 });
    }

    // Update password
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: hashPassword(newPassword),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}