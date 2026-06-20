"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { useAdminT } from "@/lib/admin-i18n";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  role?: string;
  userEmail?: string | null;
  userName?: string | null;
  cafeName?: string;
  cafeNameEn?: string;
  logo?: string;
}

export function AdminLayout({
  children,
  role,
  userEmail,
  userName,
  cafeName,
  cafeNameEn,
  logo,
}: AdminLayoutProps) {
  const { dir } = useAdminT();
  const side = dir === "rtl" ? "right" : "left";

  return (
    <SidebarProvider className="min-h-screen bg-[var(--admin-bg)] text-sm text-[var(--admin-text)]">
      <AdminSidebar
        role={role}
        userEmail={userEmail}
        userName={userName}
        cafeName={cafeName}
        cafeNameEn={cafeNameEn}
        logo={logo}
        side={side}
      />
      <SidebarInset className="bg-[var(--admin-bg)]">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
