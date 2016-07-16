'use strict';

var fs = require('fs');
var config = require('./config.json');
var Discord = require('discord.js');
var bot = new Discord.Client({ autoReconnect: true });

var commands = new Map();
var triggerPrefix = config.commandTrigger + config.botPrefix + ' ';
commands.set(/liftoff/i, ['text', 'Houston, we have liftoff!']);
commands.set(/!smallstep/i, ['sound', 'smallstep.mp3']);
commands.set(new RegExp(triggerPrefix + 'exit', 'i'), ['function', leaveVoiceChannel]);
commands.set(new RegExp(triggerPrefix + 'help', 'i'), ['function', displayCommands]);
// commands.set(//i, ['', '']);

function displayCommands(message) {
  var helpMessage = '';

  if(message.content.split(' ')[2]) {
    var helpFilter = new RegExp(message.content.split(' ')[2], 'i');
    commands.forEach(function(fileName, command){
      if(command.toString().match(helpFilter)) {
        helpMessage += command.toString().split('/')[1] + '\n';
      }
    });
  } else {
    commands.forEach(function(fileName, command){
      helpMessage += command.toString().split('/')[1] + '\n';
    });
  }
  bot.sendMessage(message.channel, helpMessage);
}

function addSoundsTo(map, fromDirectoryPath) {
  var soundFiles = fs.readdir(fromDirectoryPath, function(err, files) {
    files.forEach(function(file) {
      if(file[0] !== '.') {
        var command = commandTrigger + file.split('.')[0].split('-').join(' ');
        var commandRegExp = new RegExp(command, 'i');
        map.set(commandRegExp, ['sound', file]);
      }
    });
  });
}

function leaveVoiceChannel(message) {
  if(bot.voiceConnection) {
    bot.voiceConnection.destroy();
  }
}

function playSound(authorChannel, authorVoiceChannel, sound) {
  bot.joinVoiceChannel(authorVoiceChannel).then(function(connection, error) {
    connection.playFile(config.soundPath + sound).then(function(intent, error) {
      if(error) {
        bot.sendMessage(authorChannel, 'Error: ' + error);
      }
      intent.on('error', function(streamError) {
        bot.sendMessage(authorChannel, 'Error: ' + streamError);
      });
      if(config.autoLeaveVoice) {
        intent.on('end', function() {
          connection.destroy();
        });
      }
    });
  });
}

function sendMessage(authorChannel, text) {
  bot.sendMessage(authorChannel, text);
}

bot.on('message', function(message) {
  if(message.author.username !== bot.user.username) {
    commands.forEach(function (botReply, regexp) {
      if(message.content.match(regexp)) {
        switch(botReply[0]) {
          case 'function':
          botReply[1](message);
          break;
          case 'sound':
          playSound(message.channel, message.author.voiceChannel, botReply[1]);
          break;
          case 'text':
          sendMessage(message.channel, botReply[1]);
          break;
          default:
          break;
        }
      }
    });
  }
});

(function init() {
  bot.loginWithToken(config.botToken);

  if(config.autoLoadSounds) {
    addSoundsTo(commands, config.soundPath);
  }
})();
