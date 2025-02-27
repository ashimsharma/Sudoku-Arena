"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const messages_1 = require("./messages/messages");
const Game_1 = require("./game/Game");
const GameManager_1 = require("./game/GameManager");
const http_1 = require("http");
require("dotenv/config");
const auth_1 = require("./auth/auth");
const connections_1 = require("./store/connections");
// Initialize WebSocket Server first
const wss = new ws_1.WebSocketServer({ noServer: true });
// Initialize HTTP Server
const server = (0, http_1.createServer)();
// Handle the upgrade event to handle WebSocket connection requests
server.on('upgrade', (request, socket, head) => __awaiter(void 0, void 0, void 0, function* () {
    const authResult = yield (0, auth_1.authenticate)(request);
    if (!authResult.authenticated) {
        socket.write(`HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\n${authResult.message}`);
        socket.destroy();
        return;
    }
    // Associate the authenticated user ID with the WebSocket connection
    wss.handleUpgrade(request, socket, head, (connection) => {
        connections_1.connectionUserIds.set(connection, authResult === null || authResult === void 0 ? void 0 : authResult.id);
        // Emit the connection event on the WebSocket server
        wss.emit('connection', connection, request);
    });
}));
// WebSocket server logic
wss.on("connection", function connection(ws, req) {
    console.log("Connection Started.");
    // Send a message when a connection is established
    ws.send(JSON.stringify({
        message: "Connection Initiated.",
    }));
    // Handle incoming messages from WebSocket clients
    ws.on("message", (data) => {
        try {
            const obj = JSON.parse(data);
            const { type, params } = obj;
            console.log(obj);
            switch (type) {
                case messages_1.CREATE_ROOM:
                    console.log("Hey");
                    const createdGame = new Game_1.Game(ws, params);
                    GameManager_1.gameManager.add(createdGame); // Add the created game to the game manager
                    break;
                case messages_1.JOIN_ROOM:
                    const foundGame = GameManager_1.gameManager.findGame(params.gameId); // Find the game by ID
                    if (foundGame) {
                        foundGame.joinGame(ws); // Add the player to the game
                    }
                    else {
                        // Handle game not found
                        ws.send(JSON.stringify({ message: "Game not found!" }));
                    }
                    break;
                default:
                    // Handle other message types if necessary
                    break;
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ message: "Error processing message" }));
        }
    });
});
// Log when WebSocket server is listening
wss.on("listening", () => {
    console.log("WebSocket server listening");
});
// Start the HTTP server on the configured port
server.listen(process.env.PORT, () => {
    console.log('Server started on port', process.env.PORT);
});
