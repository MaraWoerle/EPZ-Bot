import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface json_bot {
    clientId: string;
    token: string;
    dmReply: string;
}

export interface json_database {
    host: string;
    name: string;
    user: string;
    password: string;
}

export interface json_servers {
    [id: string]: {
        channelIds: string[];
        upvote: string;
        downvote: string;
    }
}

export interface Config {
    bot: json_bot;
    database: json_database;
    servers: json_servers;
}

export interface Command {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): void;
}