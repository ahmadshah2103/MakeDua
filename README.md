# MakeDua

A lightweight Discord bot that encourages replacing common expressions ("good luck", "get well soon") with authentic Islamic duʿāʾs via a `/dua` slash command.

## Setup

1. Create a Discord application and bot at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`. Set `DISCORD_GUILD_ID` too if you want instant command updates while testing in a single server.
3. Install dependencies:

```bash
pnpm install
```

4. Register the slash commands:

```bash
pnpm run deploy
```

5. Start the bot:

```bash
pnpm run dev
```

## Commands

- `/dua type:<category> [user:@mention]` — sends an Arabic duʿāʾ for the chosen category, optionally directed at another member.
- `/duaconfig [display:<mode>] [ephemeral:<bool>]` — server admins (Manage Server permission) can configure whether responses show Arabic only, Arabic + translation, or Arabic + transliteration + translation, and whether responses are ephemeral. Settings reset on bot restart (no database, per spec).

## Data

All duʿāʾs live in [`src/data/duas.json`](src/data/duas.json) as a static dataset — no external APIs or database.

## Bot invite permissions

- Send Messages
- Use Slash Commands
- Mention Users

No privileged intents required.
