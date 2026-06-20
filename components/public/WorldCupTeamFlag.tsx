import AR from "country-flag-icons/react/3x2/AR";
import AT from "country-flag-icons/react/3x2/AT";
import AU from "country-flag-icons/react/3x2/AU";
import BA from "country-flag-icons/react/3x2/BA";
import BE from "country-flag-icons/react/3x2/BE";
import BR from "country-flag-icons/react/3x2/BR";
import CA from "country-flag-icons/react/3x2/CA";
import CD from "country-flag-icons/react/3x2/CD";
import CH from "country-flag-icons/react/3x2/CH";
import CI from "country-flag-icons/react/3x2/CI";
import CO from "country-flag-icons/react/3x2/CO";
import CV from "country-flag-icons/react/3x2/CV";
import CW from "country-flag-icons/react/3x2/CW";
import CZ from "country-flag-icons/react/3x2/CZ";
import DE from "country-flag-icons/react/3x2/DE";
import DZ from "country-flag-icons/react/3x2/DZ";
import EC from "country-flag-icons/react/3x2/EC";
import EG from "country-flag-icons/react/3x2/EG";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import GH from "country-flag-icons/react/3x2/GH";
import HR from "country-flag-icons/react/3x2/HR";
import HT from "country-flag-icons/react/3x2/HT";
import IQ from "country-flag-icons/react/3x2/IQ";
import IR from "country-flag-icons/react/3x2/IR";
import JO from "country-flag-icons/react/3x2/JO";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import MA from "country-flag-icons/react/3x2/MA";
import MX from "country-flag-icons/react/3x2/MX";
import NL from "country-flag-icons/react/3x2/NL";
import NO from "country-flag-icons/react/3x2/NO";
import NZ from "country-flag-icons/react/3x2/NZ";
import PA from "country-flag-icons/react/3x2/PA";
import PT from "country-flag-icons/react/3x2/PT";
import PY from "country-flag-icons/react/3x2/PY";
import QA from "country-flag-icons/react/3x2/QA";
import SA from "country-flag-icons/react/3x2/SA";
import SE from "country-flag-icons/react/3x2/SE";
import SN from "country-flag-icons/react/3x2/SN";
import TN from "country-flag-icons/react/3x2/TN";
import TR from "country-flag-icons/react/3x2/TR";
import US from "country-flag-icons/react/3x2/US";
import UY from "country-flag-icons/react/3x2/UY";
import UZ from "country-flag-icons/react/3x2/UZ";
import ZA from "country-flag-icons/react/3x2/ZA";
import { cn } from "@/lib/utils";
import {
  getTeamShortLabel,
  resolveTeamFlagCode,
} from "@/lib/world-cup-flags";

const FLAG_COMPONENTS = {
  AR,
  AT,
  AU,
  BA,
  BE,
  BR,
  CA,
  CD,
  CH,
  CI,
  CO,
  CV,
  CW,
  CZ,
  DE,
  DZ,
  EC,
  EG,
  ES,
  FR,
  GB,
  GH,
  HR,
  HT,
  IQ,
  IR,
  JO,
  JP,
  KR,
  MA,
  MX,
  NL,
  NO,
  NZ,
  PA,
  PT,
  PY,
  QA,
  SA,
  SE,
  SN,
  TN,
  TR,
  US,
  UY,
  UZ,
  ZA,
} as const;

interface WorldCupTeamFlagProps {
  teamName: string;
  size?: "sm" | "md";
  className?: string;
}

export function WorldCupTeamFlag({
  teamName,
  size = "md",
  className,
}: WorldCupTeamFlagProps) {
  const code = resolveTeamFlagCode(teamName);
  const Flag = code ? FLAG_COMPONENTS[code as keyof typeof FLAG_COMPONENTS] : null;
  const dimension = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.35)] ring-1 ring-white/30",
        Flag ? "bg-neutral-900" : "bg-white/10",
        dimension,
        className
      )}
      aria-hidden
    >
      {Flag ? (
        <Flag className="absolute left-1/2 top-1/2 h-[155%] w-[155%] max-w-none -translate-x-1/2 -translate-y-1/2" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold tracking-wide text-white/80">
          {getTeamShortLabel(teamName)}
        </div>
      )}
    </div>
  );
}
