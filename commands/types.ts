import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

// export interface PingCommand {
//     data: SlashCommandBuilder;
//     execute(args: { reply(ping: string): Promise<void> }): Promise<void>;
// }

export interface ChatCommand {
  data: SlashCommandBuilder;
  execute(args: ChatInputCommandInteraction): Promise<void>
}

// export interface LocalCommand {
//     data: SlashCommandBuilder;
//     execute<TEvent extends keyof ClientEvents>(...args: ClientEvents[TEvent]): Promise<void>;
// }