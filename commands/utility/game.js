const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { PlayerInfo } = require('../../module.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('숫자 야구 게임하기!')
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
		)		
		.addSubcommand(subcommand =>
			subcommand
			.setName('end')
			.setDescription('게임 종료')
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('history')
			.setDescription(`경기 기록 보기`)
		),

	async execute(interaction) {
		const number = [interaction.options.getNumber('numbers')];
		const str = String(number);
		const numberArr = Array.from(str);
		const numberSet = new Set(numberArr);
		const subcommand = interaction.options.getSubcommand();
		let playerList = `플레이어 1 : ${player1.mention()}\n플레이어 2 : ${player2.mention()}`;

		if(subcommand === "join"){
			if(numberSet.size != 5){
				interaction.reply({content: `중복된 숫자가 있습니다. 다시 참가해주세요.`});
			}else{			
				if(player1.id == null){
					player1 = new PlayerInfo(interaction.user.id, interaction.user.username, numberArr);
					interaction.reply({content: `플레이어 1에 참가되었습니다. 숫자 : ${player1.numbers}`, ephemeral: true});
				}else if(player2.id == null){
					if(player1.id == interaction.user.id){
						interaction.reply({content: `이미 게임에 참가중입니다.`});
					}else{
						player2 = new PlayerInfo(interaction.user.id, interaction.user.username, numberArr);
						interaction.reply({content: `플레이어 2에 참가되었습니다. 숫자 : ${player2.numbers}`, ephemeral: true});
					}
				}else{
					interaction.reply({content: `게임이 다 찼습니다. ${playerList}`});
				}
			}
		}else if(subcommand === 'reset'){
			player1.reset();
			player2.reset();
			interaction.reply({content: "초기화 되었습니다."});
		}else if(subcommand === 'list'){
			interaction.reply({content: playerList});
		}else if(subcommand === 'leave'){
			if(player1.id == interaction.user.id){
				player1.reset();
				playerList = `플레이어 1 : ${player1.mention()}\n플레이어 2 : ${player2.mention()}`;
				interaction.reply({content: `게임을 떠났습니다.\n${playerList}`});
			}else if(player2.id == interaction.user.id){
				player2.reset();
				playerList = `플레이어 1 : ${player1.mention()}\n플레이어 2 : ${player2.mention()}`;
				interaction.reply({content: `게임을 떠났습니다.\n${playerList}`});
			}else{
				interaction.reply({content: `현재 게임에 참가하지 않았습니다.`});
			}
		}else if(subcommand === 'start'){
			isPlaying = true;
			if(player1.id == null || player2.id == null){
				interaction.reply({content: `플레이어가 모두 참가하지 않았습니다.\n${playerList}`});
			}else{
				interaction.reply({content: `게임 시작!`});
				gameRoom = await interaction.guild.channels.create({
					name: '게임장',
					type: ChannelType.GuildText
				})
				gameRoom.send(`${player1.mention()}, ${player2.mention()} 게임이 시작되었습니다!`);
				gameRoom.send(`${player1.mention()}님, 먼저 숫자 5자리를 입력해주세요!`);
				turn = player1;
			}
		}else if(subcommand === 'end'){
			isPlaying = false;
			gameRoom.delete();
		}else if(subcommand === 'history'){
			if(player1.id == interaction.user.id){
				interaction.reply({content: `${player1.historyOutput()}`, ephemeral: true});
			}else if(player2.id == interaction.user.id){
				interaction.reply({content: `${player2.historyOutput()}`, ephemeral: true});
			}else{
				interaction.reply({content: `플레이어 1의 기록 : ${player1.historyOutput()}\n플레이어 2의 기록 : ${player2.historyOutput()}`, ephemeral: true});
			}
		}
	},
};