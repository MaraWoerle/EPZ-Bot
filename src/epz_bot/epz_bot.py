import discord

from epz_bot.lib.config import Config
from epz_bot.lib.database import Database
from epz_bot.lib.log import log

cfg = Config('config/epz-bot.json')
db = Database(cfg.config["database"])


class EPZClient(discord.Client):
    async def on_ready(self):
        log.info('Logged on as %s!', self.user)

    async def fetch_message(self, channel_id: int, message_id: int) -> discord.Message | None:
        channel = await self.fetch_channel(channel_id)

        message = await channel.fetch_message(message_id)  # type: ignore[union-attr]
        return message

    async def fetch_message_payload(self, payload):
        return await self.fetch_message(payload.channel_id, payload.message_id)

    # React to new messages
    async def on_message(self, message: discord.Message):
        if message.guild is None or not cfg.validate_message(message):
            return

        await message.add_reaction(cfg.get_upvote_emoji(message.guild))
        await message.add_reaction(cfg.get_downvote_emoji(message.guild))

        db.create_message(message)

    # Update Messages upon edit in Database
    async def on_message_edit(self, _, message: discord.Message):
        if not cfg.validate_message(message):
            return

        db.create_message(message)

    async def on_raw_message_edit(self, payload):
        await self.on_message_edit(None, await self.fetch_message_payload(payload))

    # Delete Message upon Deletion
    async def on_message_delete(self, message: discord.Message):
        if not cfg.validate_message(message):
            return

        db.delete_message(message)

    async def on_bulk_message_delete(self, messages: list[discord.Message]):
        for message in messages:
            await self.on_message_delete(message)

    async def on_raw_message_delete(self, payload):
        await self.on_message_delete(await self.fetch_message_payload(payload))

    # Add Reactions
    async def on_reaction_add(self, reaction: discord.Reaction, user: discord.User):
        if user.bot:
            return
        if (reaction_type := cfg.validate_reaction(reaction)) is None:
            return

        await db.update_reaction(reaction, reaction_type)

    async def on_reaction_remove(self, reaction: discord.Reaction, user: discord.User):
        await self.on_reaction_add(reaction, user)

    async def on_raw_reaction_add(self, payload):
        user = await self.fetch_user(payload.user_id)
        message = await self.fetch_message_payload(payload)
        reaction = cfg.get_reaction(message, payload.emoji.name)

        await self.on_reaction_add(reaction, user)

    async def on_raw_reaction_remove(self, payload):
        await self.on_raw_reaction_add(payload)


def start():
    log.info('Starting')

    # Prepare Database
    for server in cfg.get_server_ids():
        for channel in cfg.get_channel_ids(server):
            db.create_voted_channel(channel)
    db.create_channel('DMs')
    log.info('Database Setup Complete')

    # Start Discord Client
    intents = discord.Intents.default()
    intents.message_content = True

    client = EPZClient(intents=intents)
    client.run(cfg.get_bot_token())
    log.info('Quitting')
