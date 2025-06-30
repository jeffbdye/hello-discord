import { SlashCommandBuilder } from 'discord.js';
import { ChatCommand } from './types';

let flipCommand: ChatCommand = {
	data: new SlashCommandBuilder()
		.setName('flip')
		.setDescription('Flips the table.'),
	execute: async (interaction) => {
		await interaction.reply('(╯°□°）╯︵ ┻━┻');
	},
};

export default flipCommand;