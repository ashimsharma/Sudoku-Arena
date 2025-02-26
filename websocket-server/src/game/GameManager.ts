import { Game } from "./Game";

class GameManager{
    private games: Game[];

    constructor(){
        this.games = [];
    }

    add(game: Game){
        this.games.push(game);
    }

    remove(gameId: string){
        this.games = this.games.filter(game => game.gameId === gameId);
    }

    findGame(gameId: string): Game{
        const game = this.games.filter(game => game.gameId === gameId)[0];
        return game;
    }
}

export const gameManager = new GameManager();