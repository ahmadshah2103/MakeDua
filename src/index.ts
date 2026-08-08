import "dotenv/config";
import { Client, Collection, Events, GatewayIntentBits, Interaction } from "discord.js";
import * as duaCommand from "./commands/dua";
import * as duaConfigCommand from "./commands/duaconfig";
import { duas } from "./duas";

interface Command {
  data: { name: string };
  execute: (interaction: Interaction) => Promise<void>;
}

const commands = new Collection<string, Command>();
commands.set(duaCommand.data.name, duaCommand as unknown as Command);
commands.set(duaConfigCommand.data.name, duaConfigCommand as unknown as Command);

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("DISCORD_TOKEN must be set in the environment.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith("dua_source:")) {
    const type = interaction.customId.split(":")[1];
    const entry = duas[type];
    if (!entry) {
      await interaction.reply({ content: "Source information could not be found.", ephemeral: true });
      return;
    }
    await interaction.reply({ content: `📖 Source: ${entry.source}`, ephemeral: true });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command "${interaction.commandName}":`, error);
    const errorMessage = { content: "Something went wrong while running that command.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(token);
