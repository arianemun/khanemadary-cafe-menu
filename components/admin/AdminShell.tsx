import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  return (
    <div className="min-h-screen bg-muted">
      <AdminNav role={role} />
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
