import path from "path";
import fs from "fs";
import { createClient } from "@libsql/client";

const dataDir = process.env.DATA_DIR ?? path.join(__dirname, "..", "..", "data");
if (!process.env.TURSO_DATABASE_URL && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const url = process.env.TURSO_DATABASE_URL ?? `file:${path.join(dataDir, "makedua.sqlite")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({ url, authToken });

export async function initDb(): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS guild_config (
      guild_id TEXT PRIMARY KEY,
      display_mode TEXT NOT NULL DEFAULT 'arabicTransliterationTranslation',
      ephemeral INTEGER NOT NULL DEFAULT 0
    );
  `);
}
