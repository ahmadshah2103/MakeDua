import "dotenv/config";
import { REST, Routes } from "discord.js";
import { data as duaCommand } from "./commands/dua";
import { data as duaConfigCommand } from "./commands/duaconfig";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in the environment.");
}

const commands = [duaCommand.toJSON(), duaConfigCommand.toJSON()];
const rest = new REST().setToken(token);

async function deploy() {
  const route = guildId
    ? Routes.applicationGuildCommands(clientId as string, guildId)
    : Routes.applicationCommands(clientId as string);

  const result = (await rest.put(route, { body: commands })) as unknown[];
  console.log(`Registered ${result.length} command(s)${guildId ? ` to guild ${guildId}` : " globally"}.`);
}

deploy().catch((error) => {
  console.error("Failed to register commands:", error);
  process.exit(1);
});
