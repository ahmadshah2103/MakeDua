import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

export const data = new ContextMenuCommandBuilder().setName("Send Dua").setType(ApplicationCommandType.Message);
