
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

import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, AttachmentBuilder, codeBlock, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { ChatCommand } from './utility/types';
import { aesthetic, TransformState } from './utility/expands';

let aestheticOptions: { name: string, value: TransformState, description: string }[] = [
  { name: 'Aesthetic', value: 'aesthetic', description: 'row, diagonal, and column-ify' },
  { name: 'Spaceship', value: 'spaceship', description: 'increasing numbers of spaces in between each character per line' },
  { name: 'Star', value: 'star', description: 'decreasing numbers of spaces in between each character per line' },
  { name: 'Valley', value: 'valley', description: 'removes a character from the string for each line' },
  { name: 'Mountain', value: 'mountain', description: 'adds a character from the string for each line' },
];

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
        .addChoices(aestheticOptions)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text');
    const style = interaction.options.getString('style') as TransformState ?? 'aesthetic';
    const modified = interaction.options.getString('modify') as TransformState ?? 'aesthetic';
    const output = renderStyledText(text, style);

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);

    // list of options from the select above
    // set default based on what was chosen before
    const dropdownOptions = aestheticOptions.map(o => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(o.name)
        .setValue(o.value)
        .setDescription(o.description)
        // .setEmoji('123456789012345678')
        .setDefault((modified ?? style) === o.value);
    });
    const select = new StringSelectMenuBuilder()
      .setCustomId('modify')
      .addOptions(dropdownOptions);
    
    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const optionsRow = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(select);
    
    const confirmRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        confirmButton,
        cancel,
      );

    const message = await interaction.editReply({
      content: output,
      // files: [new AttachmentBuilder(canvasBuffer, { name: 'aesthetic.png' })],
      components: [optionsRow, confirmRow],
    });

    const filter = i => i.user.id === interaction.user.id;
    try {
      const clicked = await message.awaitMessageComponent({ filter, time: 120_000 });
      if (clicked.customId === 'confirm') {
        const lastStyle = modified ?? style;
        const updated = renderStyledText(text, lastStyle);
        await clicked.update({ content: 'Sending!', components: [] });
        await interaction.channel.send({
          content: updated,
          // options: {}
          // reply: {}
        })
        await interaction.followUp({
          content: output,
          // content: 'Here’s your aesthetic text:',
          // files: [new AttachmentBuilder(canvasBuffer, { name: 'aesthetic.png' })],
        });
      }
      else if (clicked.customId === 'modify') {
        // regenerate & update the snippet
        const updated = renderStyledText(text, style);
        await clicked.update({ content: updated, components: [optionsRow, confirmRow]});
      }
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