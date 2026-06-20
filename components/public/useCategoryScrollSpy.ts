import { useEffect, type RefObject } from "react";
import { getStickyNavOffsetPx } from "@/lib/scroll-nav";

function isNearPageBottom(): boolean {
  return (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 8
  );
}

interface UseCategoryScrollSpyOptions {
  categoryIds: string[];
  sectionRefs: RefObject<Record<string, HTMLElement | null>>;
  contactsRef: RefObject<HTMLElement | null>;
  includeContacts?: boolean;
  scrollLockRef: RefObject<boolean>;
  onActiveChange: (id: string) => void;
}

export function useCategoryScrollSpy({
  categoryIds,
  sectionRefs,
  contactsRef,
  includeContacts = true,
  scrollLockRef,
  onActiveChange,
}: UseCategoryScrollSpyOptions) {
  const categoryIdsKey = categoryIds.join(",");

  useEffect(() => {
    if (categoryIds.length === 0) return;

    const sectionIds = includeContacts
      ? [...categoryIds, "contacts"]
      : categoryIds;

    const getElement = (id: string) =>
      id === "contacts"
        ? contactsRef.current
        : sectionRefs.current?.[id] ?? null;

    let activeId: string | null = null;

    const pickActive = () => {
      if (scrollLockRef.current) return;

      const navOffset = getStickyNavOffsetPx();

      if (includeContacts && isNearPageBottom()) {
        if (activeId !== "contacts") {
          activeId = "contacts";
          onActiveChange("contacts");
        }
        return;
      }

      let nextId = categoryIds[0];
      for (const id of sectionIds) {
        const el = getElement(id);
        if (el && el.getBoundingClientRect().top <= navOffset + 1) {
          nextId = id;
        }
      }

      if (nextId !== activeId) {
        activeId = nextId;
        onActiveChange(nextId);
      }
    };

    const navOffset = getStickyNavOffsetPx();
    const observer = new IntersectionObserver(() => pickActive(), {
      rootMargin: `-${navOffset}px 0px -55% 0px`,
      threshold: 0,
    });

    for (const id of sectionIds) {
      const el = getElement(id);
      if (el) observer.observe(el);
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pickActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    pickActive();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [
    categoryIdsKey,
    categoryIds,
    sectionRefs,
    contactsRef,
    includeContacts,
    scrollLockRef,
    onActiveChange,
  ]);
}
