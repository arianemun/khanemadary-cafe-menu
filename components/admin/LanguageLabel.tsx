import { LANGUAGES } from "@/lib/constants";
import { LanguageFlag } from "@/components/admin/LanguageFlag";
import { useAdminT } from "@/lib/admin-i18n";
import { isRequiredTranslationLanguage } from "@/lib/admin-validation";
import { cn } from "@/lib/utils";

interface LanguageLabelProps {
  code: string;
  label?: string;
  variant?: "inline" | "badge" | "compact";
  required?: boolean;
  optional?: boolean;
  className?: string;
}

export function LanguageLabel({
  code,
  label,
  variant = "inline",
  required,
  optional,
  className,
}: LanguageLabelProps) {
  const { t } = useAdminT();
  const lang = LANGUAGES.find((l) => l.code === code);
  const displayLabel = label ?? lang?.label ?? code;
  const isRequired = required ?? isRequiredTranslationLanguage(code);
  const isOptional = optional ?? !isRequired;

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 w-full items-center gap-1.5 text-xs font-medium",
          className
        )}
        title={isOptional ? `${displayLabel} (${t("common.optional")})` : displayLabel}
      >
        <LanguageFlag code={code} />
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
        {isRequired && <span className="shrink-0 text-[10px] text-red-500">*</span>}
      </span>
    );
  }

  const inner = (
    <>
      <LanguageFlag code={code} />
      <span>{displayLabel}</span>
      {isRequired && <span className="text-xs text-red-500">*</span>}
      {isOptional && (
        <span className="text-[10px] font-normal text-[var(--admin-muted)]">
          ({t("common.optional")})
        </span>
      )}
    </>
  );

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-[var(--admin-border)] bg-gray-50 px-2.5 py-1 text-sm font-medium text-[var(--admin-text)]",
          className
        )}
      >
        {inner}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      {inner}
    </span>
  );
}

export const ADMIN_UI_LOCALES = ["fa", "en"] as const;
