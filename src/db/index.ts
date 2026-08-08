import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const dataDir = process.env.DATA_DIR ?? path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(path.join(dataDir, "makedua.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    display_mode TEXT NOT NULL DEFAULT 'arabicTransliterationTranslation',
    ephemeral INTEGER NOT NULL DEFAULT 0
  );
`);
