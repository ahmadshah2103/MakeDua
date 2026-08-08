import { db } from "./db";

export type DisplayMode = "arabicOnly" | "arabicTranslation" | "arabicTransliterationTranslation";

export interface GuildConfig {
  displayMode: DisplayMode;
  ephemeral: boolean;
}

const DEFAULT_CONFIG: GuildConfig = {
  displayMode: "arabicTransliterationTranslation",
  ephemeral: false,
};

interface GuildConfigRow {
  display_mode: DisplayMode;
  ephemeral: number;
}

const selectStmt = db.prepare<[string], GuildConfigRow>(
  "SELECT display_mode, ephemeral FROM guild_config WHERE guild_id = ?"
);
const upsertStmt = db.prepare<[string, DisplayMode, number]>(`
  INSERT INTO guild_config (guild_id, display_mode, ephemeral)
  VALUES (?, ?, ?)
  ON CONFLICT(guild_id) DO UPDATE SET display_mode = excluded.display_mode, ephemeral = excluded.ephemeral
`);

export function getGuildConfig(guildId: string | null): GuildConfig {
  if (!guildId) return DEFAULT_CONFIG;
  const row = selectStmt.get(guildId);
  if (!row) return DEFAULT_CONFIG;
  return { displayMode: row.display_mode, ephemeral: Boolean(row.ephemeral) };
}

export function setGuildConfig(guildId: string, patch: Partial<GuildConfig>): GuildConfig {
  const current = getGuildConfig(guildId);
  const updated = { ...current, ...patch };
  upsertStmt.run(guildId, updated.displayMode, updated.ephemeral ? 1 : 0);
  return updated;
}
