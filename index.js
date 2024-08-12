const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { PlayerInfo } = require('./module.js');
const { token } = require('./config.json');
const game = require('./commands/utility/game');
const wait = require('node:timers/promises').setTimeout;

global.player1 = new PlayerInfo();
global.player2 = new PlayerInfo();
global.gameRoom = null;
global.turn = new PlayerInfo();
global.isPlaying = false;

const client = new Client({ intents: [
	GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

function comparisonNumbers(original, input){
	let result = [``, ``, ``, ``, ``];
	console.debug(`original : ${original}, input : ${input}`);
	//볼 계산
	for(i = 0; i < 5; i++){
		if(original.find(a => a == input[i]) !== undefined) result[i] = `B`;
	}
	//스트라이크 계산
	for(i = 0; i < 5; i++){
		if(original[i] == input[i]) result[i] = 'S';
	}
	
	const resultBall = result.filter((c) => c == `B`);
	const resultStrike = result.filter((c) => c == `S`);

	const str = `${resultBall.length}볼 ${resultStrike.length}스트라이크`;

	return str;
}

client.on('messageCreate', async msg => {
	let inputNumberArr = [];
	let inputNumberSet = new Set();
	if (msg.author.bot || turn.id != msg.author.id || !isPlaying) return;
	if (!isNaN(msg.content)){
		inputNumberArr = msg.content.split(``);
		inputNumberSet = new Set(inputNumberArr);
		if(inputNumberArr.length != 5){
			msg.channel.send("5자리의 숫자를 입력해주세요.");
		}else if(inputNumberSet.size != 5){
			msg.channel.send("중복된 숫자가 있습니다.");
		}else if(turn == player1){
			const result = comparisonNumbers(player2.numbers, inputNumberArr);
			msg.channel.send(`${result}`);
			player1.addHistory(`${inputNumberArr}이 입력됨.\n결과 : ${result}\n`);
			if(result.includes(`5스트라이크`)){
				isPlaying = false;
				msg.channel.send(`${player1.mention()}이 승리하였습니다!\n플레이어 1 : ${player1.numbers}\n플레이어 2 : ${player2.numbers}`);
				msg.channel.send(`곧 채널이 삭제됩니다.`);
				await wait(10_000);
				gameRoom.delete();
				return;
			}
			turn = player2;
			msg.channel.send(`입력완료! ${turn.mention()}님의 턴입니다.`);
		}else if(turn == player2){
			const result = comparisonNumbers(player1.numbers, inputNumberArr);
			msg.channel.send(`${result}`);
			player2.addHistory(`${inputNumberArr}이 입력됨.\n결과 : ${result}`);
			if(result.includes(`5스트라이크`)){
				isPlaying = false;
				msg.channel.send(`${player2.mention()}이 승리하였습니다!\n플레이어 1 : ${player1.numbers}\n플레이어 2 : ${player2.numbers}`);
				msg.channel.send(`곧 채널이 삭제됩니다.`);
				await wait(10_000);
				gameRoom.delete();
				return;
			}
			turn = player1;
			msg.channel.send(`입력완료! ${turn.mention()}님의 턴입니다.`);
		}
	}
})

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);