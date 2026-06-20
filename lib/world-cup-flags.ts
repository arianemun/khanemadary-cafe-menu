const TEAM_FLAG_CODES: Record<string, string> = {
  Mexico: "MX",
  "South Africa": "ZA",
  "South Korea": "KR",
  "Czech Republic": "CZ",
  Canada: "CA",
  "Bosnia & Herzegovina": "BA",
  Qatar: "QA",
  Switzerland: "CH",
  Brazil: "BR",
  Haiti: "HT",
  Scotland: "GB",
  Morocco: "MA",
  USA: "US",
  Australia: "AU",
  Turkey: "TR",
  Paraguay: "PY",
  Germany: "DE",
  "Ivory Coast": "CI",
  Ecuador: "EC",
  Curaçao: "CW",
  Netherlands: "NL",
  Sweden: "SE",
  Tunisia: "TN",
  Japan: "JP",
  Belgium: "BE",
  Iran: "IR",
  "New Zealand": "NZ",
  Egypt: "EG",
  Spain: "ES",
  "Saudi Arabia": "SA",
  Uruguay: "UY",
  "Cape Verde": "CV",
  France: "FR",
  Iraq: "IQ",
  Norway: "NO",
  Senegal: "SN",
  Argentina: "AR",
  Austria: "AT",
  Jordan: "JO",
  Algeria: "DZ",
  Portugal: "PT",
  Uzbekistan: "UZ",
  Colombia: "CO",
  "DR Congo": "CD",
  England: "GB",
  Ghana: "GH",
  Panama: "PA",
  Croatia: "HR",
};

const PLACEHOLDER_PATTERN = /^(?:\d+[A-L]|W\d+|L\d+)$/i;

export function resolveTeamFlagCode(teamName: string): string | null {
  const trimmed = teamName.trim();
  if (!trimmed || PLACEHOLDER_PATTERN.test(trimmed)) return null;
  return TEAM_FLAG_CODES[trimmed] ?? null;
}

export function getTeamShortLabel(teamName: string): string {
  const trimmed = teamName.trim();
  if (PLACEHOLDER_PATTERN.test(trimmed)) return trimmed;
  if (trimmed.length <= 4) return trimmed.toUpperCase();
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }
  return trimmed.slice(0, 3).toUpperCase();
}
