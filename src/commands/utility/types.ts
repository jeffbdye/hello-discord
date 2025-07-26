import { ChatInputCommandInteraction, SharedSlashCommand, SlashCommandBuilder } from 'discord.js';

export interface ChatCommand {
  data: SharedSlashCommand;
  execute(args: ChatInputCommandInteraction): Promise<void>
}
