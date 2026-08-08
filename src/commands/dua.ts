import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { duas, duaCategories, resolveDuaText, PRONOUN_LABELS, DEFAULT_PRONOUN, PronounKey } from "../duas";
import { getGuildConfig } from "../config";

export const data = new SlashCommandBuilder()
  .setName("dua")
  .setDescription("Send an authentic Islamic duʿāʾ")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("The category of duʿāʾ to send")
      .setRequired(true)
      .addChoices(...duaCategories)
  )
  .addStringOption((option) =>
    option
      .setName("for")
      .setDescription("Who the duʿāʾ is for (ignored for fixed Qur'anic/hadith wording)")
      .setRequired(false)
      .addChoices(...Object.entries(PRONOUN_LABELS).map(([value, name]) => ({ name, value })))
  )
  .addUserOption((option) =>
    option.setName("user").setDescription("Mention someone to send the duʿāʾ to").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const type = interaction.options.getString("type", true);
  const pronoun = (interaction.options.getString("for") as PronounKey | null) ?? DEFAULT_PRONOUN;
  const mentionedUser = interaction.options.getUser("user");
  const entry = duas[type];

  if (!entry) {
    await interaction.reply({ content: "That duʿāʾ category could not be found.", ephemeral: true });
    return;
  }

  const dua = resolveDuaText(entry, pronoun);
  const config = getGuildConfig(interaction.guildId);
  const lines = [dua.arabic];
  if (config.displayMode === "arabicTransliterationTranslation") {
    lines.push(dua.transliteration, dua.translation);
  } else if (config.displayMode === "arabicTranslation") {
    lines.push(dua.translation);
  }

  const body = lines.join("\n");
  const content = mentionedUser ? `${mentionedUser}\n\n${body}` : body;

  const sourceButton = new ButtonBuilder()
    .setCustomId(`dua_source:${type}`)
    .setLabel("📖 Source")
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(sourceButton);

  await interaction.reply({ content, ephemeral: config.ephemeral, components: [row] });
}
