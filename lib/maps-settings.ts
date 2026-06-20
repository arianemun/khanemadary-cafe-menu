export const MAP_PROVIDER_KEYS = ["google", "waze", "neshan", "balad"] as const;

export type MapProviderKey = (typeof MAP_PROVIDER_KEYS)[number];

export type MapsSettings = {
  urls: Record<MapProviderKey, string>;
  enabled: MapProviderKey[];
};

export function emptyMapsSettings(): MapsSettings {
  return {
    urls: { google: "", waze: "", neshan: "", balad: "" },
    enabled: [...MAP_PROVIDER_KEYS],
  };
}

export function normalizeMapsSettings(raw: unknown): MapsSettings {
  const defaults = emptyMapsSettings();
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Record<string, unknown>;

  if (obj.urls && typeof obj.urls === "object") {
    const urls = {
      ...defaults.urls,
      ...(obj.urls as Partial<Record<MapProviderKey, string>>),
    };
    const enabled = Array.isArray(obj.enabled)
      ? obj.enabled.filter((key): key is MapProviderKey =>
          MAP_PROVIDER_KEYS.includes(key as MapProviderKey)
        )
      : [...MAP_PROVIDER_KEYS];
    return { urls, enabled };
  }

  const urls = { ...defaults.urls };
  for (const key of MAP_PROVIDER_KEYS) {
    if (typeof obj[key] === "string") urls[key] = obj[key];
  }
  return { urls, enabled: [...MAP_PROVIDER_KEYS] };
}

export function buildMapHref(
  provider: MapProviderKey,
  coordinates: [number, number],
  customUrl?: string
): string {
  if (customUrl?.trim()) return customUrl.trim();
  const [lat, lng] = coordinates;
  switch (provider) {
    case "neshan":
      return `https://neshan.org/maps/@${lat},${lng},16z`;
    case "balad":
      return `https://balad.ir/location?lat=${lat}&lng=${lng}`;
    case "google":
      return `https://www.google.com/maps?q=${lat},${lng}`;
    case "waze":
      return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }
}
