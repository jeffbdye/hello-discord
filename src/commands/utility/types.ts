import {
  ChatInputCommandInteraction,
  Message,
  SharedSlashCommand,
} from 'discord.js';

export interface ChatCommand {
  data: SharedSlashCommand;
  execute(
    args: ChatInputCommandInteraction,
  ): Promise<Message<boolean> | void | undefined>;
}
