const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  client.user.setActivity("the channel", {type: "WATCHING"});
  let generalChannel = client.channels.get("ENTER YOUR CHANNEL ID");
  generalChannel.send("Hello, i'm the support system of this channel. If you need anything ask me!");
});

client.on('message', (msg) => {
  if (msg.author == client.user) return;

  msg.channel.send("Message received from user : " + msg.author.toString() + " : " + msg.content);

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
      const fetchedMessages = await msg.channel.fetchMessages({limit: 99});
      msg.channel.bulkDelete(fetchedMessages);
    }
    clear();
  }
});

//enter token
client.login("ENTER YOUR TOKEN");
