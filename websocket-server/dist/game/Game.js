"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const index_1 = __importDefault(require("../db/index"));
const connections_1 = require("../store/connections");
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
        this.creator = { id: connections_1.connectionUserIds.get(creatingPlayer), socket: creatingPlayer };
        // Delete it from the global map after creating the game user.
        connections_1.connectionUserIds.delete(creatingPlayer);
        this.options = params.options;
        this.createGameInDB();
    }
    createGameInDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createdGame = yield index_1.default.game.create({
                    data: {
                        options: this.options,
                    }
                });
                this.gameId = createdGame.id;
                const createGamePlayer = yield index_1.default.gamePlayer.create({
                    data: {
                        gameId: createdGame.id,
                        userId: this.creator.id
                    }
                });
                this.creator.socket.send(JSON.stringify({ message: "Room created successfully." }));
            }
            catch (error) {
                this.creator.socket.send(JSON.stringify({ message: "Failed to create Room." }));
            }
        });
    }
    addJoiningPlayerToDB() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                yield index_1.default.gamePlayer.create({
                    data: {
                        gameId: this.gameId,
                        userId: (_a = this.joiner) === null || _a === void 0 ? void 0 : _a.id
                    }
                });
                (_b = this.joiner) === null || _b === void 0 ? void 0 : _b.socket.send(JSON.stringify({ message: "Room joined successfully." }));
            }
            catch (error) {
                (_c = this.joiner) === null || _c === void 0 ? void 0 : _c.socket.send(JSON.stringify({ message: "Failed to join Room." }));
            }
        });
    }
    joinGame(joiningPlayer) {
        this.joiner = { id: connections_1.connectionUserIds.get(joiningPlayer), socket: joiningPlayer };
        connections_1.connectionUserIds.delete(joiningPlayer);
        this.addJoiningPlayerToDB();
    }
}
exports.Game = Game;
