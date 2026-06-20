import type { MapsSettings } from "./maps-settings";
import type { MenuMaxWidthPreset } from "./menu-width";
import type { DayScheduleEntry, WorkingHoursConfig } from "./working-hours";
import type { CategoryItemDisplayMode } from "./category-item-display";
import type { WorldCupSettings } from "./world-cup-settings";

export type Locale = "fa" | "en" | "ar" | "zh" | "ru" | "tr";
export type { MenuMaxWidthPreset } from "./menu-width";
export type HeaderBackgroundMode = "glass" | "white" | "white-to-glass";
export type HeroMediaType = "image" | "video";
export type { MapsSettings, MapProviderKey } from "./maps-settings";

export interface Category {
  id: string;
  slug: string;
  icon: string | null;
  name: string;
  nameEn: string;
  sortOrder: number;
  itemCount?: number;
  itemDisplayMode: CategoryItemDisplayMode;
  itemDisplayOddBackground: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  ingredients: string;
  price: number;
  preparationMinutes?: number | null;
  image: string | null;
  galleryImages: string[];
  available: boolean;
  sortOrder: number;
  discountedPrice?: number | null;
}

export interface Place {
  address: string;
  coordinates: [number, number];
}

export interface SiteSettings {
  cafeName: string;
  cafeNameEn: string;
  logo: string;
  favicon: string;
  menuColor: string;
  tagline: string;
  phone: string;
  instagram: string;
  telegram: string;
  places: Place[];
  workingHours: {
    openMessage: string;
    closedMessage: string;
    note: string;
    start: string;
    end: string;
    openColor: string;
    schedule: DayScheduleEntry[];
    config: WorkingHoursConfig;
  };
  heroMediaType: HeroMediaType;
  heroVideoPoster: string | null;
  heroVideoUrl: string | null;
  /** Hero dark overlay strength, 0–100 (percent). */
  heroOverlayOpacity: number;
  announcements: AnnouncementCard[];
  events: EventCard[];
  enabledLanguages: Locale[];
  defaultLanguage: Locale;
  maps: MapsSettings;
  forceClosed: boolean;
  isOpen: boolean;
  scrollToTopEnabled: boolean;
  scrollProgressEnabled: boolean;
  shareEnabled: boolean;
  headerBackground: HeaderBackgroundMode;
  categoryTabsBackground: HeaderBackgroundMode;
  menuMaxWidth: MenuMaxWidthPreset;
  elementBorderRadius: number;
  worldCup: WorldCupSettings;
}

export interface EventCard {
  id: string;
  image: string | null;
  video: string | null;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  /** Card media overlay strength, 0–100 (percent). */
  overlayOpacity: number;
  active: boolean;
}

export interface AnnouncementCard {
  id: string;
  title: string;
  message: string;
  image: string | null;
  color: string;
  link: string | null;
  durationSeconds: number;
  maxDisplayCount: number;
  active: boolean;
}
