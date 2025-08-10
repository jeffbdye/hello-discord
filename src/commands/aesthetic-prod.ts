import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  codeBlock,
  bold,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { ChatCommand } from './utility/types';
import { aesthetic, TransformState } from './utility/expands';
import { EOL } from 'os';
import { getRandomCancelledMessage } from './utility/cancellation';
import { getSignature } from './utility/signature';

let aestheticOptions: {
  name: string;
  value: TransformState;
  description: string;
}[] = [
  {
    name: 'Aesthetic',
    value: 'aesthetic',
    description: 'row, diagonal, and column-ify',
  },
  {
    name: 'Spaceship',
    value: 'spaceship',
    description:
      'increasing numbers of spaces in between each character per line',
  },
  {
    name: 'Star',
    value: 'star',
    description:
      'decreasing numbers of spaces in between each character per line',
  },
  {
    name: 'Valley',
    value: 'valley',
    description: 'removes a character from the string for each line',
  },
  {
    name: 'Mountain',
    value: 'mountain',
    description: 'adds a character from the string for each line',
  },
];

let aestheticProd: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('aesthetic')
    .setDescription('Generate stylized aesthetic text.')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('The text to make ａｅｓｔｈｅｔｉｃ')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('style')
        .setDescription('The transform style to use')
        .setRequired(true)
        .addChoices(aestheticOptions),
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text');
    let style =
      (interaction.options.getString('style') as TransformState) ?? 'aesthetic';

    const renderMenu = (current: TransformState) =>
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('modify')
          .setPlaceholder('Choose style…')
          .addOptions(
            ...aestheticOptions.map((o) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(o.name)
                .setValue(o.value)
                .setDescription(o.description)
                .setDefault(o.value === current),
            ),
          )
          .setMinValues(1)
          .setMaxValues(1),
      );

    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    const output = renderStyledText(text, style);

    const message = await interaction.editReply({
      content: output,
      components: [renderMenu(style), confirmRow],
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 120_000,
    });

    try {
      collector.on('collect', async (i) => {
        if (i.isStringSelectMenu() && i.customId === 'modify') {
          style = i.values[0] as TransformState;
          await i.update({
            content: renderStyledText(text, style),
            components: [renderMenu(style), confirmRow],
          });
        } else if (i.isButton() && i.customId === 'confirm') {
          await i.update({ content: 'Sending!', components: [] });

          const confirmedOutput =
            `${bold(`@${interaction.user.displayName}`)}:` +
            `${EOL}${renderStyledText(text, style)}${EOL}` +
            getSignature('posted by /aesthetic');
          await interaction.channel.send({
            content: confirmedOutput,
          });
        } else {
          const cancellationMessage = getRandomCancelledMessage();
          await i.update({ content: cancellationMessage, components: [] });
        }
      });

      collector.on('end', async (_, reason) => {
        if (reason !== 'confirmed' && reason !== 'cancelled') {
          await interaction.editReply({
            content: 'Timed out — please try again',
            components: [],
          });
        }
      });
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: 'An unexpected error occurred.',
        components: [],
      });
    }
  },
};

function renderStyledText(text: string, style: TransformState) {
  const transformed = aesthetic(text, style, true, true, true, true);
  return codeBlock(transformed);
}

export default aestheticProd;
