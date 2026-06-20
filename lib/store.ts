import { create } from "zustand";
import type { MenuItem } from "./types";
import type { AppLocale } from "@/i18n/routing";

interface MenuStore {
  selectedItem: MenuItem | null;
  setSelectedItem: (item: MenuItem | null) => void;
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  activeCategoryId: null,
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  locale: "fa",
  setLocale: (locale) => set({ locale }),
  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  shareOpen: false,
  setShareOpen: (open) => set({ shareOpen: open }),
}));
