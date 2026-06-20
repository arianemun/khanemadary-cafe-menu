"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { adminFaDigitClass, cn, formatAdminDigits } from "@/lib/utils";
import { ADMIN_NAV_KEYS, useAdminT } from "@/lib/admin-i18n";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/admin-constants";
import { APP_VERSION_LABEL } from "@/lib/version";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  role?: string;
  userEmail?: string | null;
  userName?: string | null;
  cafeName?: string;
  cafeNameEn?: string;
  logo?: string;
  side: "left" | "right";
}

export function AdminSidebar({
  role,
  userEmail,
  userName,
  cafeName,
  cafeNameEn,
  logo,
  side,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, locale } = useAdminT();
  const { state, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const displayName =
    locale === "en"
      ? cafeNameEn || cafeName || t("common.cafeAdmin")
      : cafeName || cafeNameEn || t("common.cafeAdmin");
  const logoInitial = displayName.charAt(0).toUpperCase();
  const tooltipSide = side === "right" ? "left" : "right";

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar
      side={side}
      collapsible="icon"
      className="border-white/[0.06] shadow-xl shadow-black/25"
    >
      <SidebarHeader className="border-b border-white/[0.08] p-0">
        <div
          className={cn(
            "flex h-[4.25rem] shrink-0 items-center",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3.5 sm:px-4"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--admin-accent)]/20 ring-1 ring-white/10">
            {logo ? (
              <Image
                src={logo}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">{logoInitial}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold leading-tight text-white">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-white/45">
                {t("common.cafeAdmin")}
              </div>
            </div>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t("common.closeMenu")}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ADMIN_NAV_KEYS.filter((link) => !link.superadminOnly || role === "superadmin").map(
                (link) => {
                  const active = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={{
                          children: t(link.key),
                          side: tooltipSide,
                        }}
                        className={cn(
                          "h-10 rounded-lg border-s-[3px] px-2.5 text-[13px] transition-all duration-150",
                          "hover:bg-white/[0.07] hover:text-white/90",
                          active
                            ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/15 font-medium text-[var(--admin-sidebar-active)]"
                            : "border-transparent text-[var(--admin-sidebar-text)]"
                        )}
                      >
                        <Link href={link.href} onClick={() => setOpenMobile(false)}>
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                              active
                                ? "bg-[var(--admin-accent)]/25 text-white"
                                : "text-inherit"
                            )}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="truncate leading-none">{t(link.key)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.08] p-2.5">
        <div
          className={cn(
            "mb-2 flex items-center gap-2.5 rounded-lg bg-white/[0.04] p-2",
            isCollapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white/10">
            <AvatarFallback className="bg-[var(--admin-accent)]/30 text-[11px] font-medium text-white">
              {getInitials(userName, userEmail ?? "A")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-tight text-white">
                {userName ?? t("common.admin")}
              </div>
              <div className="truncate text-[11px] text-white/45">{userEmail}</div>
            </div>
          )}
        </div>

        {!isCollapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full justify-start rounded-lg text-[var(--admin-sidebar-text)] hover:bg-white/[0.07] hover:text-white"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="me-2 h-4 w-4" />
            {t("common.logout")}
          </Button>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{
                  children: t("common.logout"),
                  side: tooltipSide,
                }}
                className="h-9 justify-center text-[var(--admin-sidebar-text)] hover:bg-white/[0.07] hover:text-white"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                <LogOut className="h-4 w-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <div
          className={cn(
            "mt-2 text-center text-[10px] text-white/35",
            adminFaDigitClass(locale),
            isCollapsed && "hidden"
          )}
          title={APP_VERSION_LABEL}
        >
          {formatAdminDigits(APP_VERSION_LABEL, locale)}
        </div>
      </SidebarFooter>

      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-[4.75rem] hidden h-6 w-6 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] shadow-md transition-colors hover:text-[var(--admin-text)] lg:flex",
          side === "right" ? "-left-3" : "-right-3"
        )}
        aria-label={t("common.toggleSidebar")}
      >
        {isCollapsed ? (
          side === "right" ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )
        ) : side === "right" ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </Sidebar>
  );
}
