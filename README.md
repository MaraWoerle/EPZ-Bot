# EPZ-Bot

---

A bot to keep track of all messages in certain channels, manage them with upvotes and save them to a Database.

---

## Usage

### Requirements

- Docker/Podman
- A MariaDB Database [optional]

### Installation

- Copy this folder to the destination where you want the bot to reside
- Create a file `config.json` and configure it
- Open the folder in a console and start the containers

```bash
docker-compose up -d
```

```bash
podman-compose up -d
```

---

## Configuration

The `config.json` should include the following options:

```json
{
    "bot": {
        "clientId": "<Discord Bot Client ID>",
        "token": "<Discord Bot Auth Token>",
        "dmReply": "<Reply to all DMs>"
    },
    "database": {
        "host": "<Database Host>",
        "name": "<Database Name>",
        "user": "<Database User>",
        "password": "<Database Password>"
    },
    "servers": {
        "<ServerID>": {
            "channelIds": [
                "<First Channel ID>",
                "<Second Channel ID>"
            ],
            "upvote": "<Upvote emoji Identifier>",
            "downvote": "<Downvote emoji Identifier>"
        }
    }
}
```

> Note: You can add as many channels as you desire.

---

###### Custom Emojis

- For custom emojis you can add a Backslash `\` in front of the emoji to get the Identifier. This Identifier should look something like:
`<:Name:########>`
- To use this emoji, you will have to remove the leading `<:` and the appended `>` so the Identifier looks like this:
`Name:########`

###### Standard Emojis

- For the standard Discord emojis you need the UTF-8 Encoding in the HTML URL format. You can Look up the Bytes on this [Website](https://apps.timwhitlock.info/emoji/tables/unicode).
- Then you will have to format the bytes to look like this (replace the # with the bytes in hexadecimal):
`%##%##%##`
