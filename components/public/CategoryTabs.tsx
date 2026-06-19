"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryTabsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
  showContacts?: boolean;
}

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  showContacts = true,
}: CategoryTabsProps) {
  const tabs = showContacts
    ? [...categories, { id: "contacts", name: "راه‌های ارتباطی", nameEn: "Contacts", slug: "contacts", icon: null, sortOrder: 99 }]
    : categories;

  return (
    <div className="sticky top-[var(--toolbar-height)] z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-web gap-1 overflow-x-auto px-2 py-2 scrollbar-hide snap-x snap-mandatory">
        {tabs.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "min-h-11 min-w-[88px] shrink-0 snap-start rounded-lg px-3 py-2 text-center transition-colors",
              activeId === cat.id ? "bg-muted" : "hover:bg-muted/60"
            )}
          >
            <div className="text-sm font-semibold">{cat.name}</div>
            <div className="text-[11px] text-secondary-text">{cat.nameEn}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
