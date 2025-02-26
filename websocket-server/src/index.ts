import { WebSocketServer } from "ws";
import { CREATE_ROOM, JOIN_ROOM } from "./messages/messages";
import { Game } from "./game/Game";
import { gameManager } from "./game/GameManager";
import { createServer } from "http";
import "dotenv/config";
import { authenticate } from "./auth/auth";
import { connectionUserIds } from "./store/connections";

const server = createServer();


server.on('upgrade', async (request, socket, head) => {
  const authResult = await authenticate(request)

  if (!authResult.authenticated) {
      socket.write(`HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\n${authResult.message}`)
      socket.destroy()
      return;
  }

  wss.handleUpgrade(request, socket, head, (connection) => {
      connectionUserIds.set(connection, authResult?.id);

      wss.emit('connection', connection, request);
  })
})

const wss = new WebSocketServer({ port: parseInt(process.env.PORT as string) || 8080, noServer: true });

export const userSocketMap = new Map();

wss.on("connection", function connection(ws, req) {
  console.log(req.headers.cookie);

  ws.send(
    JSON.stringify({
      message: "Connection Initiated.",
    })
  );

  ws.on("message", (data: string) => {
    const obj = JSON.parse(data);
    const type = obj.type;
    const params = obj.params;

    switch (type) {
      case CREATE_ROOM:
        const createdGame = new Game(ws, params);
        gameManager.add(createdGame);
        break;
      case JOIN_ROOM:
        const foundGame = gameManager.findGame(params.gameId);
        foundGame.joinGame(ws);
    }
  });
});

wss.on("listening", () => {
  console.log("Server Listening");
});

server.listen(process.env.PORT, () => console.log('Server Started.'));