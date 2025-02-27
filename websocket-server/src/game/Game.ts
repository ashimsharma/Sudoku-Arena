import { WebSocket } from "ws";
import { prisma, GameStatus } from "../db/index";
import { connectionUserIds } from "../store/connections";
import { getSudoku } from "sudoku-gen";
import { Prisma } from "@prisma/client";

type Options = {
  difficulty: Difficulty;
  gameType: GameTypes;
};

type Difficulty = "easy" | "medium" | "hard" | "expert";

enum GameTypes {
  timeBased = "timeBased",
  completionBased = "completionBased",
}

export class Game {
  public gameId?: string;
  private creator: {
    id: string;
    socket: WebSocket;
    gameStarted: boolean;
    currentGameState?: (number | null)[];
  };
  private joiner?: {
    id: string;
    socket: WebSocket;
    gameStarted: boolean;
    currentGameState?: (number | null)[];
  };
  private options: Options;
  private initialGameState?: (number | null)[];
  private solution?: number[];
  private gameStarted: boolean = false;

  constructor(creatingPlayer: WebSocket, params: any) {
    this.creator = {
      id: connectionUserIds.get(creatingPlayer),
      socket: creatingPlayer,
      gameStarted: false,
    };

    // Delete it from the global map after creating the game user.
    connectionUserIds.delete(creatingPlayer);

    this.options = params.options;
    this.createGameInDB();
  }

  async createGameInDB() {
    try {
      const createdGame = await prisma.game.create({
        data: {
          options: this.options,
          status: GameStatus.ACTIVE,
        },
      });

      this.gameId = createdGame.id;

      const createGamePlayer = await prisma.gamePlayer.create({
        data: {
          gameId: createdGame.id,
          userId: this.creator.id,
        },
      });

      this.creator.socket.send(
        JSON.stringify({ message: "Room created successfully." })
      );
    } catch (error) {
      this.creator.socket.send(
        JSON.stringify({ message: "Failed to create Room." })
      );
    }
  }

  async addJoiningPlayerToDB() {
    try {
      await prisma.gamePlayer.create({
        data: {
          gameId: this.gameId as string,
          userId: this.joiner?.id as string,
        },
      });

      this.joiner?.socket.send(
        JSON.stringify({ message: "Room joined successfully." })
      );
    } catch (error) {
      this.joiner?.socket.send(
        JSON.stringify({ message: "Failed to join Room." })
      );
    }
  }

  joinGame(joiningPlayer: WebSocket) {
    if (connectionUserIds.get(joiningPlayer) === this.creator.id) {
      joiningPlayer.send(JSON.stringify("Failed to join Room."));
      return;
    }

    this.joiner = {
      id: connectionUserIds.get(joiningPlayer),
      socket: joiningPlayer,
      gameStarted: false,
    };

    connectionUserIds.delete(joiningPlayer);

    this.addJoiningPlayerToDB();
  }

  isInteger(str: string) {
    const num = parseInt(str, 10);
    return Number.isInteger(num) && num.toString() === str;
  }

  initGame(gameId: string, socket: WebSocket) {
    const sudoku = getSudoku(this.options.difficulty);
    this.initialGameState = sudoku.puzzle.split("").map((data) => {
      return this.isInteger(data) ? parseInt(data) : null;
    });

    this.solution = sudoku.solution.split("").map((data) => parseInt(data));

    if (this.creator.socket === socket) {
      this.creator.currentGameState = [...this.initialGameState];
      const gameCreated = this.initGameInDB(gameId, this.creator.id);
      if (!gameCreated) {
        socket.send(JSON.stringify({ message: "Failed to start game." }));
        return;
      }

      socket.send(
        JSON.stringify({
          messgage: "Game Started.",
        })
      );

      this.joiner?.gameStarted && (this.gameStarted = true);
    } else {
      this.joiner !== undefined &&
        (this.joiner.currentGameState = [...this.initialGameState]);

      const gameCreated = this.initGameInDB(gameId, this.joiner?.id as string);
      if (!gameCreated) {
        socket.send(JSON.stringify({ message: "Failed to start game." }));
        return;
      }

      socket.send(
        JSON.stringify({
          messgage: "Game Started",
        })
      );

      this.creator.gameStarted && (this.gameStarted = true);
    }

    if (this.gameStarted) {
      this.creator.socket.send(
        JSON.stringify({
          message: "Game Started by both Users.",
          payload: {
            initialGameState: this.initialGameState,
            currentGameState: this.creator.currentGameState,
          },
        })
      );
      this.joiner?.socket.send(
        JSON.stringify({
          message: "Game Started by both Users.",
          payload: {
            initialGameState: this.initialGameState,
            currentGameState: this.joiner?.currentGameState,
          },
        })
      );
    }
  }

  async initGameInDB(gameId: string, userId: string) {
    try {
      await prisma.gamePlayer.update({
        where: {
          userId_gameId: {
            userId: userId,
            gameId: gameId,
          },
        },
        data: {
          gameData: {
            initialGameState: this.initialGameState,
          },
        },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
