"use client";

import { Fragment, useCallback, useEffect, useRef } from "react";
import { Header } from "./Header";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { WelcomeSection } from "./WelcomeSection";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryTabs } from "./CategoryTabs";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemModal } from "./MenuItemModal";
import { ContactSection } from "./ContactSection";
import { SectionVerticalDivider } from "./SectionVerticalDivider";
import { EventCards } from "./EventCards";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavigationDrawer } from "./NavigationDrawer";
import { ShareSheet } from "./ShareSheet";
import { WorkingHoursBar } from "./WorkingHoursBar";
import { useMenuStore } from "@/lib/store";
import { resolveItemLayout, resolveOddBackground } from "@/lib/category-item-display";
import type { Category, MenuItem, SiteSettings } from "@/lib/types";
import { APP_VERSION_LABEL } from "@/lib/version";
import { useTranslations } from "next-intl";
import { PublicMenuToaster } from "./PublicMenuToaster";
import { useCategoryScrollSpy } from "./useCategoryScrollSpy";
import { scrollElementBelowStickyNav } from "@/lib/scroll-nav";

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
  const contactsRef = useRef<HTMLElement | null>(null);
  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const categoryIds = categories.map((c) => c.id);

  useEffect(() => {
    if (!activeCategoryId && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories, setActiveCategoryId]);

  useCategoryScrollSpy({
    categoryIds,
    sectionRefs,
    contactsRef,
    scrollLockRef,
    onActiveChange: setActiveCategoryId,
  });

  const scrollTo = useCallback(
    (id: string) => {
      scrollLockRef.current = true;
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
      setActiveCategoryId(id);
      if (id === "contacts") {
        if (contactsRef.current) {
          scrollElementBelowStickyNav(contactsRef.current);
        }
      } else {
        const section = sectionRefs.current[id];
        if (section) {
          scrollElementBelowStickyNav(section);
        }
      }
      scrollLockTimerRef.current = setTimeout(() => {
        scrollLockRef.current = false;
      }, 1000);
    },
    [setActiveCategoryId]
  );

  useEffect(() => {
    return () => {
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header settings={settings} />
      <WelcomeSection settings={settings} />
      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onSelect={scrollTo}
        backgroundMode={settings.categoryTabsBackground}
      />
      <main className="mx-auto w-full max-w-web flex-1">
        <CategoryGrid categories={categories} onSelect={scrollTo} />
        <WorkingHoursBar settings={settings} />
        {categories.map((category, categoryIndex) => {
          const categoryItems = items.filter((i) => i.categoryId === category.id);
          return (
            <Fragment key={category.id}>
              {categoryIndex > 0 && <SectionVerticalDivider />}
              <section
                id={category.slug}
                data-category-id={category.id}
                ref={(el) => {
                  sectionRefs.current[category.id] = el;
                }}
                className="scroll-mt-sticky-nav"
              >
              <div className="bg-card px-4 py-6 text-center">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <p className="text-secondary-text">{category.nameEn}</p>
              </div>
              {categoryItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  layout={resolveItemLayout(category.itemDisplayMode, index)}
                  oddBackground={resolveOddBackground(
                    category.itemDisplayOddBackground,
                    index
                  )}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
              </section>
            </Fragment>
          );
        })}
        {settings.events.length > 0 && <EventCards events={settings.events} />}
        <SectionVerticalDivider />
        <ContactSection settings={settings} sectionRef={contactsRef} />
      </main>
      <footer className="mt-auto px-4 pb-6 pt-4 text-center text-xs text-secondary-text">
        {t("builtWithLove")}{" "}
        <span className="inline-block animate-heartbeat" aria-hidden="true">
          ❤️
        </span>
        {t("byAuthor") ? <> {t("byAuthor")} </> : " "}
        <a
          href="https://github.com/arianemun"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {t("authorName")}
        </a>
        {" | "}
        {APP_VERSION_LABEL}
      </footer>
      <MenuItemModal settings={settings} />
      <NavigationDrawer
        categories={categories}
        settings={settings}
        onSelect={scrollTo}
      />
      {settings.shareEnabled && <ShareSheet settings={settings} />}
      <PublicMenuToaster />
      <div className="fixed bottom-4 left-4 z-50">
        <LanguageSwitcher enabledLanguages={settings.enabledLanguages} />
      </div>
      {settings.scrollToTopEnabled && <ScrollToTopButton />}
    </div>
  );
}
