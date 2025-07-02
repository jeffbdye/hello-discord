import { REST, Routes } from 'discord.js';
const { token, clientId, guildId } = require('../config.secrets.json');
import initList from './commands'

let commands = initList.map(c => c.data);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const updateResponse = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    ) as any;

    console.log(`Successfully reloaded ${updateResponse?.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();