import "dotenv/config";
import http from "http";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
  StringSelectMenuBuilder,
} from "discord.js";
import * as duaCommand from "./commands/dua";
import * as duaConfigCommand from "./commands/duaconfig";
import * as duaContextCommand from "./commands/duaContext";
import { duas, duaCategories, resolveDuaText, DEFAULT_PRONOUN } from "./duas";
import { getGuildConfig } from "./config";
import { initDb } from "./db";

const port = process.env.PORT;
if (port) {
  http
    .createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("MakeDua bot is running.");
    })
    .listen(port, () => console.log(`Health check server listening on port ${port}`));
}

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

  if (interaction.isMessageContextMenuCommand() && interaction.commandName === duaContextCommand.data.name) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`dua_ctx_select:${interaction.targetId}`)
      .setPlaceholder("Choose a duʿāʾ category")
      .addOptions(duaCategories.map((c) => ({ label: c.name, value: c.value })));
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    await interaction.reply({
      content: "Pick a duʿāʾ to send in reply to this message:",
      components: [row],
      ephemeral: true,
    });
    return;
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("dua_ctx_select:")) {
    const targetMessageId = interaction.customId.split(":")[1];
    const type = interaction.values[0];
    const entry = duas[type];
    if (!entry) {
      await interaction.update({ content: "That duʿāʾ category could not be found.", components: [] });
      return;
    }

    const dua = resolveDuaText(entry, DEFAULT_PRONOUN);
    const config = await getGuildConfig(interaction.guildId);
    const lines = [dua.arabic];
    if (config.displayMode === "arabicTransliterationTranslation") {
      lines.push(dua.transliteration, dua.translation);
    } else if (config.displayMode === "arabicTranslation") {
      lines.push(dua.translation);
    }
    const body = lines.join("\n");

    const sourceButton = new ButtonBuilder()
      .setCustomId(`dua_source:${type}`)
      .setLabel("📖 Source")
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(sourceButton);

    if (config.ephemeral) {
      await interaction.update({ content: body, components: [row] });
      return;
    }

    const channel = interaction.channel;
    const targetMessage = channel?.isTextBased()
      ? await channel.messages.fetch(targetMessageId).catch(() => null)
      : null;

    if (targetMessage) {
      await targetMessage.reply({ content: body, components: [row] });
      await interaction.update({ content: "Sent ✅", components: [] });
    } else {
      await interaction.update({ content: body, components: [row] });
    }
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

initDb()
  .then(() => client.login(token))
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
