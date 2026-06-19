"use client";

import Image from "next/image";
import { Menu, LogIn, Send } from "lucide-react";
import { useMenuStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

interface HeaderProps {
  settings: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const setNavOpen = useMenuStore((s) => s.setNavOpen);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur toolbar-height">
      <div className="mx-auto flex h-full max-w-web items-center justify-between px-4">
        <div className="flex items-center gap-2 text-accent">
          <button type="button" aria-label="share" className="flex min-h-11 min-w-11 items-center justify-center">
            <Send className="h-5 w-5" />
          </button>
          <button type="button" aria-label="login" className="flex min-h-11 min-w-11 items-center justify-center">
            <LogIn className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={settings.logo}
            alt={settings.cafeName}
            width={36}
            height={36}
            className="rounded-full"
          />
          <button
            type="button"
            aria-label="menu"
            className="flex min-h-11 min-w-11 items-center justify-center text-accent"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
