"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { useAdminPageMeta, useAdminT } from "@/lib/admin-i18n";
import { AdminLocaleSelect } from "@/components/admin/AdminLocaleSelect";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function AdminTopbar() {
  const pathname = usePathname();
  const { title, breadcrumb } = useAdminPageMeta(pathname);
  const { t } = useAdminT();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 sm:h-16 sm:gap-3 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={toggleSidebar}
        aria-label={t("common.openMenu")}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-[var(--admin-text)] sm:text-lg">
          {title}
        </h1>
        <p className="hidden truncate text-xs text-[var(--admin-muted)] sm:block">
          {breadcrumb}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <AdminLocaleSelect triggerClassName="w-auto min-w-[9rem]" />

        <Link
          href="/fa"
          target="_blank"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 text-sm font-medium hover:bg-gray-50 sm:px-3"
          aria-label={t("common.viewSite")}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">{t("common.viewSite")}</span>
        </Link>
      </div>
    </header>
  );
}
