room = function (data) {
    this._roomUID = data.roomUID;
    this._roomIndex = data.roomIndex;
    //房间内玩家类表
    this.playerList = [];
    this.roomInfo = {
        playerList: [],
        roomUID: this._roomUID
    };
    this.msgPool = [];
    this._start = false;
    this.init = function () {
        this.playerList = [];
        this.msgPool = [];
        this._start = false;
        this.roomInfo = {
            playerList: [],
            roomUID: this._roomUID
        };
    }
    this.boardCastInRoom = function (msg) {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].sendMsg(msg)
        };
    }.bind(this);
}
//房间下标
room.prototype.roomIndex = function () {
    return this._roomIndex;
};
//房间UID
room.prototype.roomUID = function () {
    return this._roomUID;
};
//添加玩家
room.prototype.addPlayer = function (ws) {
    if (this.playerList.length == 0) {
        this.roomInfo.owner = ws.playerID;
    }
    this.playerList.push(ws);
    // console.log(this.playerList)
};
//删除玩家
room.prototype.deletePlayer = function (ws) {
    this.playerList.splice(this.playerList.indexOf(ws), 1);
    if (this.playerList == 0) {
        this.stopFrameSync();
        return
    }
    this._start = false;
    this.roomInfo.owner = this.playerList[0].playerID;
};
//获取玩家数量 
room.prototype.playerLenght = function (ws) {
    return this.playerList.length;
};
//开始帧
room.prototype.startFrameSync = function (msg) {
    if (this._start) {
        return;
    }
    this.boardCastInRoom({
        code: 1001,
        data: {}
    });
    this._start = true;
};
//暂停帧
room.prototype.stopFrameSync = function (msg) {
    this._start = false;
    this.boardCastInRoom({
        code: 1001,
        data: {}
    });
};
//push玩家信息
room.prototype.pushPlayerMsg = function (msg) {
    this.msgPool.push(msg.data);
};
//返回房间信息
room.prototype.boardCastRoomInfo = function (msg) {
    this.roomInfo.playerList = [];
    for (let i = 0; i < this.playerList.length; i++) {
        this.roomInfo.playerList.push(this.playerList[i].playerInfo);
    }
    this.boardCastInRoom({
        code: 2003,
        data: {
            roomInfo: this.roomInfo
        }
    });

};
//boardCast  由roomManage驱动
room.prototype.boardCast = function (msg) {
    if (!this._start) {
        return;
    }
    this.boardCastInRoom({
        data: {
            frame: {
                id: 0,
                items: this.msgPool,
                roomId: "10001",

            }
        },
        seq: "***个***",
        code: 1003
    });
    this.msgPool = [];
};
module.exports = room;