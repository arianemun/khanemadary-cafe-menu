"use client";

import { Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => (
  <Sonner
    className={cn("toaster group", className)}
    toastOptions={{
      ...toastOptions,
      classNames: {
        toast: cn(
          "group toast text-sm group-[.toaster]:bg-[var(--admin-surface)] group-[.toaster]:text-[var(--admin-text)] group-[.toaster]:border-[var(--admin-border)] group-[.toaster]:shadow-lg",
          toastOptions?.classNames?.toast
        ),
        description: cn(
          "text-sm group-[.toast]:text-[var(--admin-muted)]",
          toastOptions?.classNames?.description
        ),
        actionButton: cn(
          "group-[.toast]:bg-[var(--admin-accent)] group-[.toast]:text-white",
          toastOptions?.classNames?.actionButton
        ),
        cancelButton: cn(
          "group-[.toast]:bg-gray-100 group-[.toast]:text-[var(--admin-text)]",
          toastOptions?.classNames?.cancelButton
        ),
        ...toastOptions?.classNames,
      },
    }}
    {...props}
  />
);

export { Toaster };
