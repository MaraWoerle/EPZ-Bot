import { ApplicationEmoji, Collection, GuildEmoji, GuildTextBasedChannel, Message, MessageReaction, ReactionEmoji, REST, Routes } from "discord.js";
import { Command, Config, json_servers } from "./types.js";
import * as path from 'path';
import * as fs from 'fs';
import { read } from './config.js';

const cfg: Config = read();

export function deployCommands(): Collection<string, Command> {
    const commands = loadCommands();
    const commandsJson = [];
    const rest = new REST().setToken(cfg.bot.token);
    console.log(`Started refreshing application (/) commands`);
    for (const [commandName, command] of commands) {
        console.log(" ", commandName);
        commandsJson.push(command.data.toJSON());
    }
    try {
        rest.put(
            Routes.applicationCommands(cfg.bot.clientId),
            { body: commandsJson },
        );
		console.log(`Successfully reloaded application (/) commands`);
    } catch(error) {
        console.error(error);
    }
    return commands;
}

export function loadCommands(): Collection<string, Command> {
    const commands: Collection<string, Command> = new Collection();
    const foldersPath: string = path.resolve('./build/commands');
    const commandFolders: string[] = fs.readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath: string = path.join(commandsPath, file);
            //const command: Command = require(filePath);
            import(filePath).then(command => {
                if ('data' in command && 'execute' in command) {
                    commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            })
        }
    }
    return commands;
}

export function validChannel(channel: GuildTextBasedChannel, servers: json_servers): boolean {
    if (!channel.guild) return false;
    if (servers[channel.guild.id] == undefined) return false;
    if (!servers[channel.guild.id].channelIds.includes(channel.id)) return false;
    return true;
}

export function validMessage(message: Message, servers: json_servers): boolean {
    // Filter Bot Messages
    if (message.author.bot) return false;
    // Filter Servers
    if (!message.guild) return false;
    const serverId: string = message.guild.id;
    if (servers[serverId] == undefined) return false;
    // Filter Channels
    const channelId: string = message.channel.id;
    if (!servers[serverId].channelIds.includes(channelId)) return false;

    return true;
}

export function validReaction(reaction: MessageReaction, servers: json_servers) {
    const emoji: ReactionEmoji | GuildEmoji | ApplicationEmoji = reaction.emoji;
    const emojiName: string = emoji.identifier;
    if (!reaction.message.guild) return false;
    const serverId: string = reaction.message.guild.id;
    if (emojiName == servers[serverId].upvote || emojiName == servers[serverId].downvote) return true;
    return false;
}

export function extractContent(message: Message): string {
    let content: string = message.content;

    // Add Sticker URLs
    for (const sticker of message.stickers.values()) {
        content += sticker.url;
    }
    // Add Attachment URLs
    for (const attachment of message.attachments.values()) {
        content += attachment.url;
    }

    return content;
}