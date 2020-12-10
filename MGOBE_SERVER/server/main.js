"use strict";
global.ml = global.ml || {};
var WebSocketServer = require("ws").Server;
const config = require("./config/config");
const roomManger = require("./roomManager");
const player = require("./player");
const pvp = new WebSocketServer({
    port: config.config.port
});
pvp.on("listening", function () {
    ml.roomManger = new roomManger();
    console.log("listening   " + config.config.port);
});
pvp.on("connection", function connection(ws, req) {
    console.log("有刺客——————>" + req.connection.remoteAddress);
    let room = ml.roomManger.room;
    //TODO 最大承载 new 端口
    if (!room) {
        ws.close();
        return
    }
    //TODO _player对象池
    let _player = new player({
        ws: ws,
        room: room
    });
    room.addPlayer(_player);
});