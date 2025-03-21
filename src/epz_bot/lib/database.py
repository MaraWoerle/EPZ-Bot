import discord
import mariadb

from epz_bot.lib.log import log


class Database:
    def __init__(self, config):
        self.__database = mariadb.connect(
            host=config['host'],
            user=config['user'],
            password=config['password'],
            database=config['name'],
            autocommit=True,
        )

        log.info('Connected to Database: %s', self.__database)

    def __query(self, command: str, params: list | None = None) -> None:
        log.info('Executing Query: %s, %s', ' '.join(command.split()), params)

        with self.__database.cursor() as cursor:
            cursor.execute(command, params)

    def create_channel(self, channel_id: str) -> None:
        sql = 'CREATE TABLE IF NOT EXISTS `' + channel_id + '''` (
                username VARCHAR(255),
                userId VARCHAR(255),
                message TEXT,
                timestamp VARCHAR(255),
                messageId VARCHAR(255) PRIMARY KEY
            )
        '''

        self.__query(sql, [channel_id])

    def create_voted_channel(self, channel_id: str) -> None:
        sql = 'CREATE TABLE IF NOT EXISTS `' + channel_id + '''` (
                username VARCHAR(255),
                userId VARCHAR(255),
                message TEXT,
                timestamp VARCHAR(255),
                messageId VARCHAR(255) PRIMARY KEY,
                reactionUpvote INT DEFAULT (0),
                reactionDownvote INT DEFAULT (0)
            )
        '''

        self.__query(sql, [channel_id])

    def create_message(self, message: discord.Message) -> None:
        sql = 'REPLACE INTO `' + str(message.channel.id) + '''` (
                username,
                userId,
                message,
                timestamp,
                messageId
            ) VALUES (%s, %s, %s, %s, %s)
        '''

        self.__query(sql, [
            message.author.name,
            message.author.id,
            message.content,
            message.created_at.isoformat(),
            message.id
        ])

    def delete_message(self, message: discord.Message) -> None:
        self.__query('DELETE FROM `' + str(message.channel.id) + '` WHERE messageId=' + str(message.id))

    async def update_reaction(self, reaction: discord.Reaction, reaction_type: str) -> None:
        self.create_message(reaction.message)

        users = [user.bot async for user in reaction.users()]

        sql = 'UPDATE `' + str(reaction.message.channel.id) \
            + '` SET ' + reaction_type \
            + ' = ' + str(users.count(False)) \
            + ' WHERE messageId = ' + str(reaction.message.id)

        self.__query(sql)
