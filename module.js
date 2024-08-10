class PlayerInfo{
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
};

module.exports = {
	PlayerInfo
};