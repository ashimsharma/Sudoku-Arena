"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = void 0;
class GameManager {
    constructor() {
        this.games = [];
    }
    add(game) {
        this.games.push(game);
    }
    remove(gameId) {
        this.games = this.games.filter(game => game.gameId === gameId);
    }
    findGame(gameId) {
        const game = this.games.filter(game => game.gameId === gameId)[0];
        return game;
    }
}
exports.gameManager = new GameManager();
