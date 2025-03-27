from unittest.mock import MagicMock
from src.lib.config import Config


def test_get_upvote_emoji():
    cfg = Config('config/default-config.json')
    mock_server = MagicMock(id='<serverId>')

    upvote_emoji = '<upvoteEmoji>'

    assert cfg.get_upvote_emoji(mock_server) == upvote_emoji


def test_get_downvote_emoji():
    cfg = Config('config/default-config.json')
    mock_server = MagicMock(id='<serverId>')

    downvote_emoji = '<downvoteEmoji>'

    assert cfg.get_downvote_emoji(mock_server) == downvote_emoji


def test_get_bot_token():
    cfg = Config('config/default-config.json')

    bot_token = '<token>'

    assert cfg.get_bot_token() == bot_token


def test_get_server_ids():
    cfg = Config('config/default-config.json')

    server_ids = {'<serverId>': ''}

    assert cfg.get_server_ids() == server_ids.keys()


def test_get_channel_ids():
    cfg = Config('config/default-config.json')

    channel_ids = ['<channelId>']

    assert cfg.get_channel_ids('<serverId>') == channel_ids


def test_get_database_cfg():
    cfg = Config('config/default-config.json')

    db_config = {
        "host": "<dbHost>",
        "name": "<dbName>",
        "user": "<dbUser>",
        "password": "<dbPassword>"
    }

    assert cfg.get_database_cfg() == db_config
