import json
import discord


class Config:
    def __init__(self, path: str):
        self.config = json.load(open(path, encoding='utf-8'))

    def validate_message(self, message: discord.Message) -> bool:
        if message.guild is None:
            return False
        servers = self.config['servers']
        if str(message.guild.id) not in servers:
            return False
        if str(message.channel.id) not in servers[str(message.guild.id)]['channelIds']:
            return False
        return message.application_id is None

    def validate_reaction(self, reaction: discord.Reaction) -> str | None:
        if reaction.message.guild is None or not self.validate_message(reaction.message):
            return None
        server = self.config['servers'][str(reaction.message.guild.id)]
        if str(reaction) == server['upvote']:
            return 'reactionUpvote'
        if str(reaction) == server['downvote']:
            return 'reactionDownvote'
        return None

    def get_upvote_emoji(self, server: discord.Guild) -> str:
        return self.config['servers'][str(server.id)]['upvote']

    def get_downvote_emoji(self, server: discord.Guild) -> str:
        return self.config['servers'][str(server.id)]['downvote']

    def get_bot_token(self) -> str:
        return self.config['bot']['token']

    def get_server_ids(self) -> list[str]:
        return self.config['servers'].keys()

    def get_channel_ids(self, server_id: str) -> list[str]:
        return self.config['servers'][server_id]['channelIds']

    def get_reaction(self, message: discord.Message, emoji_name: str) -> discord.Reaction:
        return [reaction for reaction in message.reactions if reaction.emoji.name == emoji_name][0]
