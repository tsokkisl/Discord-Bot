const Discord = require('discord.js');
const client = new Discord.Client();

const CHANNEL = "ENTER YOUR CHANNEL";
const TOKEN = "ENTER YOUR TOKEN";

let users = [];
let kickedUsers = [];
let warnedUsers = [];
const warnBuff = 3;
const kickBuff = 5;
const interval = 2000;
const message = {
  warningMessage: "You are sending messages too fast! If you continue like this you are going to be kicked from the server.",
  kickMessage: "has been kicked from server. Reason: [spamming]"
}

client.on('ready', () => {
  client.user.setActivity("the channel", {type: "WATCHING"});
  let generalChannel = client.channels.get(CHANNEL);
  generalChannel.send("Hello, i'm the support system of this channel. Type `!commands` to check the available commands. If you need anything ask me!");
})

client.on('message', (msg) => {
  if (msg.author == client.user) return;

  // msg.channel.send("Message received from user : " + msg.author.toString() + " : " + msg.content);

  if (msg.content.startsWith("!")) {
    executeCommand(msg);
  }

  //function that handles the commands
  function executeCommand(msg) {
    let command = msg.content.substr(1);
    let commandParse = command.split(" ");
    let commandName = commandParse[0];
    let args = commandParse.slice(1);

    if (commandName == "commands") {
      msg.channel.send("Commands : \n\n 1. `!commands` : Display the available commands.\n\n" +
       " 2. `!help [topic]` : Provide help on a certain topic.\n\n" +
       " 3. `!clear` : Clear the chat.\n\n" +
       " 4. `!about [username#0000]` : Display user information.\n\n" +
       " 5. `!playing [game]` : Display users that are currently playing a specific game.");
    }
    else if (commandName == "help") {
      execHelp(args, msg);
    }
    else if (commandName == "clear") {
      msg.channel.send("Clearing the chat ...");
      execClear(msg);
    }
    else if (commandName == "about") {
      execGetUserInformation(msg, args);
    }
    else if (commandName == "playing") {
      let game = args.join(" ");
      execGetUsersPlaying(msg, game);
    }
    else {
      msg.channel.send("Unknown command. Please try using `!commands` to see all the available commands");
    }
  }

  //!help command that provides help on a certain topic
  function execHelp(args, msg) {
    if (args.length == 0) msg.channel.send("Please provide some more information, try using `!help [topic]`");
    else msg.channel.send("Dont worry i'm here to help you with " + args + "!");
  }

  //!clear command that clears the chat
  function execClear(msg) {
    async function clear() {
      msg.delete();
      const fetched = await msg.channel.fetchMessages({limit: 99});
      msg.channel.bulkDelete(fetched);
    }
    clear();
  }

  //!about command that displays user information
  async function execGetUserInformation(msg, args) {
    let flag = false;
    let checkedUsers = [];
    await client.guilds.array().forEach(async g => {
        await g.members.array().forEach(m => {
            if (!checkedUsers.includes(m.user.tag) && m.user.tag == args) {
              msg.channel.send("Username : `" + m.user.username + "`\n\n" +
              "Created at : `" + m.user.createdAt + "`\n\n" +
              "Status : `" + m.presence.status + "`\n\n" +
              "Server : `" + m.guild.name + "`\n\n" +
              "Joined at : `" + m.joinedAt + "`");
              if (m.user.verified) msg.channel.send("Account verified.");
              else msg.channel.send("Account not verified.");
              flag = true;
              checkedUsers.push(m.user.tag);
              return;
            }
        });
    });
    if (!flag) msg.channel.send("User not found please try again!");
  }

  //!playing command that displays users that are currently playing a specific game
  async function execGetUsersPlaying(msg, game) {
    let flag = false;
    let usersPlaying = [];
    await client.guilds.array().forEach(async g => {
        await g.members.array().forEach(m => {
            if (m.user.presence.game != null && m.user.presence.game.name == game && !usersPlaying.includes(m.user.tag)) {
              usersPlaying.push(m.user.tag);
              flag = true;
            }
        });
    });
    if (!flag) msg.channel.send("No users are currently playing " + game);
    else {
      let response = "Users currently playing " + game + ":\n\n";
      usersPlaying.forEach(u => {
        response += "`" + u + "`" + "\n\n";
      });
      msg.channel.send(response);
    }
  }

  //user kick
  const kickUser = async (ms, kickMsg) => {
      kickedUsers.push(ms.author.id);
      let usr = ms.guild.members.get(ms.author.id);
      if (usr) {
        usr.kick("spamming").then((member) => {
          ms.channel.send(`<@!${ms.author.id}>, ${kickMsg}`);
          return true;
       }).catch(() => {
          msg.channel.send(`Insufficient permissions to kick user <@!${msg.author.id}>!`);
          return false;
      });
    }
  }

  //user warning
  const warnUser = async (ms, warnMsg) => {
    warnedUsers.push(ms.author.id);
    ms.channel.send(`<@${ms.author.id}>, ${warnMsg}`);
  }

  if (msg.author.bot) return;
  if (!msg.member || msg.channel.type !== "text" || !msg.channel.guild || !msg.guild) return;

  let currentTime = Math.floor(Date.now());

  users.push({
    "user": msg.author.id,
    "time": currentTime
  });

  let matchedUsers = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i].time > currentTime - interval) {
      matchedUsers++;
      if (matchedUsers >= warnBuff && matchedUsers < kickBuff && !warnedUsers.includes(msg.author.id)) {
        warnUser(msg, message.warningMessage);
      }
      else if (matchedUsers >= kickBuff) {
        if (!kickedUsers.includes(msg.author.id)) {
          kickUser(msg, message.kickMessage);
        }
      }
    }
    else if (users[i].time < currentTime - interval) {
      users.splice(i);
      warnedUsers.splice(warnedUsers.indexOf(users[i]));
      kickedUsers.splice(kickedUsers.indexOf(users[i]));
    }
  }
});

client.login(TOKEN);
