import { WebSocket } from "ws";
import { prisma, GameStatus } from "../db/index";
import { connectionUserIds } from "../store/connections";
import { getSudoku } from "sudoku-gen";
import {
	BOTH_USERS_GAME_INITIATED,
	GAME_INITIATE_FAILED,
	GAME_INITIATED,
	OPPONENT_JOINED,
	ROOM_CREATE_FAILED,
	ROOM_CREATED,
	ROOM_JOIN_FAILED,
	ROOM_JOINED,
	WRONG_CELL,
	YOUR_MISTAKES_COMPLETE,
	OPPONENT_MISTAKES_COMPLETE,
	OPPONENT_MISTAKE,
	CORRECT_CELL,
	OPPONENT_CORRECT_CELL,
	BOARD_COMPELTE,
	OPPONENT_BOARD_COMPELTE
} from "../messages/messages";

type Options = {
	difficulty: Difficulty;
	gameType: GameTypes;
};

type Difficulty = "easy" | "medium" | "hard" | "expert";

enum GameTypes {
	timeBased = "timeBased",
	completionBased = "completionBased",
}

type CurrentGameStateData = {
	digit: number | null;
	isOnCorrectPosition: boolean;
	canBeTyped: boolean;
}

export class Game {
	public gameId?: string;
	private creator: {
		id: string;
		name: string;
		avatarUrl: string;
		type: string;
		socket: WebSocket;
		gameStarted: boolean;
		currentGameState: (CurrentGameStateData)[];
		mistakes: number;
		correctAdditions: 0;
		percentageComplete: number;
	};
	private joiner?: {
		id: string;
		name: string;
		avatarUrl: string;
		type: string;
		socket: WebSocket;
		gameStarted: boolean;
		currentGameState: (CurrentGameStateData)[];
		mistakes: number;
		correctAdditions: number;
		percentageComplete: number;
	};
	private options: Options;
	private initialGameState: (CurrentGameStateData)[] = [];
	private solution: number[] = [];
	private gameStarted: boolean = false;
	private emptyCells: number = 0;
	private readonly totalAllowedMistakes: number = 5;

	constructor(creatingPlayer: WebSocket, params: any) {
		this.creator = {
			id: connectionUserIds.get(creatingPlayer),
			name: "",
			avatarUrl: "",
			type: "creator",
			socket: creatingPlayer,
			gameStarted: false,
			currentGameState: [],
			correctAdditions: 0,
			mistakes: 0,
			percentageComplete: 0,
		};

		this.getCreator(connectionUserIds.get(creatingPlayer));

		// Delete it from the global map after creating the game user.
		connectionUserIds.delete(creatingPlayer);

		this.options = params;
		this.createGameInDB();
	}

