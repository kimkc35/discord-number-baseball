const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { PlayerInfo } = require('../../module.js');

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

let player1 = new PlayerInfo();
let player2 = new PlayerInfo();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Replies with Pong!')
		.addSubcommand(subcommand => 
			subcommand
			.setName('join')
			.setDescription('게임 참가')
			.addNumberOption(option => 
				option
				.setName('numbers')
				.setDescription('숫자 5자리')
				.setMaxValue(99999)
				.setMinValue(12345)
				.setRequired(true)
			))
		.addSubcommand(subcommand => 
			subcommand
			.setName('reset')
			.setDescription('초기화'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('list')
			.setDescription('현재 참가중인 사람 목록'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('leave')
			.setDescription('게임 떠나기'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('start')
			.setDescription('게임 시작')
		),

	async execute(interaction) {
		const number = [interaction.options.getNumber('numbers')];
		const str = String(number);
		const numbersArr = Array.from(str);
		const subcommand = interaction.options.getSubcommand();
		const playerList = `플레이어 1 : ${player1.mention()}\n플레이어 2 : ${player2.mention()}`;

		if(subcommand === "join"){
			if(player1.id == null){
				player1 = new PlayerInfo(interaction.user.id, interaction.user.username, numbersArr);
				interaction.reply({content: `플레이어 1에 참가되었습니다. 숫자 : ${player1.numbers}`, ephemeral: true});
			}else if(player2.id == null){
				if(player1.id == interaction.user.id){
					interaction.reply({content: `이미 게임에 참가중입니다.`});
				}else{
					player2 = new PlayerInfo(interaction.user.id, interaction.user.username, numbersArr);
					interaction.reply({content: `플레이어 2에 참가되었습니다. 숫자 : ${player2.numbers}`, ephemeral: true});
				}
			}else{
				interaction.reply({content: `게임이 다 찼습니다. ${playerList}`});
			}
		}else if(subcommand === 'reset'){
			player1 = new PlayerInfo();
			player2 = new PlayerInfo();
			interaction.reply({content: "초기화 되었습니다."});
		}else if(subcommand === 'list'){
			interaction.reply({content: playerList});
		}else if(subcommand === 'leave'){
			if(player1.id == interaction.user.id){
				player1 = new PlayerInfo();
				interaction.reply({content: `게임을 떠났습니다.\n${playerList}`});
			}else if(player2.id == interaction.user.id){
				player2 = new PlayerInfo();
				interaction.reply({content: `게임을 떠났습니다.\n${playerList}`});
			}else{
				interaction.reply({content: `현재 게임에 참가하지 않았습니다.`});
			}
		}else if(subcommand === 'start'){
			if(player1.id == null || player2.id == null){
				interaction.guild.channels.create({
					name: '1',
					type: ChannelType.GuildText
				})
				interaction.reply({content: `플레이어가 모두 참가하지 않았습니다.\n${playerList}`});
			}else{
				interaction.reply({content: `게임 시작!`});
				interaction.guild.channels.create({
					name: '1',
					type: ChannelType.GuildText
				})
			}
		}

	},
};