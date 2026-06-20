"use client";

import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useAdminT } from "@/lib/admin-i18n";
import {
  adminFaDigitClass,
  adminFaDigitFieldClass,
  formatAdminDigits,
  formatAdminDisplayValue,
  normalizeAdminDigits,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AdminDigitsProps = {
  children: string | number;
  className?: string;
  as?: "span" | "div";
};

export function AdminDigits({
  children,
  className,
  as: Tag = "span",
}: AdminDigitsProps) {
  const { locale } = useAdminT();
  const text = formatAdminDisplayValue(children, locale);

  return <Tag className={adminFaDigitClass(locale, className)}>{text}</Tag>;
}

export function AdminLocaleDigitInput({
  value,
  onSave,
  className,
  ...props
}: {
  value: string;
  onSave: (normalized: string) => void;
} & Omit<
  ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "onBlur"
>) {
  const { locale } = useAdminT();
  const [display, setDisplay] = useState(() =>
    formatAdminDigits(value ?? "", locale)
  );

  useEffect(() => {
    setDisplay(formatAdminDigits(value ?? "", locale));
  }, [value, locale]);

  return (
    <Input
      {...props}
      value={display}
      onChange={(e) => {
        const next = e.target.value;
        setDisplay(locale === "fa" ? formatAdminDigits(next, "fa") : next);
      }}
      onBlur={(e) => {
        const normalized = normalizeAdminDigits(e.target.value);
        setDisplay(formatAdminDigits(normalized, locale));
        onSave(normalized);
      }}
      className={adminFaDigitFieldClass(locale, className)}
    />
  );
}

export function AdminLocaleDigitTextarea({
  value,
  onSave,
  className,
  ...props
}: {
  value: string;
  onSave: (normalized: string) => void;
} & Omit<
  ComponentProps<typeof Textarea>,
  "value" | "defaultValue" | "onChange" | "onBlur"
>) {
  const { locale } = useAdminT();
  const [display, setDisplay] = useState(() =>
    formatAdminDigits(value ?? "", locale)
  );

  useEffect(() => {
    setDisplay(formatAdminDigits(value ?? "", locale));
  }, [value, locale]);

  return (
    <Textarea
      {...props}
      value={display}
      onChange={(e) => {
        const next = e.target.value;
        setDisplay(locale === "fa" ? formatAdminDigits(next, "fa") : next);
      }}
      onBlur={(e) => {
        const normalized = normalizeAdminDigits(e.target.value);
        setDisplay(formatAdminDigits(normalized, locale));
        onSave(normalized);
      }}
      className={adminFaDigitFieldClass(locale, className)}
    />
  );
}

export function AdminNumericInput({
  value,
  onChange,
  className,
  hint,
  label,
  ...props
}: {
  value: string | number;
  onChange: (value: string) => void;
  hint?: ReactNode;
  label?: ReactNode;
} & Omit<
  ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "type"
>) {
  const { locale } = useAdminT();
  const stringValue = String(value ?? "");
  const [display, setDisplay] = useState(() =>
    formatAdminDigits(stringValue, locale)
  );

  useEffect(() => {
    setDisplay(formatAdminDigits(stringValue, locale));
  }, [stringValue, locale]);

  const input = (
    <Input
      {...props}
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const normalized = normalizeAdminDigits(e.target.value).replace(
          /[^\d]/g,
          ""
        );
        setDisplay(formatAdminDigits(normalized, locale));
        onChange(normalized);
      }}
      className={adminFaDigitFieldClass(locale, className)}
    />
  );

  if (!label && !hint) return input;

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      {input}
      {hint ? (
        <p className="text-xs text-[var(--admin-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
