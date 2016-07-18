'use strict';

var fs = require('fs');
var config = require('./config.json');
var Discord = require('discord.js');
var bot = new Discord.Client({ autoReconnect: true });

var stats;
var commands = new Map();
var triggerPrefix = config.commandTrigger + config.botPrefix + ' ';
commands.set(new RegExp(triggerPrefix + 'help', 'i'), ['function', displayCommands]);
commands.set(new RegExp(triggerPrefix + 'random', 'i'), ['function', playRandomSound]);
commands.set(new RegExp(triggerPrefix + 'popular', 'i'), ['function', sendPopularCommands]);
commands.set(new RegExp(triggerPrefix + 'exit', 'i'), ['function', leaveVoiceChannel]);
if(config.demoMode) {
  commands.set(/liftoff/i, ['text', 'Houston, we have liftoff!']);
  commands.set(/!smallstep/i, ['sound', 'smallstep.mp3']);
}
// commands.set(//i, ['', '']);

function incrementSoundStats(command) {
  if(stats[command]) {
    stats[command]++;
  } else {
    stats[command] = 1;
  }
  fs.writeFile(config.statsFileName, JSON.stringify(stats));
}

function loadStatsFile() {
  fs.readFile(config.statsFileName, 'utf-8', function(error, data) {
    if(error) {
      if(error.code === 'ENOENT') {
        fs.writeFileSync(config.statsFileName, JSON.stringify({}));
        stats = {};
      } else {
        console.log('Error: ', error);
      }
    } else {
      try {
        stats = JSON.parse(data);
      } catch(parsingError) {
        console.log('Error parsing JSON: ', parsingError);
      }
    }
  });
}

function fileToCommand(file) {
  return config.commandTrigger + file.split('.')[0].split('-').join(' ');
}

function regExpToCommand(command) {
  return command.toString().split('/')[1];
}

function addSoundsTo(map, fromDirectoryPath) {
  var soundFiles = fs.readdir(fromDirectoryPath, function(err, files) {
    files.forEach(function(file) {
      if(file[0] !== '.') {
        var command = fileToCommand(file);
        var commandRegExp = new RegExp(command, 'i');
        map.set(commandRegExp, ['sound', file]);
      }
    });
  });
}

function sendMessage(authorChannel, text) {
  bot.sendMessage(authorChannel, text);
}

function leaveVoiceChannel(message) {
  if(bot.voiceConnections.get('server', message.server)) {
    bot.voiceConnections.get('server', message.server).destroy();
  }
}

function playSound(authorChannel, authorVoiceChannel, command, sound) {
  bot.joinVoiceChannel(authorVoiceChannel).then(function(connection, joinError) {
    if(joinError) {
      var joinErrorMessage = 'Error joining voice channel: ';
      console.log(joinErrorMessage, joinError);
      bot.sendMessage(authorChannel, joinErrorMessage + joinError);
    }
    connection.playFile(config.soundPath + sound).then(function(intent, playError) {
      if(playError) {
        var playErrorMessage = 'Error playing sound file: ';
        console.log(playErrorMessage, playError);
        bot.sendMessage(authorChannel, playErrorMessage + playError);
      }
      intent.on('error', function(streamError) {
        var streamErrorMessage = 'Error streaming sound file: ';
        console.log(streamErrorMessage, streamError);
        bot.sendMessage(authorChannel, streamErrorMessage + streamError);
      });
      incrementSoundStats(command);
      if(config.autoLeaveVoice) {
        intent.on('end', function() {
          connection.destroy();
        });
      }
    });
  });
}

function sendPopularCommands(message) {
  var total = 0;
  var statsArray = [];
  var popularMessage = '';
  for(var key in stats) {
    if(stats.hasOwnProperty(key)) {
      statsArray.push([key, stats[key]]);
      total += stats[key];
    }
  }
  statsArray.sort(function(a, b) {
    return b[1] - a[1];
  });
  var i = 0;
  while(i < statsArray.length && i < 5) {
    popularMessage += statsArray[i][0] + ' — ' + Math.round((statsArray[i][1] / total) * 100) + '%\n';
    i++;
  }
  bot.sendMessage(message.channel, popularMessage);
}

function playRandomSound(message) {
  var keys = [...commands.keys()];
  var randomKey;
  var randomValue = ['', ''];
  while(randomValue[0] !== 'sound') {
    randomKey = keys[Math.round(keys.length * Math.random())];
    randomValue = commands.get(randomKey);
  }
  playSound(message.channel, message.author.voiceChannel, regExpToCommand(randomKey), randomValue[1]);
}

function displayCommands(message) {
  var helpMessage = '';

  if(message.content.split(' ')[2]) {
    var helpFilter = new RegExp(message.content.split(' ')[2], 'i');
    commands.forEach(function(fileName, command){
      if(command.toString().match(helpFilter)) {
        helpMessage += regExpToCommand(command) + '\n';
      }
    });
  } else {
    commands.forEach(function(fileName, command){
      helpMessage += regExpToCommand(command) + '\n';
    });
  }
  bot.sendMessage(message.channel, helpMessage);
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
          playSound(message.channel, message.author.voiceChannel, regExpToCommand(regexp), botReply[1]);
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

  loadStatsFile();
})();
