// ephemeral message showing preview of chosen options, with a button to confirm/reject the options

import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { ChatCommand } from './types';

// https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses
// https://discordjs.guide/interactive-components/buttons.html
// https://discordjs.guide/interactive-components/interactions.html#responding-to-component-interactions
let ephemeralConfirm: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('ephemeral-confirm')
    .setDescription('Shows ephemeral with dismiss or confirm'),
  execute: async (interaction) => {
    console.log('Received interaction', interaction);
    const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('What it be')
			.setStyle(ButtonStyle.Primary);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Nah')
      .setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(confirm, cancel);
    await interaction.reply({ content: `What it do?`, components: [row], flags: MessageFlags.Ephemeral  });
  },
};

export default ephemeralConfirm;