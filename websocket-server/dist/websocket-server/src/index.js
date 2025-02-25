"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = void 0;
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
exports.userSocketMap = new Map();
wss.on("connection", function connection(ws, req) {
    ws.send(JSON.stringify({
        message: "Connection Instantiated.",
    }));
    // ws.on("message", (data: string) => {
    //   const obj = JSON.parse(data);
    //   const type = obj.type;
    //   const params = obj.params;
    //   switch (type) {
    //     case CREATE_ROOM:
    //       const game = new Game(ws, params);
    //       gameManager.add(game);
    //   }
    // });
});
wss.on('listening', () => {
    console.log("Server Listening");
});
