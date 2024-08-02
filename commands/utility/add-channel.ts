import { ChatInputCommandInteraction, Guild, SlashCommandBuilder, TextChannel } from "discord.js";
import { read } from '../../lib/config';
import * as utls from '../../lib/utils';
import { database } from '../../index';

const cfg = read();

export var data: SlashCommandBuilder = new SlashCommandBuilder().setName('add-channel').setDescription('Adds the whole channel to the database');

async function * messagesIterator (channel) {
    let before = null
    let done = false
    while (!done) {
        const messages = await channel.messages.fetch({ limit: 100, before })
        if (messages.size > 0) {
        before = messages.lastKey()
        yield messages
        } else done = true
    }
}

async function * loadAllMessages (channel) {
    for await (const messages of messagesIterator(channel)) {
        for (const message of messages.values()) yield message
    }
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    var channel = await interaction.channel.fetch()
    // Filter Channels
    if (!utls.validChannel(interaction.channel, cfg.servers)) return;

    console.log("Adding Channel " + interaction.channel.name + " to the Database");

    var before = null;
    var done = false
    while (!done) {
        const messages = await channel.messages.fetch({ limit: 100, before })
        if (messages.size > 0) {
        before = messages.lastKey()
        messages.forEach(message => {
            database.addMessage(message);
        });
        } else done = true
    }

    await interaction.reply({ content: 'Done!', ephemeral: true });
}