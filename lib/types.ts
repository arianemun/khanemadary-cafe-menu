export type Locale = "fa" | "en" | "ar" | "zh" | "ru" | "tr";

export interface Category {
  id: string;
  slug: string;
  icon: string | null;
  name: string;
  nameEn: string;
  sortOrder: number;
  itemCount?: number;
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
  image: string | null;
  galleryImages: string[];
  available: boolean;
  sortOrder: number;
  discountedPrice?: number | null;
}

export interface Place {
  title: string;
  address: string;
  coordinates: [number, number];
}

export interface SiteSettings {
  cafeName: string;
  cafeNameEn: string;
  logo: string;
  tagline: string;
  welcomeMessage: string;
  phone: string;
  instagram: string;
  places: Place[];
  workingHours: {
    openMessage: string;
    closedMessage: string;
    note: string;
    start: string;
    end: string;
    openColor: string;
  };
  heroVideoPoster: string | null;
  heroVideoUrl: string | null;
  announcement: {
    enabled: boolean;
    text?: string;
    color?: string;
    link?: string;
  };
  events: EventCard[];
  enabledLanguages: Locale[];
  defaultLanguage: Locale;
}

export interface EventCard {
  id: string;
  image: string | null;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
}
