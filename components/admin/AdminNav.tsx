"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/menu/categories", label: "Categories" },
  { href: "/admin/menu/items", label: "Items" },
  { href: "/admin/menu/discounts", label: "Discounts" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/users", label: "Users", superadminOnly: true },
];

export function AdminNav({ role }: { role?: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-wrap gap-2">
          {links
            .filter((l) => !l.superadminOnly || role === "superadmin")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-btn border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
        </nav>
        <div className="flex gap-2">
          <Link href="/" className="rounded-btn border border-border px-3 py-2 text-sm">
            View Site
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-btn bg-accent px-3 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
