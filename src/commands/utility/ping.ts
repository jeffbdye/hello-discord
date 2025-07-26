import { SlashCommandBuilder } from 'discord.js';
import { ChatCommand } from './types';

let pingCommand: ChatCommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: async (interaction) => {
		await interaction.reply('Pong!');
	},
};

export default pingCommand;