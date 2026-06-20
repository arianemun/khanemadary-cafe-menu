import { MapProviderIcon } from "@/components/MapProviderIcon";
import { useAdminT, type AdminLocale } from "@/lib/admin-i18n";
import type { MapProviderKey } from "@/lib/maps-settings";
import { cn } from "@/lib/utils";

const PROVIDER_NAMES: Record<MapProviderKey, Record<AdminLocale, string>> = {
  google: { fa: "گوگل مپ", en: "Google Maps" },
  waze: { fa: "ویز", en: "Waze" },
  neshan: { fa: "نشان", en: "Neshan" },
  balad: { fa: "بلد", en: "Balad" },
};

interface MapProviderLabelProps {
  provider: MapProviderKey;
  muted?: boolean;
  className?: string;
}

export function MapProviderLabel({
  provider,
  muted,
  className,
}: MapProviderLabelProps) {
  const { locale } = useAdminT();

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-gray-50 px-2.5 py-1 text-sm font-medium text-[var(--admin-text)]",
        muted && "opacity-60",
        className
      )}
    >
      <MapProviderIcon provider={provider} size={20} />
      <span className="truncate">{PROVIDER_NAMES[provider][locale]}</span>
    </span>
  );
}
