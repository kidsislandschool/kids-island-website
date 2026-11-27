import type { Metadata } from "next";
import { NewMaterialForm } from "@/components/staff/new-material-form";
import { StaffShell } from "@/components/staff/staff-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Upload New Material" };

export default function NewMaterialPage() {
  return (
    <StaffShell>
      <NewMaterialForm />
    </StaffShell>
  );
}