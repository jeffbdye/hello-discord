import { SlashCommandBuilder } from 'discord.js';
import { ChatCommand } from './types';

// https://discordjs.guide/slash-commands/advanced-creation.html#adding-options
// https://discordjs.guide/slash-commands/parsing-options.html#choices
let textOptionCommand: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('text-1')
    .setDescription('Has a single text option')
    .addStringOption(o => o.setName('input').setDescription('Will be echoed back').setRequired(true)),
  execute: async (interaction) => {
    console.log('Received interaction', interaction);
    await interaction.reply(`echoing back: ${interaction.options.getString('input')}`);
  },
};

export default textOptionCommand;