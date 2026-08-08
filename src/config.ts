export type DisplayMode = "arabicOnly" | "arabicTranslation" | "arabicTransliterationTranslation";

export interface GuildConfig {
  displayMode: DisplayMode;
  ephemeral: boolean;
}

const DEFAULT_CONFIG: GuildConfig = {
  displayMode: "arabicTransliterationTranslation",
  ephemeral: false,
};

const guildConfigs = new Map<string, GuildConfig>();

export function getGuildConfig(guildId: string | null): GuildConfig {
  if (!guildId) return DEFAULT_CONFIG;
  return guildConfigs.get(guildId) ?? DEFAULT_CONFIG;
}

export function setGuildConfig(guildId: string, patch: Partial<GuildConfig>): GuildConfig {
  const current = getGuildConfig(guildId);
  const updated = { ...current, ...patch };
  guildConfigs.set(guildId, updated);
  return updated;
}
