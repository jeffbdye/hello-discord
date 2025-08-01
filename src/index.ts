import { Client, Events, MessageFlags } from 'discord.js';
import { ChatCommand } from './commands/utility/types';
import initList from './commands'
const { token } = require('../config.secrets.json');

// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
const client = new Client({ intents: ['Guilds'] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

let commands = new Map<string, ChatCommand>();
for (let cmd of initList) {
	commands.set(cmd.data.name, cmd);
}

// handle chat commands
// https://discord.js.org/docs/packages/discord.js/14.21.0/ClientEvents:Interface#interactionCreate
// https://discordjs.guide/slash-commands/response-methods.html#follow-ups
// https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/client/Client.js
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	let command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);