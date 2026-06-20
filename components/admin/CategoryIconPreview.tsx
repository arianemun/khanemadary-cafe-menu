"use client";

import Image from "next/image";
import { isImageSrc } from "@/lib/upload-client";

interface CategoryIconPreviewProps {
  icon: string | null | undefined;
  size?: number;
  className?: string;
}

export function CategoryIconPreview({
  icon,
  size = 32,
  className = "",
}: CategoryIconPreviewProps) {
  if (isImageSrc(icon)) {
    return (
      <div
        className={`relative overflow-hidden rounded-md bg-[#F0F0F0] ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={icon!} alt="" fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  if (!icon) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-gray-50 text-xs text-[var(--admin-muted)] ${className}`}
        style={{ width: size, height: size }}
      >
        +
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-md bg-[#F0F0F0] text-lg ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  );
}
