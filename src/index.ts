import { Client, GatewayIntentBits, Partials, MessageReaction, Message, Collection, Events, User } from 'discord.js';
import { read } from './lib/config.js';
import { Bot_Database } from './lib/database.js';
import { Command, Config } from './lib/types.js';
import * as utils from './lib/utils.js';
import { console } from 'node:inspector/promises';

const cfg: Config = read();
export const database: Bot_Database = new Bot_Database(cfg.database, cfg.servers, cfg.bot);

let commands: Collection<string, Command>;

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

client.on(Events.MessageReactionAdd, async (reaction: MessageReaction, user: User) => {
    console.log('messageReactionAdd');
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on(Events.MessageReactionRemove, async (reaction: MessageReaction, user: User) => {
    console.error("messageReactionRemove");
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on(Events.MessageCreate, async (message: Message) => {
    console.log("messageCreate");
    database.addMessage(await message.fetch());
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

client.once(Events.ClientReady, readyClient => {
    commands = utils.deployCommands();
    database.createChannel("DMs");
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Login to Discord Bot
client.login(cfg.bot.token);
