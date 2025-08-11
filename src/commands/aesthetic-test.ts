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
  AttachmentBuilder,
  subtext,
} from 'discord.js';
import { ChatCommand } from './utility/types';
import { aesthetic, TransformState } from './utility/expands';
import { getRandomCancelledMessage } from './utility/cancellation';
import { getSignature } from './utility/signature';
import { EOL, tmpdir } from 'os';
import { promises as fs } from 'fs';
import { join } from 'path';

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

let aestheticTest: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('aesthetic-test')
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
          const { content, files, filePath } = await renderOutput(text, style);

          await i.update({
            content: content,
            files: files,
            components: [renderMenu(style), confirmRow],
          });

          if (filePath) {
            await fs.unlink(filePath);
          }
        } else if (i.isButton() && i.customId === 'confirm') {
          await i.update({ content: 'Sending!', files:[], components: [] });

          const { content, files, filePath } = await renderOutput(text, style);

          const userAttribution = `${bold(`@${interaction.user.displayName}`)}:`;

          const confirmedOutput = filePath
            ? userAttribution +
              EOL +
              viewAttachmentHint +
              EOL +
              getSignature('/aesthetic')
            : userAttribution +
              `${EOL}${content}${EOL}` +
              getSignature('/aesthetic');

          await interaction.channel.send({
            content: confirmedOutput,
            files: files,
          });

          if (filePath) {
            await fs.unlink(filePath);
          }
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

async function createTempAttachment(
  content: string,
  filename = 'output.txt',
): Promise<{ attachment: AttachmentBuilder; filePath: string }> {
  const tempDir = tmpdir();
  const filePath = join(tempDir, `${Date.now()}-${filename}`);
  await fs.writeFile(filePath, content, 'utf-8');
  const attachment = new AttachmentBuilder(filePath, { name: filename });
  return { attachment, filePath };
}

async function renderOutput(
  text: string,
  style: TransformState,
): Promise<{ content: string; files: AttachmentBuilder[]; filePath?: string }> {
  const transformed = aesthetic(text, style, true, true, true, true);
  if (transformed.length > 1900) {
    // Use 1900 to leave room for filename and message content
    const { attachment, filePath } = await createTempAttachment(transformed);
    return {
      content: viewAttachmentHint,
      files: [attachment],
      filePath,
    };
  } else {
    return { content: codeBlock(transformed), files: [], filePath: null };
  }
}

const viewAttachmentHint = subtext('see attachment - view whole file:');

export default aestheticTest;
