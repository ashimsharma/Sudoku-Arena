import { WebSocketServer } from "ws";
import { CREATE_ROOM } from "./messages/messages";
import { Game } from "./game/Game";
import { gameManager } from "./game/GameManager";

const wss = new WebSocketServer({ port: 8080 });

export const userSocketMap = new Map();

wss.on("connection", function connection(ws, req) {
  ws.send(
    JSON.stringify({
      message: "Connection Instantiated.",
    })
  );

  ws.on("message", (data: string) => {
    const obj = JSON.parse(data);
    const type = obj.type;
    const params = obj.params;

    switch (type) {
      case CREATE_ROOM:
        const game = new Game(ws, params);
        gameManager.add(game);
    }
  });
});

wss.on('listening', () => {
  console.log("Server Listening");
})