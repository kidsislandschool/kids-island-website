import type { Metadata } from "next";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewMaterialForm } from "@/components/staff/new-material-form";
import { StaffShell } from "@/components/staff/staff-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Upload New Material" };

export default async function NewMaterialPage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <NewMaterialForm />
    </StaffShell>
  );
}