	async getCreator(id: string) {
		const creatorUser = await prisma.user.findFirst({
			where: {
				id,
			},
		});

		this.creator.name = creatorUser?.name as string;
		this.creator.avatarUrl = creatorUser?.avatarUrl as string;
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
				JSON.stringify({ type: ROOM_CREATED, roomId: createdGame.id })
			);
		} catch (error) {
			this.creator.socket.send(
				JSON.stringify({ type: ROOM_CREATE_FAILED })
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

			this.creator?.socket.send(
				JSON.stringify({
					type: OPPONENT_JOINED,
					data: {
						joinerName: this.joiner?.name,
						avatarUrl: this.joiner?.avatarUrl,
					},
				})
			);

			this.joiner?.socket.send(
				JSON.stringify({
					type: ROOM_JOINED,
					data: {
						roomId: this.gameId,
						creatorName: this.creator?.name,
						avatarUrl: this.creator?.avatarUrl,
					},
				})
			);
		} catch (error) {
			this.joiner?.socket.send(
				JSON.stringify({ type: ROOM_JOIN_FAILED })
			);
		}
	}

	async joinGame(joiningPlayer: WebSocket) {
		if (connectionUserIds.get(joiningPlayer) === this.creator.id) {
			joiningPlayer.send(JSON.stringify({ type: ROOM_JOIN_FAILED }));
			return;
		}

		const joinerUser = await prisma.user.findFirst({
			where: {
				id: connectionUserIds.get(joiningPlayer),
			},
		});

		this.joiner = {
			id: connectionUserIds.get(joiningPlayer),
			name: joinerUser?.name as string,
			avatarUrl: joinerUser?.avatarUrl as string,
			type: "joiner",
			socket: joiningPlayer,
			gameStarted: false,
			currentGameState: [],
			mistakes: 0,
			percentageComplete: 0,
			correctAdditions: 0,
		};

		connectionUserIds.delete(joiningPlayer);

		this.addJoiningPlayerToDB();
	}

	isInteger(str: string) {
		const num = parseInt(str, 10);
		return Number.isInteger(num) && num.toString() === str;
	}

	initGame(gameId: string, socket: WebSocket) {
		if (this.initialGameState.length === 0) {
			const sudoku = getSudoku(this.options.difficulty);
			this.initialGameState = sudoku.puzzle.split("").map((data) => {
				if (this.isInteger(data)) {
					return {
						digit: parseInt(data),
						isOnCorrectPosition: true,
						canBeTyped: false
					};
				}
				this.emptyCells += 1;
				return {
					digit: null,
					isOnCorrectPosition: true,
					canBeTyped: true
				};
			});
			this.solution = sudoku.solution
				.split("")
				.map((data) => parseInt(data));
		}

		if (this.creator.socket === socket) {
			this.creator.currentGameState = this.initialGameState.map(cell => ({...cell}));
			const gameCreated = this.initGameInDB(gameId, this.creator.id);
			if (!gameCreated) {
				socket.send(JSON.stringify({ type: GAME_INITIATE_FAILED }));
				return;
			}

			socket.send(
				JSON.stringify({
					type: GAME_INITIATED,
				})
			);

			this.creator.gameStarted = true;

			this.creator?.gameStarted &&
				this.joiner?.gameStarted &&
				(this.gameStarted = true);
		} else {
			this.joiner !== undefined &&
				(this.joiner.currentGameState = this.initialGameState.map(cell => ({...cell})));

			const gameCreated = this.initGameInDB(
				gameId,
				this.joiner?.id as string
			);
			if (!gameCreated) {
				socket.send(JSON.stringify({ type: GAME_INITIATE_FAILED }));
				return;
			}

			this.joiner && (this.joiner.gameStarted = true);
			this.creator?.gameStarted &&
				this.joiner?.gameStarted &&
				(this.gameStarted = true);

			if (!this.gameStarted) {
				socket.send(
					JSON.stringify({
						type: GAME_INITIATED,
					})
				);
			}
		}

		if (this.gameStarted) {
			this.creator?.socket.send(
				JSON.stringify({
					type: BOTH_USERS_GAME_INITIATED,
					data: {
						initialGameState: this.initialGameState,
						currentGameState: this.creator.currentGameState,
					},
				})
			);
			this.joiner?.socket.send(
				JSON.stringify({
					type: BOTH_USERS_GAME_INITIATED,
					data: {
						initialGameState: this.initialGameState,
						currentGameState: this.joiner?.currentGameState,
					},
				})
			);
		}
	}

	async initGameInDB(gameId: string, userId: string) {
		try {
			const user =
				userId === this.creator.id ? this.creator : this.joiner;

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
						solution: this.solution,
						currentGameState: user?.currentGameState,
						mistakes: user?.mistakes,
						percentageComplete: user?.percentageComplete,
					},
				},
			});

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async verifyValue(
		ws: WebSocket,
		userId: string,
		value: number,
		index: number
	) {
		try {
			if (this.initialGameState[index].digit !== null) {
				return;
			}

			const user =
				userId === this.creator.id ? this.creator : this.joiner;

			user !== undefined && (user.currentGameState[index].digit = value);

			if (this.solution[index] !== value) {
				user !== undefined && (user.mistakes += 1);
				user !== undefined && (user.currentGameState[index].isOnCorrectPosition = false);
				if (user?.mistakes === this.totalAllowedMistakes) {
					user.socket.send(
						JSON.stringify({
							type: YOUR_MISTAKES_COMPLETE,
							currentGameState: user?.currentGameState
						})
					);
				} else {
					user?.socket.send(
						JSON.stringify({
							type: WRONG_CELL,
							currentGameState: user?.currentGameState
						})
					);
				}

				if (user?.type === "creator" && user?.mistakes === this.totalAllowedMistakes) {
					this.joiner?.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKES_COMPLETE,
						})
					);
				} else if (user?.type === "joiner" && user?.mistakes === this.totalAllowedMistakes) {
					this.creator.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKES_COMPLETE,
						})
					);
				} else if (user?.type === "creator" && user?.mistakes < this.totalAllowedMistakes) {
					this.joiner?.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKE,
						})
					);
				} else if (user?.type === "joiner" && user?.mistakes < this.totalAllowedMistakes) {
					this.creator.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKE,
						})
					);
				}
				return;
			}

			user !== undefined && (user.correctAdditions += 1);

			user !== undefined && (user.currentGameState[index].canBeTyped = false);

			let correctAdditions =
				user !== undefined ? user?.correctAdditions : null;

			let percentageComplete =
				Math.round(((correctAdditions as number) / this.emptyCells) * 100);

			
			user !== undefined &&
				(user.percentageComplete = percentageComplete);

			const isComplete = this.checkIfBoardComplete(user);

			if (isComplete) {
				user?.socket.send(
					JSON.stringify({
						type: BOARD_COMPELTE,
						percentageComplete,
						currentGameState: user?.currentGameState,
					})
				);

				if (user?.type === "creator") {
					this.joiner?.socket.send(
						JSON.stringify({
							type: OPPONENT_BOARD_COMPELTE,
							percentageComplete,
						})
					);
				} else {
					this.creator.socket.send(
						JSON.stringify({
							type: OPPONENT_BOARD_COMPELTE,
							percentageComplete,
						})
					);
				}

				return;
			}

			user?.socket.send(
				JSON.stringify({
					type: CORRECT_CELL,
					percentageComplete,
					currentGameState: user?.currentGameState,
				})
			);

			if (user?.type === "creator") {
				this.joiner?.socket.send(
					JSON.stringify({
						type: OPPONENT_CORRECT_CELL,
						percentageComplete,
					})
				);
			} else {
				this.creator.socket.send(
					JSON.stringify({
						type: OPPONENT_CORRECT_CELL,
						percentageComplete,
					})
				);
			}
		} catch (error) {
			console.log(error);
		}
	}

	checkIfBoardComplete(user: any) {
		if (
			JSON.stringify(user?.currentGameState) ===
			JSON.stringify(this.solution)
		) {
			return true;
		}

		return false;
	}
}
