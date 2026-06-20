import type { MapProviderKey } from "@/lib/maps-settings";
import { cn } from "@/lib/utils";

export const MAP_PROVIDER_ICON_SRC: Record<MapProviderKey, string> = {
  google: "/images/maps/google-maps.svg",
  waze: "/images/maps/waze.svg",
  neshan: "/images/maps/neshan.svg",
  balad: "/images/maps/balad.svg",
};

interface MapProviderIconProps {
  provider: MapProviderKey;
  size?: number;
  className?: string;
  muted?: boolean;
}

export function MapProviderIcon({
  provider,
  size = 20,
  className,
  muted,
}: MapProviderIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MAP_PROVIDER_ICON_SRC[provider]}
      alt=""
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0 object-contain", muted && "opacity-60", className)}
    />
  );
}
