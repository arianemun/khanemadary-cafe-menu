"use client";

import type { ComponentProps } from "react";
import { SheetContent } from "@/components/ui/sheet";
import { DialogContent } from "@/components/ui/dialog";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { useAdminT } from "@/lib/admin-i18n";

export function AdminSheetContent({
  side,
  ...props
}: ComponentProps<typeof SheetContent>) {
  const { dir } = useAdminT();
  return (
    <SheetContent
      dir={dir}
      side={side ?? (dir === "rtl" ? "left" : "right")}
      {...props}
    />
  );
}

export function AdminDialogContent(props: ComponentProps<typeof DialogContent>) {
  const { dir } = useAdminT();
  return <DialogContent dir={dir} {...props} />;
}

export function AdminAlertDialogContent(
  props: ComponentProps<typeof AlertDialogContent>
) {
  const { dir } = useAdminT();
  return <AlertDialogContent dir={dir} {...props} />;
}
