//  npm i string-random 随机字符串npm包
//  use :https://github.com/maichong/string-random
const random = require("string-random");
const newroom = require("./room");
module.exports = class roomMannager {
    constructor() {
        this._dt = 60;
        // this._dt = 60; //design
        this._roomIndex = 0;
        this._maxRoomCount = 500;
        this._freeRoom = []; //空房间
        this._workRoom = []; //正在使用的房间
        this._initInterval();
    }

    _initInterval() {
        let self = this;
        setInterval(() => {
            this._workRoom.forEach((e) => {
                e.boardCast();
            })
        }, self._dt);
    }

    //获取一个房间
    get room() {
        let room;
        for (let i = 0; i < this._workRoom.length; i++) {
            if (this._workRoom[i].playerList.length < 2) {
                return this._workRoom[i];
            }
        }
        room = this._freeRoom.shift();
        if (!room) {
            //最大承载，重新开启端口或连接至新服务器
            if (this._roomIndex >= this._maxRoomCount) {
                return null;
            }
            this._roomIndex = this._roomIndex + 1;
            let roomData = {};
            roomData.roomUID = random(16, {
                letters: 'ABCDEFG'
            });
            roomData.roomIndex = this._roomIndex;
            room = new newroom(roomData);
        }
        //初始化
        room.init();
        this._workRoom.push(room);
        return room;
    }

    //回收
    recovery(room) {
        for (let i = 0; i < this._workRoom.length; i++) {
            if (room.roomIndex == this._workRoom[i].roomIndex) {
                //UID
                if (room.roomUID == this._workRoom[i].roomUID) {
                    this._workRoom.splice(i, 1);
                    this._freeRoom.push(room);
                    return;
                }
            }
        }
    }


}