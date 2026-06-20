"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  DatabaseBackup,
  LayoutDashboard,
  Tag,
  UtensilsCrossed,
  Percent,
  Settings2,
  Users,
} from "lucide-react";
import fa from "@/messages/admin/fa.json";
import en from "@/messages/admin/en.json";

export type AdminLocale = "fa" | "en";

const STORAGE_KEY = "admin-locale";

const messages: Record<AdminLocale, Record<string, unknown>> = { fa, en };

type AdminI18nContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("fa");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AdminLocale | null;
    if (stored === "fa" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: AdminLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const dir: "rtl" | "ltr" = locale === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    const prevDir = root.dir;
    const prevLang = root.lang;
    root.dir = dir;
    root.lang = locale;
    return () => {
      root.dir = prevDir;
      root.lang = prevLang;
    };
  }, [dir, locale]);

  const t = useCallback(
    (key: string) => getNested(messages[locale] as Record<string, unknown>, key),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, dir, t }),
    [locale, setLocale, dir, t]
  );

  return (
    <AdminI18nContext.Provider value={value}>
      <div
        dir={dir}
        className={locale === "fa" ? "font-admin-fa" : "font-admin"}
      >
        {children}
      </div>
    </AdminI18nContext.Provider>
  );
}

export function useAdminT() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminT must be used within AdminLocaleProvider");
  }
  return ctx;
}

const PAGE_KEYS: Record<string, string> = {
  "/admin/dashboard": "dashboard",
  "/admin/menu/categories": "categories",
  "/admin/menu/items": "items",
  "/admin/menu/discounts": "discounts",
  "/admin/settings": "settings",
  "/admin/backup": "backup",
  "/admin/users": "users",
};

export function useAdminPageMeta(pathname: string) {
  const { t } = useAdminT();
  const key = PAGE_KEYS[pathname] ?? "admin";
  return {
    title: t(`pages.${key}.title`),
    breadcrumb: t(`pages.${key}.breadcrumb`),
  };
}

export const ADMIN_NAV_KEYS: {
  href: string;
  key: string;
  icon: LucideIcon;
  superadminOnly: boolean;
}[] = [
  { href: "/admin/dashboard", key: "nav.dashboard", icon: LayoutDashboard, superadminOnly: false },
  { href: "/admin/menu/categories", key: "nav.categories", icon: Tag, superadminOnly: false },
  { href: "/admin/menu/items", key: "nav.items", icon: UtensilsCrossed, superadminOnly: false },
  { href: "/admin/menu/discounts", key: "nav.discounts", icon: Percent, superadminOnly: false },
  { href: "/admin/settings", key: "nav.settings", icon: Settings2, superadminOnly: false },
  { href: "/admin/backup", key: "nav.backup", icon: DatabaseBackup, superadminOnly: false },
  { href: "/admin/users", key: "nav.users", icon: Users, superadminOnly: true },
];
