class PlayerInfo{
	histories = new Array;
	
	constructor(id, userName, numbers){
		this.id = id;
		this.userName = userName;
		this.numbers = numbers;
	}

    mention(){
		var mentionStr = `없음`;
		if(this.id != null) mentionStr = `<@${this.id}>`;
		return mentionStr;
	}

	reset(){
		this.id = null;
		this.userName = null;
		this.numbers = null;
	}

	addHistory(str){
		this.histories.push(str);
	}

	historyOutput(){
		let str = '';
		for(i = 0; i < this.histories.length; i++){
			str += `---------------\n${this.histories[i]}\n`;
		}
		str += `---------------`;

		return str;
	}
};

module.exports = {
	PlayerInfo
};