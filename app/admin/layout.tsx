"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AdminLocaleProvider, useAdminT } from "@/lib/admin-i18n";
import "./admin-fonts.css";

function AdminToaster() {
  const { dir, locale } = useAdminT();
  return (
    <Toaster
      position={dir === "rtl" ? "top-left" : "top-right"}
      duration={3000}
      className={locale === "fa" ? "font-admin-fa" : "font-admin"}
    />
  );
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminLocaleProvider>
        {children}
        <AdminToaster />
      </AdminLocaleProvider>
    </SessionProvider>
  );
}
