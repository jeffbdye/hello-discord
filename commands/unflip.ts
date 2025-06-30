import { SlashCommandBuilder } from 'discord.js';
import { ChatCommand } from './types';

let unflipCommand: ChatCommand = {
	data: new SlashCommandBuilder()
		.setName('unflip')
		.setDescription('Un-flips the table.'),
	execute: async (interaction) => {
		await interaction.reply('(┬─┬ ノ( ゜-゜ノ)');
	},
};

export default unflipCommand;