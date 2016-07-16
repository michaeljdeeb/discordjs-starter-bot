'use strict';

var fs = require('fs');
var Discord = require('discord.js');
var bot = new Discord.Client({ autoReconnect: true });

var autoLeaveVoice = true;
var autoLoadSounds = false;

var soundPath = './sounds/';
var commandTrigger = '!';
var botPrefix = 'bot';

var commands = new Map();
commands.set(/liftoff/i, ['text', 'Houston, we have liftoff!']);
commands.set(/!smallstep/i, ['sound', 'smallstep.mp3']);
commands.set(new RegExp(commandTrigger + botPrefix + ' ' + exit, 'i'), ['function', leaveVoiceChannel]);
// commands.set(//i, ['', '']);

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

function leaveVoiceChannel() {
  if(bot.voiceConnection) {
    bot.voiceConnection.destroy();
  }
}

function playSound(authorChannel, authorVoiceChannel, sound) {
  bot.joinVoiceChannel(authorVoiceChannel).then(function(connection, error) {
    connection.playFile(soundPath + sound).then(function(intent, error) {
      if(error) {
        bot.sendMessage(authorChannel, 'Error: ' + error);
      }
      intent.on('error', function(streamError) {
        bot.sendMessage(authorChannel, 'Error: ' + streamError);
      });
      if(autoLeaveVoice) {
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
            botReply[1]();
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
  bot.loginWithToken('APP_BOT_USER_TOKEN');

  if(autoLoadSounds) {
    addSoundsTo(commands, soundPath);
  }
})();
