import { WebSocket } from "ws";
import uuid from "uuid";
import prisma from "@prisma/db";

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
    public player1: WebSocket;
    public player2?: WebSocket;
    private options: Options;

    constructor(creatingPlayer: WebSocket, params: any){
        this.player1 = creatingPlayer;
        this.options = params.options;
    }   
}