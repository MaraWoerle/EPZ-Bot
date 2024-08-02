import { Client, GatewayIntentBits, Partials, MessageReaction, Message, ReactionEmoji, GuildEmoji, PartialMessage, Collection, Events } from 'discord.js';
import { read } from './lib/config';
import { Bot_Database } from './lib/database';
import * as utls from './lib/utils';
import * as path from 'path';
import * as fs from 'fs';

const cfg = read();
export const database = new Bot_Database(cfg.database, cfg.servers, cfg.bot);
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

var commands: Collection<string, { execute(ChatInputCommandInteraction): void }> = new Collection();

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

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    database.updateReactionCount(await reaction.fetch());
});

client.on('messageCreate', async message => {
    database.addMessage(message);
});

client.once('ready', () => {
    database.createChannel("DMs");
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Login to Discord Bot
client.login(cfg.bot.token);
