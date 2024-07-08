import { GuildEmoji, Message, MessageReaction, ReactionEmoji, formatEmoji } from "discord.js";
import { json_servers } from "./types";

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