import * as mariadb from 'mariadb';
import { Connection } from 'mariadb';
import { json_bot, json_database, json_servers } from './types';
import { Message, MessageReaction } from 'discord.js';
import * as utls from './utils';

export class Bot_Database {
    config: json_database;
    servers: json_servers;
    bot: json_bot;

    constructor(config: json_database, servers: json_servers, bot: json_bot) {
        this.config = config;
        this.servers = servers;
        this.bot = bot;
    }

    async connect(): Promise<Connection> {
        return mariadb.createConnection({
            host: this.config.host,
            user: this.config.user,
            password: this.config.password,
            database: this.config.name
        });
    }

    async query(sql: string, values: Array<string> = []): Promise<void> {
        // Execute a query to the Database
        var conn: Connection | undefined;
        console.log("Executing: " + sql);
        try {
            conn = await this.connect();
            const res: string = await conn.query(sql, values);
            console.log("\t" + res);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async createChannel(name: string): Promise<void> {
        // Create a table for the channel if it not already exists
        var sql: string = 'CREATE TABLE IF NOT EXISTS `' + name + '` (username VARCHAR(255), \
            userId VARCHAR(255), \
            message TEXT, \
            timestamp VARCHAR(255), \
            messageId VARCHAR(255) PRIMARY KEY)';

        await this.query(sql);
    }

    async createVotedChannel(name: string): Promise<void> {
        // Create a table for the channel if it not already exists
        var sql: string = 'CREATE TABLE IF NOT EXISTS `' + name + '` (username VARCHAR(255), \
            userId VARCHAR(255), \
            message TEXT, \
            timestamp VARCHAR(255), \
            messageId VARCHAR(255) PRIMARY KEY, \
            reactionUpvote INT DEFAULT (0), \
            reactionDownvote INT DEFAULT (0))';

        await this.query(sql);
    }

    logMessage(message: Message): void {
        // Extract message data
        const username: string = message.author.username;
        const userId: string = message.author.id;
        const timestamp: string = message.createdAt.toISOString();
        const channelName: string = message.channel.isDMBased() ? 'DMs' : message.channel.name;
        const content: string = utls.extractContent(message);

        // Log Message
        console.log(
            "Received message:\n\t"
            + "Username: " + username + "\n\t"
            + "Timestamp: " + timestamp + "\n\t"
            + "Channel: " + channelName + "\n\t"
            + "Content: " + content
        )

        // Create sql query
        var sql: string = 'INSERT INTO `' + channelName + '` (\
            username, \
            userId, \
            message, \
            timestamp, \
            messageId) \
            VALUES (?, ?, ?, ?, ?)';

        // Add Message to the table
        this.query(sql, [
            username,
            userId,
            content,
            timestamp,
            message.id
        ]);
    }

    async updateReactionCount(reaction: MessageReaction): Promise<void> {
        var message: Message = await reaction.message.fetch();

        // Filter reactions
        if (!utls.validMessage(message, this.servers)) return;
        if (!utls.validReaction(reaction, this.servers)) return;

        // Get reaction name
        const reactionName: string = reaction.emoji.identifier;

        // Extract reaction data
        if (!reaction.message.guild) return;
        if (reaction.message.channel.isDMBased()) return;
        const server = this.servers[reaction.message.guild.id];
        const messageId: string = reaction.message.id;
        const channelName: string = reaction.message.channel.name;
        const reactionType: string = reactionName === server.upvote ? 'reactionUpvote' : 'reactionDownvote';
        var reactionCount = Number(reaction.count);

        (await reaction.users.fetch()).forEach(user => {
            if (user.bot) {
                reactionCount--;
            }
        })

        // Log reaction
        console.log(
            "Received reaction:\n\t"
            + "MessageId: " + messageId + "\n\t"
            + "Channel: " + channelName + "\n\t"
            + "Reaction: " + reactionType + "\n\t"
            + "Count: " + reactionCount
        )

        // Create query to update the Reaction Count
        var sql: string = "UPDATE `" + channelName + "` SET " + reactionType + " = " + reactionCount + " WHERE messageId = '" + messageId + "'";

        // Execute the query
        await this.query(sql);
    }

    async replyDM(message: Message): Promise<void> {
        if (message.author.bot) return;

        this.logMessage(message);

        message.author.send(this.bot.dmReply);
    }

    async addMessage(message: Message): Promise<void> {
        // Reply to DMs
        if (!message.guild) await this.replyDM(message);

        // Filter messages
        if (!utls.validMessage(message, this.servers)) return;
        if (!message.guild) return;
        var serverId: string = message.guild.id;

        // Create Table if it doesn't exist yet
        if (message.channel.isDMBased()) return;
        await this.createVotedChannel(message.channel.name);

        this.logMessage(message);

        // Add reactions
        await message.react(this.servers[serverId].upvote);
        await message.react(this.servers[serverId].downvote);
    }
}



