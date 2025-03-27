import discord
from discord import app_commands

import src.lib.utils as utils
from src.lib.database import db
from src.lib.config import cfg
from src.lib.log import log

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)


@tree.command(name='add_channel')
async def add_channel(interaction: discord.Interaction) -> None:
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message('You do not have the required Permissions', ephemeral=True)
        return

    if not cfg.validate_channel(interaction.channel):
        await interaction.response.send_message('The Channel is not valid', ephemeral=True)
        return

    await interaction.response.send_message('Adding Channel to the Database', ephemeral=True)
    counter = 0
    last_message = None
    while True:
        done = True

        async for message in interaction.channel.history(limit=None, before=last_message):
            if cfg.validate_message(message):
                counter += 1
                await utils.add_reactions(message)
                db.update_message(message)

            last_message = message.created_at
            if done:
                done = False

        if done:
            break

    log.info('Added %s Messages to the Database', counter)


async def fetch_message(channel_id: int, message_id: int) -> discord.Message | None:
    channel = await client.fetch_channel(channel_id)

    message = await channel.fetch_message(message_id)  # type: ignore[union-attr]
    return message


# React to new messages
@client.event
async def on_message(message: discord.Message):
    if not cfg.validate_message(message):
        return

    await utils.add_reactions(message)

    db.update_message(message)


@client.event
async def on_raw_message_edit(payload):
    await utils.edit_message(await fetch_message(payload.channel_id, payload.message_id))


@client.event
async def on_raw_message_delete(payload):
    await utils.delete_message(await fetch_message(payload.channel_id, payload.message_id))


@client.event
async def on_raw_reaction_add(payload):
    if not payload.member.bot:
        await on_raw_reaction_remove(payload)


@client.event
async def on_raw_reaction_remove(payload):
    await utils.update_reactions(await fetch_message(payload.channel_id, payload.message_id))


@client.event
async def on_ready():
    await tree.sync()
    log.info('Logged on as %s!', client.user)
