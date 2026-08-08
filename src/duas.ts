import duasData from "./data/duas.json";

export interface DuaText {
  arabic: string;
  transliteration: string;
  translation: string;
}

export type PronounKey = "you_m" | "you_f" | "you_pl" | "me" | "us" | "him" | "her" | "them";

export const PRONOUN_LABELS: Record<PronounKey, string> = {
  you_m: "You (m)",
  you_f: "You (f)",
  you_pl: "You all",
  me: "Me",
  us: "Us",
  him: "Him",
  her: "Her",
  them: "Them",
};

export const DEFAULT_PRONOUN: PronounKey = "you_m";

interface DuaEntryFixed {
  label: string;
  quranic: boolean;
  conjugatable: false;
  source: string;
  sourceShort: string;
  text: DuaText;
}

interface DuaEntryConjugatable {
  label: string;
  quranic: boolean;
  conjugatable: true;
  source: string;
  sourceShort: string;
  variants: Record<PronounKey, DuaText>;
}

export type DuaEntry = DuaEntryFixed | DuaEntryConjugatable;

export const duas: Record<string, DuaEntry> = duasData as Record<string, DuaEntry>;

export function resolveDuaText(entry: DuaEntry, pronoun: PronounKey): DuaText {
  return entry.conjugatable ? entry.variants[pronoun] : entry.text;
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

export const duaCategories = Object.entries(duas).map(([value, entry]) => {
  const preview = resolveDuaText(entry, DEFAULT_PRONOUN).arabic;
  const name = truncate(`${entry.label} — ${preview} (${entry.sourceShort})`, 100);
  return { name, value };
});
