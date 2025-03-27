import discord
from epz_bot.lib.config import cfg
from epz_bot.lib.database import db


async def add_reactions(message: discord.Message):
    await message.add_reaction(cfg.get_upvote_emoji(message.guild))
    await message.add_reaction(cfg.get_downvote_emoji(message.guild))


async def edit_message(message: discord.Message):
    if not cfg.validate_message(message):
        return

    await add_reactions(message)

    db.update_message(message)


async def delete_message(message: discord.Message):
    if not cfg.validate_message(message):
        return

    db.delete_message(message)


def get_reaction(message: discord.Message, emoji_name: str) -> discord.Reaction:
    return [reaction for reaction in message.reactions if reaction.emoji.name == emoji_name][0]


async def update_reactions(message: discord.Message):
    if not cfg.validate_message(message):
        return

    await add_reactions(message)

    for reaction in message.reactions:
        if (reaction_type := cfg.validate_reaction(reaction)) is not None:
            await db.update_reaction(reaction, reaction_type)
