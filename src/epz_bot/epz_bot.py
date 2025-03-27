from epz_bot.lib.config import cfg
from epz_bot.lib.database import db
from epz_bot.lib.client import client
from epz_bot.lib.log import log


def start():
    log.info('Starting')

    # Prepare Database
    for server in cfg.get_server_ids():
        for channel in cfg.get_channel_ids(server):
            db.create_voted_channel(channel)
    db.create_channel('DMs')
    log.info('Database Setup Complete')

    # Start Discord Client
    client.run(cfg.get_bot_token())
    log.info('Quitting')
