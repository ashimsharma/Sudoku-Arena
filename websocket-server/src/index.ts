import { WebSocketServer } from "ws";
import { CREATE_ROOM } from "./messages/messages";
import { Game } from "./game/Game";
import { gameManager } from "./game/GameManager";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({ port: 3000 });
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

function getCookie(cookies: string, name: string) {
  const match = cookies.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
