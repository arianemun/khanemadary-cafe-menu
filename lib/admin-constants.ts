import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Tag,
  UtensilsCrossed,
  Percent,
  Settings2,
  Users,
} from "lucide-react";

export const ADMIN_NAV: {
  href: string;
  label: string;
  icon: LucideIcon;
  superadminOnly?: boolean;
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu/categories", label: "Categories", icon: Tag },
  { href: "/admin/menu/items", label: "Items", icon: UtensilsCrossed },
  { href: "/admin/menu/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    superadminOnly: true,
  },
] ;

export const PAGE_META: Record<string, { title: string; breadcrumb: string }> = {
  "/admin/dashboard": { title: "Dashboard", breadcrumb: "Admin / Dashboard" },
  "/admin/menu/categories": {
    title: "Categories",
    breadcrumb: "Admin / Menu / Categories",
  },
  "/admin/menu/items": {
    title: "Menu Items",
    breadcrumb: "Admin / Menu / Items",
  },
  "/admin/menu/discounts": {
    title: "Discounts",
    breadcrumb: "Admin / Menu / Discounts",
  },
  "/admin/settings": { title: "Settings", breadcrumb: "Admin / Settings" },
  "/admin/users": { title: "Users", breadcrumb: "Admin / Users" },
};

export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getInitials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
