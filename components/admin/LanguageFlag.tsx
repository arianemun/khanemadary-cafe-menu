import IR from "country-flag-icons/react/3x2/IR";
import GB from "country-flag-icons/react/3x2/GB";
import SA from "country-flag-icons/react/3x2/SA";
import CN from "country-flag-icons/react/3x2/CN";
import RU from "country-flag-icons/react/3x2/RU";
import TR from "country-flag-icons/react/3x2/TR";
import { cn } from "@/lib/utils";

const FLAGS = {
  fa: IR,
  en: GB,
  ar: SA,
  zh: CN,
  ru: RU,
  tr: TR,
} as const;

interface LanguageFlagProps {
  code: string;
  className?: string;
}

export function LanguageFlag({ code, className }: LanguageFlagProps) {
  const Flag = FLAGS[code as keyof typeof FLAGS];
  if (!Flag) return null;
  return <Flag className={cn("h-3.5 w-5 shrink-0 rounded-[2px]", className)} aria-hidden />;
}
