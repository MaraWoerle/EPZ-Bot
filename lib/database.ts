import * as mariadb from 'mariadb';
import { Connection } from 'mariadb';
import { json_bot, json_database, json_servers } from './types';
import { Collection, Message, MessageReaction, Snowflake, User } from 'discord.js';
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

    async query(sql: string, values: Array<string> = []): Promise<string> {
        // Execute a query to the Database
        var res: string;
        var conn: Connection;
        console.log("Executing: " + sql);
        try {
            conn = await this.connect();
            res = await conn.query(sql, values);
            console.log("Result: " + res);
        } catch (err) {
            console.log(err);
        } finally {
            if(conn) conn.end();
        }
        return res;
    }

    createChannel(name: string): void {
        // Create a table for the channel if it not already exists
        this.query('CREATE TABLE IF NOT EXISTS `' + name + '` (username VARCHAR(255), \
            userId VARCHAR(255), \
            message TEXT, \
            timestamp VARCHAR(255), \
            messageId VARCHAR(255) PRIMARY KEY)');
    }

    createVotedChannel(name: string): void {
        // Create a table for the channel if it not already exists
        this.query('CREATE TABLE IF NOT EXISTS `' + name + '` (username VARCHAR(255), \
            userId VARCHAR(255), \
            message TEXT, \
            timestamp VARCHAR(255), \
            messageId VARCHAR(255) PRIMARY KEY, \
            reactionUpvote INT DEFAULT (0), \
            reactionDownvote INT DEFAULT (0))');
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

        // Add Message to the table
        this.query('INSERT IGNORE INTO `' + channelName + '` (\
            username, \
            userId, \
            message, \
            timestamp, \
            messageId) \
            VALUES (?, ?, ?, ?, ?)', [
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

        this.addMessage(message);

        // Get reaction name
        const reactionName: string = reaction.emoji.identifier;

        // Extract reaction data
        if (!message.guild) return;
        if (message.channel.isDMBased()) return;
        const server = this.servers[message.guild.id];
        const messageId: string = message.id;
        const channelName: string = message.channel.name;
        const reactionType: string = reactionName === server.upvote ? 'reactionUpvote' : 'reactionDownvote';
        var reactionCount = Number(reaction.count);

        const users: Collection<string, User> = await reaction.users.fetch();
        users.forEach((user: User) => {
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

        // Execute the query
        this.query("UPDATE `" + channelName + "` SET " + reactionType + " = " + reactionCount + " WHERE messageId = '" + messageId + "'");
    }

    replyDM(message: Message): void {
        if (message.author.bot) return;

        this.logMessage(message);

        message.author.send(this.bot.dmReply);
    }

    addMessage(message: Message): void {
        // Reply to DMs
        if (!message.guild) this.replyDM(message);

        // Filter messages
        if (!utls.validMessage(message, this.servers)) return;
        if (!message.guild) return;
        var serverId: string = message.guild.id;

        // Create Table if it doesn't exist yet
        if (message.channel.isDMBased()) return;
        this.createVotedChannel(message.channel.name);

        // Add reactions
        message.react(this.servers[serverId].upvote);
        message.react(this.servers[serverId].downvote);

        this.logMessage(message);
    }
}



