# EPZ-Bot

---

A bot to keep track of all messages in certain channels, manage them with upvotes and save them to a Database.

---

## Usage

### Requirements

- NodeJs
- Typescript
- A MariaDB Database

### Installation

- Copy this folder to the destination where you want the bot to reside
- Open the folder in a console and install the npm package

```bash
npm install
```

- Create a file `config.json` and configure it
- Run the Project (You have two Options, depending if you have ts-node installed)

###### 1. Option (without ts-node)

- Build the project

```bash
npm run build
```
- Run the `build/index.js` file

```bash
node ./build/index.js
```
###### 2. Option (with ts-node)

- Run the `index.ts` file

```bash
ts-node index.ts
```


> Note: If you are on Linux xou can run the bot in the background either as [systemd service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) or as [screen](https://www.gnu.org/software/screen/manual/screen.html)

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
