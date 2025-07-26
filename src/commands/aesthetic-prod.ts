import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, AttachmentBuilder, codeBlock } from 'discord.js';
import { ChatCommand } from './utility/types';
import { aesthetic, TransformState } from './utility/expands';

const cancellationMessages = [
  'Cancelled.',
  'Not like this :sob:',
  'Not this time?',
  'Guess not. No worries tho',
  'Cancelled. Next time, though.'
];

let aestheticProd: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('aesthetic')
    .setDescription('Generate stylized aesthetic text.')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('The text to make ａｅｓｔｈｅｔｉｃ')
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
    const text = interaction.options.getString('text');
    const style = interaction.options.getString('style') as TransformState ?? 'aesthetic';
    const output = renderStyledText(text, style);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm').setLabel('Confirm')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel').setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    const message = await interaction.reply({
      content: output,
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    const filter = i => i.user.id === interaction.user.id;
    try {
      const clicked = await message.awaitMessageComponent({ filter, time: 120_000 });
      if (clicked.customId === 'confirm') {
        await clicked.update({ content: 'Sending!', components: [] });
        await interaction.followUp({
          content: output,
        });
      } else {
        const cancellationMessage = getRandomCancelledMessage();
        await clicked.update({ content: cancellationMessage, components: [] });
      }
    } catch {
      await interaction.editReply({ content: 'Timed out — please try again', components: [] });
    }
  },
};

// TODO: account for if the user has sent a message yet - dont' send a random message until after the first
function getRandomCancelledMessage() {
  const messageIndex = Math.floor(Math.random() * cancellationMessages.length);
  return cancellationMessages[messageIndex];
}

function renderStyledText(text: string, style: TransformState) {
  const transformed = aesthetic(text, style, true, true, true, true);
  return codeBlock(transformed);
}

export default aestheticProd;