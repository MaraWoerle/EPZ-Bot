import { Client, GatewayIntentBits, Partials, MessageReaction, Message, Collection, Events, User } from 'discord.js';
import { read } from './lib/config';
import { Bot_Database } from './lib/database';
import { Command, Config } from './lib/types';
import * as utils from './lib/utils';

const cfg: Config = read();
export const database: Bot_Database = new Bot_Database(cfg.database, cfg.servers, cfg.bot);

var commands: Collection<string, Command> = utils.loadCommands();

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Intent for Guilds
        GatewayIntentBits.GuildMessages, // Intent for Guild Messages
        GatewayIntentBits.MessageContent, // Intent for Message Content
        GatewayIntentBits.GuildMessageReactions, // Intent for Message Reactions
        GatewayIntentBits.DirectMessages //Intent for Direct Messages
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ], // Necessary for uncached messages/reactions
});

client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on('messageCreate', async (message: Message) => {
    database.addMessage(await message.fetch());
});

client.once('ready', () => {
    database.createChannel("DMs");
    console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command: Command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		command.execute(interaction);
	} catch (error) {
		console.log(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Login to Discord Bot
client.login(cfg.bot.token);
