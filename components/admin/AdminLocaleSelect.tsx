"use client";

import { useAdminT, type AdminLocale } from "@/lib/admin-i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageLabel, ADMIN_UI_LOCALES } from "@/components/admin/LanguageLabel";
import { cn } from "@/lib/utils";

interface AdminLocaleSelectProps {
  className?: string;
  triggerClassName?: string;
}

export function AdminLocaleSelect({
  className,
  triggerClassName,
}: AdminLocaleSelectProps) {
  const { t, locale, setLocale } = useAdminT();

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as AdminLocale)}>
      <SelectTrigger className={cn("h-9 gap-2", triggerClassName)} aria-label={t("common.language")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={className}>
        {ADMIN_UI_LOCALES.map((code) => (
          <SelectItem key={code} value={code}>
            <LanguageLabel
              code={code}
              label={t(`lang.${code}`)}
              required={false}
              optional={false}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
