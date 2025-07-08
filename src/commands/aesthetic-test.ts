
// /aesthetic text:<string> style:<choice> extras:<multi-choice>
// show user ephemeral message with:
// - their text based on the chosen options in a canvas/snippet/```
// - controls for the other options - on update, replace the canvas content
// - confirm/cancel
// on confirm:
// - update message with: sent
// - send new message with the content
// on cancel: remove interaction or indicate cancellation

// ephemeral message showing preview of chosen options, with a button to confirm/reject the options

import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, AttachmentBuilder, codeBlock } from 'discord.js';
import { ChatCommand } from './types';
import { aesthetic, TransformState } from './expands';

// https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses
// https://discordjs.guide/interactive-components/buttons.html
// https://discordjs.guide/interactive-components/interactions.html#responding-to-component-interactions
let aestheticTest: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('aesthetic-test')
    .setDescription('Generate stylized aesthetic text.')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('The text to make ａ e s t h e t i c')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('style')
        .setDescription('The transform style to use')
        .setRequired(true)
        .addChoices(
          { name: 'Aesthetic', value: 'aesthetic' },
          { name: 'Spaceship', value: 'spaceship' },
          { name: 'Star', value: 'star' },
          { name: 'Valley', value: 'valley' },
          { name: 'Mountain', value: 'mountain' }
        )
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text');
    const style = interaction.options.getString('style') as TransformState ?? 'aesthetic';
    const output = renderStyledText(text, style);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
        // new ButtonBuilder().setCustomId('modify').setLabel('Modify').setStyle(ButtonStyle.Secondary),
      );

    const message = await interaction.editReply({
      content: output,
      // files: [new AttachmentBuilder(canvasBuffer, { name: 'aesthetic.png' })],
      components: [row],
    });

    const filter = i => i.user.id === interaction.user.id;
    try {
      const clicked = await message.awaitMessageComponent({ filter, time: 120_000 });
      if (clicked.customId === 'confirm') {
        await clicked.update({ content: 'Sending!', components: [] });
        await interaction.followUp({
          content: output,
          // content: 'Here’s your aesthetic text:',
          // files: [new AttachmentBuilder(canvasBuffer, { name: 'aesthetic.png' })],
        });
      }
      // else if (clicked.customId === 'modify') {
      //   // regenerate & update the snippet
      //   const newBuffer = renderStyledText(text, style);
      //   await clicked.update({ files: [new AttachmentBuilder(newBuffer, { name: 'aesthetic.png' })] });
      // }
      else {
        await clicked.update({ content: 'Cancelled', components: [] });
      }
    } catch {
      await interaction.editReply({ content: 'Timed out — please try again', components: [] });
    }
  },
};

function renderStyledText(text: string, style: TransformState) {
  const transformed = aesthetic(text, style, true, true, true, true);
  return codeBlock(transformed);
}

export default aestheticTest;