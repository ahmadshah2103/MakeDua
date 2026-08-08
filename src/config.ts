import { db } from "./db";

export type DisplayMode =
  | "arabicOnly"
  | "arabicTranslation"
  | "arabicTransliterationTranslation"
  | "transliterationOnly"
  | "translationOnly";

export interface GuildConfig {
  displayMode: DisplayMode;
  ephemeral: boolean;
}

const DEFAULT_CONFIG: GuildConfig = {
  displayMode: "arabicTransliterationTranslation",
  ephemeral: false,
};

export async function getGuildConfig(guildId: string | null): Promise<GuildConfig> {
  if (!guildId) return DEFAULT_CONFIG;
  const result = await db.execute({
    sql: "SELECT display_mode, ephemeral FROM guild_config WHERE guild_id = ?",
    args: [guildId],
  });
  const row = result.rows[0];
  if (!row) return DEFAULT_CONFIG;
  return {
    displayMode: row.display_mode as DisplayMode,
    ephemeral: Boolean(row.ephemeral),
  };
}

export async function setGuildConfig(guildId: string, patch: Partial<GuildConfig>): Promise<GuildConfig> {
  const current = await getGuildConfig(guildId);
  const updated = { ...current, ...patch };
  await db.execute({
    sql: `
      INSERT INTO guild_config (guild_id, display_mode, ephemeral)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET display_mode = excluded.display_mode, ephemeral = excluded.ephemeral
    `,
    args: [guildId, updated.displayMode, updated.ephemeral ? 1 : 0],
  });
  return updated;
}
