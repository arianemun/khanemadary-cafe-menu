"use client";

import { useEffect, useRef } from "react";
import { Sparkles, ChevronUp } from "lucide-react";
import { Header } from "./Header";
import { WelcomeSection } from "./WelcomeSection";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryTabs } from "./CategoryTabs";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemModal } from "./MenuItemModal";
import { ContactSection } from "./ContactSection";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { EventCards } from "./EventCards";
import { NavigationDrawer } from "./NavigationDrawer";
import { useMenuStore } from "@/lib/store";
import type { Category, MenuItem, SiteSettings } from "@/lib/types";
import { useTranslations } from "next-intl";

interface PublicMenuProps {
  categories: Category[];
  items: MenuItem[];
  settings: SiteSettings;
}

export function PublicMenu({ categories, items, settings }: PublicMenuProps) {
  const t = useTranslations("common");
  const activeCategoryId = useMenuStore((s) => s.activeCategoryId);
  const setActiveCategoryId = useMenuStore((s) => s.setActiveCategoryId);
  const setSelectedItem = useMenuStore((s) => s.setSelectedItem);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeCategoryId && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories, setActiveCategoryId]);

  const scrollTo = (id: string) => {
    setActiveCategoryId(id);
    if (id === "contacts") {
      document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isOpen = false;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24">
      <Header settings={settings} />
      {settings.announcement.enabled && settings.announcement.text && (
        <AnnouncementBanner
          text={settings.announcement.text}
          color={settings.announcement.color}
          link={settings.announcement.link}
        />
      )}
      <main className="mx-auto max-w-web pt-[var(--toolbar-height)]">
        <WelcomeSection settings={settings} />
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={scrollTo}
        />
        <CategoryGrid categories={categories} onSelect={scrollTo} />
        <EventCards events={settings.events} />
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-web items-center justify-between">
            <button type="button" className="text-secondary-text">←</button>
            <div className="text-center">
              <div
                className="text-sm font-bold"
                style={{ color: isOpen ? settings.workingHours.openColor : undefined }}
              >
                {isOpen ? settings.workingHours.openMessage : settings.workingHours.closedMessage}
              </div>
              <div className="text-xs text-secondary-text">
                {settings.workingHours.note}
              </div>
            </div>
          </div>
        </div>
        {categories.map((category) => {
          const categoryItems = items.filter((i) => i.categoryId === category.id);
          return (
            <section
              key={category.id}
              id={category.slug}
              ref={(el) => {
                sectionRefs.current[category.id] = el;
              }}
              className="scroll-mt-28"
            >
              <div className="bg-card px-4 py-6 text-center">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <p className="text-secondary-text">{category.nameEn}</p>
              </div>
              {categoryItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </section>
          );
        })}
        <ContactSection settings={settings} />
        <footer className="py-6 text-center text-xs text-secondary-text">
          {t("madeWith")}{" "}
          <a href="https://hamkari.com" className="text-accent">
            hamkari.com
          </a>
        </footer>
      </main>
      <MenuItemModal settings={settings} />
      <NavigationDrawer
        categories={categories}
        settings={settings}
        onSelect={scrollTo}
      />
      <div className="fixed bottom-4 left-4 z-40">
        <LanguageSwitcher />
      </div>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-accent text-white shadow-card"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("scrollTop")}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="fixed bottom-[4.5rem] left-4 z-40 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-accent text-white shadow-card"
        aria-label="AI"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}
