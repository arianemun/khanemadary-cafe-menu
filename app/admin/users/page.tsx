import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserManager } from "@/components/admin/UserManager";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  return (
    <AdminShell>
      <UserManager />
    </AdminShell>
  );
}
