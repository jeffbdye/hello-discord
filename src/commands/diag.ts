import { SlashCommandBuilder } from 'discord.js';
import { ChatCommand } from './utility/types';

let diagCommand: ChatCommand = {
	data: new SlashCommandBuilder()
		.setName('diag')
		.setDescription('Sends back diagnostic info'),
  execute: async (interaction) => {
    console.log('Received interaction', interaction);
		await interaction.reply(`Diagnostics: id: ${interaction.id}, channel ${interaction.channel?.name} ${interaction.channelId}`);
	},
};

export default diagCommand;