const Discord = require('discord.js');
const client = new Discord.Client();

var users = [];
var kickedUsers = [];
var warnedUsers = [];
const warnBuff = 3;
const kickBuff = 5;
const interval = 2000;
const message = {
  warningMessage: "You are sending messages too fast! If you continue like this you are going to be kicked from the server.",
  kickMessage: "has been kicked from server. Reason: [spamming]"
}

client.on('ready', () => {
  client.user.setActivity("the channel", {type: "WATCHING"});
  let generalChannel = client.channels.get("ENTER YOUR CHANNEL ID");
  generalChannel.send("Hello, i'm the support system of this channel. If you need anything ask me!");
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

    if (commandName == "help") {
      execHelp(args, msg);
    }
    else if (commandName == "clear") {
      msg.channel.send("Clearing the chat ...");
      execClear(msg);
    }
    else {
      msg.channel.send("Unknown command. Please try using `!help` or `!clear`");
    }
  }

  //!help command that provides help for a certain topic
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

  var matchedUsers = 0;
  for (var i = 0; i < users.length; i++) {
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

client.login("ENTER YOUR TOKEN");
