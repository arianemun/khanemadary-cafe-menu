"use client";

import { useLocale } from "next-intl";
import { Toaster } from "sonner";

export function PublicMenuToaster() {
  const locale = useLocale();
  const dir = locale === "fa" || locale === "ar" ? "rtl" : "ltr";

  return (
    <Toaster
      dir={dir}
      position={dir === "rtl" ? "top-right" : "top-center"}
      richColors
      duration={3000}
      className="public-menu-toaster"
      toastOptions={{
        classNames: {
          toast: "public-menu-toast text-sm",
          title: dir === "rtl" ? "text-right" : "text-left",
          description: dir === "rtl" ? "text-right text-secondary-text" : "text-left text-secondary-text",
        },
      }}
    />
  );
}
