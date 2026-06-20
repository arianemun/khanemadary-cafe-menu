"use client";

import { useMenuStore } from "@/lib/store";
import type { Category, SiteSettings } from "@/lib/types";
import {
  PublicMenuDrawerSheet,
  PublicSheetHeader,
} from "@/components/public/PublicMenuDrawer";

interface NavigationDrawerProps {
  categories: Category[];
  settings: SiteSettings;
  onSelect: (id: string) => void;
}

export function NavigationDrawer({
  categories,
  settings,
  onSelect,
}: NavigationDrawerProps) {
  const open = useMenuStore((s) => s.navOpen);
  const setNavOpen = useMenuStore((s) => s.setNavOpen);

  const items = [
    ...categories,
    { id: "contacts", name: "راه‌های ارتباطی", nameEn: "Contacts" },
  ];

  return (
    <PublicMenuDrawerSheet
      open={open}
      onOpenChange={setNavOpen}
      zIndexClass="z-[55]"
    >
      <PublicSheetHeader title={settings.cafeName} />
      <div className="space-y-2 px-4 pb-4">
        {items.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              onSelect(cat.id);
              setNavOpen(false);
            }}
            className="w-full rounded-card border border-border bg-card px-4 py-4 text-center shadow-sm transition-colors hover:bg-muted/60"
          >
            <div className="font-bold text-foreground">{cat.name}</div>
            <div dir="ltr" className="text-xs text-secondary-text">
              {cat.nameEn}
            </div>
          </button>
        ))}
      </div>
    </PublicMenuDrawerSheet>
  );
}
