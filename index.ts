import { Client, GatewayIntentBits, Partials, MessageReaction, Message, ReactionEmoji, GuildEmoji, PartialMessage } from 'discord.js';
import { read } from './lib/config';
import { Bot_Database } from './lib/database';
import * as utls from './lib/utils';

const cfg = read();

const database = new Bot_Database(cfg.database, cfg.servers, cfg.bot);

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
    console.log('Ready!');
});

// Login to Discord Bot
client.login(cfg.bot.token);
