import MathUtil from "../../mlframework/util/MathUtil";
import Tools from "../../mlframework/util/Tools";

export default class SocketManagerMOGOBE {
    constructor() {

        this.configUrl = "ws://172.16.220.75:9000/";
        this._init();
        this.curRoom = {
            roomInfo: {
                owner: "",
                playerList: []
            }
        };
        this.messageList = {};
        this._player = null;
    }

    //DEBUG
    _init() {
        let ws = new WebSocket(this.configUrl);
        ws.onopen = function (params) {
            console.log('客户端连接成功')
        };
        let self = this;
        ws.onmessage = function (e) {
            // console.log('收到服务器响应', e.data);
            let msg = JSON.parse(e.data);
            if (msg.code == 101) {
                console.log("----> 角色初始化信息");
                //此处忽略不计,DEBUG
                self._player = msg.data;
                console.log(msg);
            }
            if (msg.code == 1001) {
                ML.event.emit("Socket_onStartFrameSync", msg);
            }
            if (msg.code == 1002) {
                ML.event.emit("Socket_onStopFrameSync", msg);
            }
            if (msg.code == 1003) {
                ML.event.emit("Socket_onRecvFrame", msg);
            }
            if (msg.code == 2001) {
                console.log(msg);
            }
            if (msg.code == 2002) {
                console.log(msg);
            }
            if (msg.code == 2003) {
                console.log(msg);
                self.curRoom = msg.data;
                if (self.messageList["roomData"]) {
                    self.messageList["roomData"]({
                        code: 0,
                        data: msg.data
                    });
                }
                ML.event.emit("Socket_onJoinRoom");
            }
        };
        this.ws = ws;
    }

    get player() {
        return this._player;
    }

    get isRoomOwner() {
        let roomOwner = this.curRoom.roomInfo.owner || "";
        return this._player.id == roomOwner;
    }

    initListenter(openId, callback) {
        callback({
            code: 0
        })
    }

    create1V1Room(roomName = "房间001", isPrivate, customProperties, nickname, customPlayerStatus, profile, callback) {
        this.createRoom(roomName, 2, "1V1", isPrivate, customProperties, nickname, customPlayerStatus, profile, callback);
    }
    createFriendRoom(roomName = "房间001", customProperties, nickname, customPlayerStatus, profile, callback) {
        this.create1V1Room(roomName, true, customProperties, nickname, customPlayerStatus, profile, callback);
    }
    changeCustomPlayerStatus() {

    }
    createRoom(roomName = "房间001", maxPlayers, roomType, isPrivate, customProperties, nickname, customPlayerStatus, profile, callback) {
        let playerInfo = new PlayerInfo(nickname, customPlayerStatus, profile);
        this.sendMsg({
            code: 2001,
            data: {
                customProperties: customProperties,
                playerInfo
            }
        }, event => {
            if (event.code === 0) {
                console.log("socketManager 开始帧同步成功", event);
            }
        });
        this.messageList["roomData"] = callback;
        // let index = Tools.Random(1, 4);
        // callback && callback({
        //     code: 0,
        //     data: {
        //         roomInfo: {
        //             customProperties: JSON.stringify(index),
        //         }
        //     }
        // });
    }
    joinRoom(roomId, nickname, customPlayerStatus, profile, callback) {
        let playerInfo = new PlayerInfo(nickname, customPlayerStatus, profile);
        const joinRoomPara = {
            playerInfo,
        };
        this.sendMsg({
            code: 2002,
            joinRoomPara
        }, event => {
            if (event.code === 0) {
                console.log("socketManager 开始帧同步成功", event);
            }
        });
        this.messageList["roomData"] = callback;
        // callback && callback({
        //     code: 0
        // });
    }
    leaveRoom(callback) {
        callback && callback(0);
    }
    dismissRoom(callback) {
        callback && callback(0);
    }
    //获取房间
    getMyRoom(callback) {
        callback && callback(null);
    }
    //开始帧同步，
    startFrameSync(data = {}) {
        if (!this.isRoomOwner) {
            return
        };
        this.sendMsg({
            code: 1001,
            data: {}
        }, event => {
            if (event.code === 0) {
                console.log("socketManager 开始帧同步成功", event);
            }
        });
    }
    //房主结束帧同步，传入重要数据，其他玩家对比游戏结果，即以房主为准
    stopFrameSync(data = {}) {
        if (!this.isRoomOwner) {
            return;
        }
        this.sendMsg({
            code: 1002,
            data: {}
        }, event => {
            // console.log(event)
        });
    }
    sendFrame(data) {
        data.data.playerId = this.player.id;
        data.playerId = this.player.id;
        this.sendMsg({
            code: 1003,
            data: data
        }, event => {
            // console.log(event);
        });
    }
    sendMsg(data, callback) {
        this.ws.send(JSON.stringify(data));
    }
}

export class PlayerInfo {
    constructor(name, customStatus, profile) {
        this.name = name || "player" + MathUtil.randomIntegerN2M(1, 100);
        this.customPlayerStatus = customStatus || 0;
        this.customProfile = profile || "";
    }
}