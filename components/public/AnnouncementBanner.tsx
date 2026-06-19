"use client";

import { X } from "lucide-react";
import { useMenuStore } from "@/lib/store";

interface AnnouncementBannerProps {
  text: string;
  color?: string;
  link?: string;
}

export function AnnouncementBanner({ text, color = "#3F51B5", link }: AnnouncementBannerProps) {
  const dismissed = useMenuStore((s) => s.announcementDismissed);
  const dismiss = useMenuStore((s) => s.dismissAnnouncement);

  if (dismissed) return null;

  const content = (
    <div
      className="flex items-center justify-between px-4 py-2 text-sm text-white"
      style={{ backgroundColor: color }}
    >
      <span>{text}</span>
      <button type="button" onClick={dismiss} aria-label="dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block">
        {content}
      </a>
    );
  }

  return content;
}
