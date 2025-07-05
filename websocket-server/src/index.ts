import { WebSocketServer } from "ws";
import {
  ADD_NUMBER,
	CLEAR_CELL,
	CREATE_ROOM,
	INIT_GAME,
	JOIN_ROOM,
	NUMBER_ADDED,
	SEND_REACTION,
	TIMER_ENDED,
} from "./messages/messages";
import { Game } from "./game/Game";
import { gameManager } from "./game/GameManager";
import { createServer } from "http";
import "dotenv/config";
import { authenticate } from "./auth/auth";
import { connectionUserIds } from "./store/connections";

// Initialize WebSocket Server first
const wss = new WebSocketServer({ noServer: true });

// Initialize HTTP Server
const server = createServer();

// Handle the upgrade event to handle WebSocket connection requests
server.on("upgrade", async (request, socket, head) => {
	const authResult = await authenticate(request);

	if (!authResult.authenticated) {
		socket.write(
			`HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\n${authResult.message}`
		);
		socket.destroy();
		return;
	}

	wss.handleUpgrade(request, socket, head, (connection) => {
		connectionUserIds.set(connection, authResult?.id);

		wss.emit("connection", connection, request);
	});
});

wss.on("connection", function connection(ws, req) {
	ws.send(
		JSON.stringify({
			success: true,
			message: "Connection Initiated.",
		})
	);

	// Handle incoming messages from WebSocket clients
	ws.on("message", (data: string) => {
		try {
			const obj = JSON.parse(data);
			const { type, params } = obj;

			switch (type) {
				case CREATE_ROOM:
					const createdGame = new Game(ws, params);
					gameManager.add(createdGame);
					break;
				case JOIN_ROOM:
					const foundGame = gameManager.findGame(params.roomId); 
					if (foundGame) {
						foundGame.joinGame(ws); // Add the player to the game
					} else {
						// Handle game not found
						ws.send(JSON.stringify({ type: "Game not found!" }));
					}
					break;
				case INIT_GAME:
					const startedGame = gameManager.findGame(params.roomId);
					startedGame.initGame(params.roomId, ws);
					break;
				case ADD_NUMBER:
					const numberAddedGame = gameManager.findGame(params.roomId);
					numberAddedGame.verifyValue(
						ws,
						params.userId,
						params.value,
						params.index
					);
					break;
				case CLEAR_CELL:
					const clearCellGame = gameManager.findGame(params.roomId);
					clearCellGame.clearValue(params.userId, params.index);
					break;
				case TIMER_ENDED:
					const timerEndedGame = gameManager.findGame(params.roomId);
					timerEndedGame.endTimer(params.userId);
					break;
				case SEND_REACTION:
					const reactedGame = gameManager.findGame(params.roomId);
					reactedGame.sendReaction(params.userId, params.reactionId);
					break;
				default:
					break;
			}
		} catch (error) {
			console.error("Error processing message:", error);
			ws.send(JSON.stringify({ message: "Error processing message" }));
		}
	});
});

wss.on("close", (ws: WebSocket) => {
  connectionUserIds.delete(ws);
  console.log(connectionUserIds);
})

// Log when WebSocket server is listening
wss.on("listening", () => {
	console.log("WebSocket server listening");
});

// Start the HTTP server on the configured port
server.listen(process.env.PORT, () => {
	console.log("Server started on port", process.env.PORT);
});
