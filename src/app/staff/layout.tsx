import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StaffShell } from "@/components/staff/staff-shell";

export const dynamic = "force-dynamic";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  return <StaffShell user={{ name: session.user.name, email: session.user.email }}>{children}</StaffShell>;
}