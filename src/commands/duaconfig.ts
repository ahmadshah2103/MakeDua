import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { DisplayMode, setGuildConfig } from "../config";

export const data = new SlashCommandBuilder()
  .setName("duaconfig")
  .setDescription("Configure how the bot displays duʿāʾs in this server")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((option) =>
    option
      .setName("display")
      .setDescription("What to include in duʿāʾ responses")
      .setRequired(false)
      .addChoices(
        { name: "Arabic only", value: "arabicOnly" },
        { name: "Arabic + Translation", value: "arabicTranslation" },
        { name: "Arabic + Transliteration + Translation", value: "arabicTransliterationTranslation" },
        { name: "Transliteration only", value: "transliterationOnly" },
        { name: "Translation only", value: "translationOnly" }
      )
  )
  .addBooleanOption((option) =>
    option.setName("ephemeral").setDescription("Only the requester can see the response").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const display = interaction.options.getString("display") as DisplayMode | null;
  const ephemeral = interaction.options.getBoolean("ephemeral");

  const patch: Partial<{ displayMode: DisplayMode; ephemeral: boolean }> = {};
  if (display) patch.displayMode = display;
  if (ephemeral !== null) patch.ephemeral = ephemeral;

  const updated = await setGuildConfig(interaction.guildId, patch);

  await interaction.reply({
    content: `Duʿāʾ settings updated:\n- Display: ${updated.displayMode}\n- Ephemeral: ${updated.ephemeral}`,
    ephemeral: true,
  });
}
