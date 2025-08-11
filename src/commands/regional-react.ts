import {
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import { ChatCommand } from './utility/types';

// https://discord.com/developers/docs/topics/permissions?utm_source=chatgpt.com
// https://emojipedia.org/regional-indicator-symbol-letter-e
// https://discord.com/channels/826641025497563137/826641072326312036/1404283139659923578
// https://stackoverflow.com/questions/26862282/swift-countelements-return-incorrect-value-when-count-flag-emoji

const LINK_RE =
  /^https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)$/;
// Regional Indicators: U+1F1E6 ('🇦') .. U+1F1FF ('🇿')
const letterToRegional = (c: string) =>
  String.fromCodePoint(0x1f1e6 + (c.toUpperCase().charCodeAt(0) - 65));

const FALLBACKS: Record<string, string[]> = {
  A: ['🅰️'], // A button (blood type)
  B: ['🅱️'], // B button (blood type)
  C: ['©️'], // Copyright sign
  E: ['3️⃣'], // 3 keycap
  I: ['ℹ️'], // Information
  M: ['Ⓜ️'], // Circled M (metro)
  O: ['🅾️', '⭕', '0️⃣', '🔴'], // O button, heavy large circle, red circle, 0 keycap
  P: ['🅿️'], // P button (parking)
  R: ['®️'], // Registered trademark
  S: ['5️⃣'], // 5 keycap
  T: ['➕','7️⃣'], // Plus, 7 keycap
  X: ['❌', '✖️', '❎'], // Cross marks
};

let regionalReact: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('react')
    .setDescription('React to a message with 🇸 🇹 🇾 🇱 🇪')
    .addStringOption((opt) =>
      opt
        .setName('message-link')
        .setDescription('The link to the message to react to')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('reaction')
        .setDescription('The reaction to apply')
        .setRequired(true),
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const link = interaction.options.getString('message-link', true);
    const raw = interaction.options.getString('reaction', true);

    const linkParts = LINK_RE.exec(link);
    if (!linkParts) {
      await interaction.editReply(
        `That doesn't look like a valid message link.`,
      );
      return;
    }
    const [, guildId, channelId, messageId] = linkParts;
    if (!interaction.guildId || guildId !== interaction.guildId) {
      await interaction.editReply(
        'Link must point to a message **in this server**.',
      );
      return;
    }

    // Validate characters
    // TODO: passthrough emoji reactions the user chooses?
    // or we add some confirmation step showing what we would react with before applying it?
    const letters = [...raw.replace(/\s+/g, '')];
    if (!letters.every((ch) => /^[a-z]$/i.test(ch))) {
      await interaction.editReply('Only A-Z letters (and spaces) are allowed.');
      return;
    }

    // Fetch channel & message, check perms
    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      await interaction.editReply(
        `That channel is not text-based or I can't access it.`,
      );
      return;
    }
    const textChannel = channel as TextChannel;

    // ADD_REACTIONS	0x0000000000000040 (1 << 6)	Allows for adding new reactions to messages. This permission does not apply to reacting with an existing reaction on a message.
    const me = interaction.guild.members.me;
    const chanPerms = textChannel.permissionsFor(me);
    const need = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AddReactions,
    ];
    if (!need.every((p) => chanPerms?.has(p))) {
      await interaction.editReply(
        'I need the permissions for **View Channel**, **Read Message History**, and **Add Reactions** in that channel.',
      );
      return;
    }

    const message = await textChannel.messages.fetch(messageId);

    // 4) Compute plan (unique emojis only),
    const existing = new Set(
      [...message.reactions.cache.values()].map((r) => r.emoji.name ?? ''),
    );
    const plan = buildEmojiPlan(raw, existing);

    // 5) Guard the per-message unique reaction cap (~20)
    const uniqueNow = message.reactions.cache.size;
    if (uniqueNow + plan.length > 20) {
      await interaction.editReply(
        `Attempted to react with ${plan}, this would exceed the ~20 unique reactions per message limit.`,
      );
      return;
    }

    // 6) Add reactions sequentially (gentle on rate limits)
    try {
      for (const character of plan) {
        await message.react(character);
        await new Promise((r) => setTimeout(r, 250)); // small backoff
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply(
        'Failed while reacting. Check my permissions and try again.',
      );
      return;
    }

    // intentionally joining the result with zero-width space unicode \u200B
    await interaction.editReply(`Reacted with: ${renderUnicode(plan)}`);
  },
};

function renderUnicode(plan: string[]) {
  return plan.join('\u200B');
}

function buildEmojiPlan(
  text: string,
  existing: Set<string>, // existing emoji names on the message (message.reactions.cache)
): string[] {
  const plan: string[] = [];
  const used = new Set<string>(existing); // avoid adding a reaction that already exists
  const counts = new Map<string, number>();

  // strip blank space
  for (const raw of text.replace(/\s+/g, '').toUpperCase()) {
    if (!/[A-Z]/.test(raw)) {
      continue;
    }

    // first choice: regional indicator for first occurrence
    const seen = counts.get(raw) ?? 0;
    const primary = letterToRegional(raw);
    let chosen: string | undefined;

    if (seen === 0 && !used.has(primary)) {
      chosen = primary;
    } else { // else, check for another fallback
      const fb = FALLBACKS[raw] ?? [];
      chosen = fb.find((e) => !used.has(e));
    }

    if (!chosen) {
      throw new Error(`Ran out of emoji options for '${raw}'.`);
    }
    plan.push(chosen);
    used.add(chosen);
    counts.set(raw, seen + 1);
  }
  return plan;
}

export default regionalReact;
