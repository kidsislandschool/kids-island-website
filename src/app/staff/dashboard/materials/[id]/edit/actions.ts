"use server";

import { getDirectDb } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function updateMaterial(materialId: number, formData: FormData) {
  const session = await getStaffSession();
  if (!session) throw new Error("Not authenticated");

  const db = getDirectDb();

  const title = formData.get("title") as string;
  const class_level = formData.get("class_level") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const file_url = formData.get("file_url") as string;
  const tags = formData.get("tags") as string;
  const status = formData.get("status") as string;
  const published_at = formData.get("published_at") as string || null;

  if (!title || !class_level || !subject) {
    throw new Error("Please fill in all required fields (Title, Class, Subject).");
  }

  if (!["published", "draft", "needs_review"].includes(status)) {
    throw new Error("Invalid status.");
  }

  await db.update('materials', {
    title,
    class_level,
    subject,
    description: description || null,
    file_url: file_url || null,
    tags: tags || null,
    status,
    published_at,
    updated_at: new Date().toISOString(),
  }, { id: materialId, created_by: session.user.id });

  redirect("/staff/dashboard/materials");
}