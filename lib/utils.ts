import { Collection, GuildEmoji, GuildTextBasedChannel, Message, MessageReaction, ReactionEmoji } from "discord.js";
import { Command, json_servers } from "./types";
import * as path from 'path';
import * as fs from 'fs';

export function loadCommands(): Collection<string, Command> {
    var commands: Collection<string, Command> = new Collection();
    const foldersPath: string = path.join(__dirname, '../commands');
    const commandFolders: string[] = fs.readdirSync(foldersPath);
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
    return commands;
}

export function validChannel(channel: GuildTextBasedChannel, servers: json_servers): boolean {
    if (!channel.guild) return false;
    if (typeof servers[channel.guild.id] == undefined) return false;
    if (!servers[channel.guild.id].channelIds.includes(channel.id)) return false;
    return true;
}

export function validMessage(message: Message, servers: json_servers): boolean {
    // Filter Bot Messages
    if (message.author.bot) return false;
    // Filter Servers
    if (!message.guild) return false;
    var serverId: string = message.guild.id;
    if (typeof servers[serverId] == undefined) return false;
    // Filter Channels
    var channelId: string = message.channel.id;
    if (!servers[serverId].channelIds.includes(channelId)) return false;

    return true;
}

export function validReaction(reaction: MessageReaction, servers: json_servers) {
    var emoji: ReactionEmoji | GuildEmoji = reaction.emoji;
    var emojiName: string = emoji.identifier;
    if (!reaction.message.guild) return false;
    var serverId: string = reaction.message.guild.id;
    if (emojiName == servers[serverId].upvote || emojiName == servers[serverId].downvote) return true;
    return false;
}

export function extractContent(message: Message): string {
    var content: string = message.content;

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