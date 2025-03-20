import { ChatInputCommandInteraction, Collection, GuildTextBasedChannel, Message, SlashCommandBuilder, Snowflake } from "discord.js";
import { read } from '../../lib/config';
import * as utls from '../../lib/utils';
import { database } from '../../index';
import { Config } from "../../lib/types";

const cfg: Config = read();

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('add-channel')
    .setDescription('Adds the whole channel to the database')
    .setDefaultMemberPermissions(0x8);

export function execute(interaction: ChatInputCommandInteraction): void {
    interaction.channel.fetch().then((channel: GuildTextBasedChannel) => {
        // Filter Channels
        if (!utls.validChannel(channel, cfg.servers)) return;

        console.log("Adding Channel " + channel.name + " to the Database");

        let before: Snowflake = null;
        let done: boolean = false
        while (!done) {
            channel.messages.fetch({ limit: 100, before }).then((messages: Collection<Snowflake, Message<true>>) => {
                if (messages.size > 0) {
                before = messages.lastKey();
                messages.forEach((message: Message) => {
                    database.addMessage(message);
                });
                } else done = true
            })
        }
    })

    interaction.reply({ content: 'Done!', ephemeral: true });
}