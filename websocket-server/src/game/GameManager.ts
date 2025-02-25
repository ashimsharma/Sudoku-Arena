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
}

export const gameManager = new GameManager();