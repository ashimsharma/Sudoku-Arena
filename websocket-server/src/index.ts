import { WebSocketServer } from "ws";
import { CREATE_ROOM, JOIN_ROOM } from "./messages/messages";
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
server.on('upgrade', async (request, socket, head) => {
  const authResult = await authenticate(request);

  if (!authResult.authenticated) {
    socket.write(`HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\n${authResult.message}`);
    socket.destroy();
    return;
  }

  // Associate the authenticated user ID with the WebSocket connection
  wss.handleUpgrade(request, socket, head, (connection) => {
    connectionUserIds.set(connection, authResult?.id);

    // Emit the connection event on the WebSocket server
    wss.emit('connection', connection, request);
  });
});

// WebSocket server logic
wss.on("connection", function connection(ws, req) {
  console.log("Connection Started.");

  // Send a message when a connection is established
  ws.send(
    JSON.stringify({
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
          const foundGame = gameManager.findGame(params.gameId); // Find the game by ID
          if (foundGame) {
            foundGame.joinGame(ws); // Add the player to the game
          } else {
            // Handle game not found
            ws.send(JSON.stringify({ message: "Game not found!" }));
          }
          break;
        default:
          // Handle other message types if necessary
          break;
      }
    } catch (error) {
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
