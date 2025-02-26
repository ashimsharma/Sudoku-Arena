import { WebSocket } from "ws";
import prisma from "@prisma/db";
import { connectionUserIds } from "../store/connections";

type Options = {
    difficulty: Difficulty,
    gameType: GameTypes
}

enum Difficulty{
    Easy,
    Medium,
    Difficult
}

enum GameTypes{
    TimeBased,
    CompletionBased
}

export class Game{
    public gameId?: string;
    private creator: {id: string, socket: WebSocket};
    private joiner?: {id: string, socket: WebSocket};
    private options: Options;

    constructor(creatingPlayer: WebSocket, params: any){
        this.creator = {id: connectionUserIds.get(creatingPlayer), socket: creatingPlayer};

        // Delete it from the global map after creating the game user.
        connectionUserIds.delete(creatingPlayer);

        this.options = params.options;
        this.createGameInDB();
    }   

    async createGameInDB(){
        try {
            const createdGame = await prisma.game.create(
                {
                    data: {
                        options: this.options,
                    }
                }
            )

            this.gameId = createdGame.id;

            const createGamePlayer = await prisma.gamePlayer.create(
                {
                    data: {
                        gameId: createdGame.id,
                        userId: this.creator.id
                    }
                }
            )

            this.creator.socket.send(JSON.stringify({message: "Room created successfully."}))
        } catch (error) {
            this.creator.socket.send(JSON.stringify({message: "Failed to create Room."}))
        }
    }

    async addJoiningPlayerToDB(){
        try {
            await prisma.gamePlayer.create(
                {
                    data: {
                        gameId: (this.gameId as string),
                        userId: (this.joiner?.id as string)
                    }
                }
            )
        } catch (error) {
            
        }
    }

    joinGame(joiningPlayer: WebSocket){
        this.joiner = {id: connectionUserIds.get(joiningPlayer), socket: joiningPlayer};
        connectionUserIds.delete(joiningPlayer);

        this.addJoiningPlayerToDB();
    }
}