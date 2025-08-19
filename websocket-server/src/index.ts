import { WebSocketServer } from "ws";
import {
	ADD_NUMBER,
	CLEAR_CELL,
	CREATE_ROOM,
	FETCH_DATA,
	GAME_NOT_FOUND,
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
import { prisma } from "./db";

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

const findGameInDB = async (roomId: string) => {
	try {
		const game = await prisma.game.findFirst({
			where: {
				id: roomId
			}
		})

		if(!game){
			return null
		}

		return game;
	} catch (error) {
		console.log(error);
	}
}
wss.on("connection", function connection(ws, req) {
	ws.send(
		JSON.stringify({
			success: true,
			message: "Connection Initiated.",
		})
	);

	// Handle incoming messages from WebSocket clients
	ws.on("message", async (data: string) => {
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
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({ type: GAME_NOT_FOUND }));
					}
					break;
				case INIT_GAME:
					const startedGame = gameManager.findGame(params.roomId);
					if (startedGame) {
						startedGame.initGame(params.roomId, ws);
					} else {
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({ type: GAME_NOT_FOUND }));
					}
					break;
				case ADD_NUMBER:
					const numberAddedGame = gameManager.findGame(params.roomId);
					if (numberAddedGame) {
						numberAddedGame.verifyValue(
							ws,
							params.userId,
							params.value,
							params.index
						);
					}
					else {
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({type: GAME_NOT_FOUND}));
					}
					break;
				case CLEAR_CELL:
					const clearCellGame = gameManager.findGame(params.roomId);
					if(clearCellGame){
						clearCellGame.clearValue(params.userId, params.index);
					}
					else{
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({type: GAME_NOT_FOUND}))
					}
					break;
				case TIMER_ENDED:
					const timerEndedGame = gameManager.findGame(params.roomId);
					if(timerEndedGame){
						timerEndedGame.endTimer(params.userId);
					}
					else {
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({type: GAME_NOT_FOUND}));
					}
					break;
				case SEND_REACTION:
					const reactedGame = gameManager.findGame(params.roomId);
					if(reactedGame){
						reactedGame.sendReaction(params.userId, params.reactionId);
					}
					else{
						await findGameInDB(params.roomId);
						ws.send(JSON.stringify({type: GAME_NOT_FOUND}));
					}
					break;
				case FETCH_DATA:
					if (params.page === "game_room") {
						const foundGame = gameManager.findGame(params.roomId);
						if(foundGame){
							foundGame.fetchGameRoomData(ws);
						}
						else{
							await findGameInDB(params.roomId);
							ws.send(JSON.stringify({type: GAME_NOT_FOUND}));
						}
					} else if (params.page === "game_board_screen") {
						const foundGame = gameManager.findGame(params.roomId);
						if(foundGame){
							foundGame.fetchGameBoardScreenData(ws);
						}
						else {
							await findGameInDB(params.roomId);
							ws.send(JSON.stringify({type: GAME_NOT_FOUND}));
						}
					}
					break;
				default:
					break;
			}
		} catch (error) {
			console.error("Error processing message:", error);
			ws.send(JSON.stringify({ message: "Error processing message" }));
		}
	});
	ws.on("close", (ws: WebSocket) => {
		connectionUserIds.delete(ws);
	});
});

server.listen(process.env.PORT, () => {
	console.log("Server started on port", process.env.PORT);
});
