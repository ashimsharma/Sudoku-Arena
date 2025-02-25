"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["Easy"] = 0] = "Easy";
    Difficulty[Difficulty["Medium"] = 1] = "Medium";
    Difficulty[Difficulty["Difficult"] = 2] = "Difficult";
})(Difficulty || (Difficulty = {}));
var GameTypes;
(function (GameTypes) {
    GameTypes[GameTypes["TimeBased"] = 0] = "TimeBased";
    GameTypes[GameTypes["CompletionBased"] = 1] = "CompletionBased";
})(GameTypes || (GameTypes = {}));
class Game {
    constructor(creatingPlayer, params) {
        this.player1 = creatingPlayer;
        this.options = params.options;
        console.log("I ran");
    }
}
exports.Game = Game;
