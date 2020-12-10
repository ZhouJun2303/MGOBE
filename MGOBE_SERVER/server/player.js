const random = require("string-random");
module.exports = class player {
    constructor(data) {
        this._data = data;
        this.ws = data.ws;
        this.room = data.room;
        this._playerID = random(8, {
            letters: false
        });
        this._playerData = {
            id: this._playerID,
            name: "",
            head: "",
            customProfile: "1",
        }
        this._initWslisten();
    }

    get playerInfo() {
        return this._playerData;
    }

    get playerID() {
        return this._playerID;
    }

    _initWslisten() {
        let self = this;
        this.sendMsg({
            code: 101,
            data: this._playerData
        })
        this.ws.on("message", function (packet) {
            let msg = JSON.parse(packet);
            if (msg.code == 1001) {
                self.room.startFrameSync();
            }
            if (msg.code == 1002) {
                self.room.stopFrameSync();
            }
            if (msg.code == 1003) {
                self.room.pushPlayerMsg(msg);
            }
            if (msg.code == 2001) {
                self._playerData.customProfile = msg.data.playerInfo.customProfile;
                self._playerData.name = msg.data.playerInfo.name;
                self._playerData.head = msg.data.playerInfo.head;
                self._playerData.customPlayerStatus = 1;
                self.room.roomInfo.customProperties = msg.data.customProperties;
                self.sendMsg({
                    code: 101,
                    data: self._playerData
                })
                self.room.boardCastRoomInfo();

            }
            if (msg.code == 2002) {
                self._playerData.customProfile = msg.data.playerInfo.customProfile;
                self._playerData.name = msg.data.playerInfo.name;
                self._playerData.head = msg.data.playerInfo.head;
                self._playerData.customPlayerStatus = 1;
                self._playerData.customProperties = msg.data.customProperties;
                self.sendMsg({
                    code: 101,
                    data: self._playerData
                })
                self.room.boardCastRoomInfo();
            }
        });

        this.ws.on("close", function (msg) {
            console.log(msg + "玩家关闭了连接");
            self.room.deletePlayer(self);
            self.room.boardCastRoomInfo();
            delete(this);

        });

        this.ws.on("ping", function (msg) {
            console.log("ping", msg);
        });

        this.ws.on("error", function (msg) {
            console.log("error", msg);
        })
    }

    sendMsg(msg) {
        this.ws.send(JSON.stringify(msg))
    }

}