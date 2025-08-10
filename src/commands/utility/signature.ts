import { quote, subtext } from 'discord.js';

export function getSignature(commandName: string): string {
  return subtext(quote(`posted by ${commandName}`));
}