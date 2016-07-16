# discordjs-starter-bot
A sample Discord bot that send messages and plays sounds. Built using [discord.js](https://github.com/hydrabolt/discord.js).

## Mini Docs
`autoLeaveVoice` - When set to `true`, the bot will leave after playing a sound. The sound of a bot joining/leaving a voice channel can be annoying, so by setting this to false, the bot will stay in the voice channel until told to leave by the `!bot exit` command.

`autoLoadSounds` - When set to `true`, the bot will attempt to load in every file placed in the `sounds` directory. To generate the sound's command, `soundCommandTrigger` is prepended, the audio extension is stripped off, and hyphens are converted to spaces.

*For example, `nasa-smallstep.mp3` would be activated by `!nasa smallstep`.*

`commands.set(<regexp>, array[type, reply])` - `regexp` is what your bot will match messages against, regular expressions are used here mainly to make things case-insensitive. `type` can currently be `function`, `sound`, or `text`, but can be extended further if your bot requires additional functionality.

## Getting Started
1. Clone this repository
2. After completing the prerequisites, run `npm install` on this project making sure nothing fails, particularly `node-opus`
3. Open `index.js` and add your bot's `Token` where it says `APP_BOT_USER_TOKEN`
4. Authorize your bot using this URL `https://discordapp.com/oauth2/authorize?client_id=APPLICATION_ID&scope=bot&permissions=0` where APPLICATION_ID is your `Application ID` and add it to a server you manage.
5. Run `node index.js` from the project and type `liftoff` into the Discord server chat or type !smallstep while connected to a voice channel on the server.

### Prerequisites
1. Everything from the [discord.js documentation](http://discordjs.readthedocs.io/en/latest/installing.html), which generally includes
  - Your operating system's developer tools
  - Node.js
  - ffmpeg installed and on your PATH
2. Create a new [Discord application](https://discordapp.com/developers/applications/me)
  - Navigate to [your Discord applications](https://discordapp.com/developers/applications/me)
  - Create a new application and keep its `Application ID` handy
  - Create a bot user and keep its `Token` handy

## Contributing
I created this bot as a good jumping off point for what most bot makers will want their bots to do. If something about it is confusing, please submit a PR.

## Authors
- **Michael Deeb** - *Initial work* - [michaeljdeeb](https://github.com/michaeljdeeb)

See also the list of [contributors](https://github.com/michaeljdeeb/discordjs-starter-bot/graphs/contributors) who participated in this project.

## License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details

## Acknowledgments
- [Discord](https://discordapp.com/)
- [discord.js](https://github.com/hydrabolt/discord.js)
- [NASA](http://www.nasa.gov/connect/sounds/index.html) for the sample sound used by the bot.
