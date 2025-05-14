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

export class Game {
	public gameId?: string;
	private creator: {
		id: string;
		name: string;
		avatarUrl: string;
		type: string;
		socket: WebSocket;
		gameStarted: boolean;
		currentGameState: (number | null)[];
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
		currentGameState: (number | null)[];
		mistakes: number;
		correctAdditions: number;
		percentageComplete: number;
	};
	private options: Options;
	private initialGameState: (number | null)[] = [];
	private solution: number[] = [];
	private gameStarted: boolean = false;
	private emptyCells: number = 0;

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
			joiningPlayer.send(JSON.stringify({ message: ROOM_JOIN_FAILED }));
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
					return parseInt(data);
				}
				this.emptyCells += 1;
				return null;
			});
			this.solution = sudoku.solution
				.split("")
				.map((data) => parseInt(data));
		}

		if (this.creator.socket === socket) {
			this.creator.currentGameState = [...this.initialGameState];
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
				(this.joiner.currentGameState = [...this.initialGameState]);

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
			if (this.initialGameState[index] !== null) {
				return;
			}

			const user =
				userId === this.creator.id ? this.creator : this.joiner;

			user !== undefined && (user.currentGameState[index] = value);

			if (this.solution[index] !== value) {
				user !== undefined && (user.mistakes += 1);
				if (user?.mistakes === 3) {
					user.socket.send(
						JSON.stringify({
							message: "You did 3 mistakes, You Lose.",
						})
					);
				} else {
					user?.socket.send(
						JSON.stringify({
							message: "Oops, its on the wrong position.",
						})
					);
				}

				if (user?.type === "creator" && user?.mistakes === 3) {
					this.joiner?.socket.send(
						JSON.stringify({
							message: "Opponent did 3 mistakes, You win",
						})
					);
				} else if (user?.type === "joiner" && user?.mistakes === 3) {
					this.creator.socket.send(
						JSON.stringify({
							message: "Opponent did 3 mistakes, You win",
						})
					);
				} else if (user?.type === "creator" && user?.mistakes < 3) {
					this.joiner?.socket.send(
						JSON.stringify({
							message: "Opponent did a mistake",
						})
					);
				} else if (user?.type === "joiner" && user?.mistakes < 3) {
					this.creator.socket.send(
						JSON.stringify({
							message: "Opponent did a mistake",
						})
					);
				}
				return;
			}

			user !== undefined && (user.correctAdditions += 1);

			let correctAdditions =
				user !== undefined ? user?.correctAdditions : null;

			let percentageComplete =
				((correctAdditions as number) / this.emptyCells) * 100;

			user !== undefined &&
				(user.percentageComplete = percentageComplete);

			const isComplete = this.checkIfBoardComplete(user);

			if (isComplete) {
				user?.socket.send(
					JSON.stringify({
						message: "Board Complete.",
						percentageComplete,
						currentGameState: user?.currentGameState,
					})
				);

				if (user?.type === "creator") {
					this.joiner?.socket.send(
						JSON.stringify({
							message: "Opponent Board Complete.",
							percentageComplete,
						})
					);
				} else {
					this.creator.socket.send(
						JSON.stringify({
							message: "Opponent Board Complete.",
							percentageComplete,
						})
					);
				}

				return;
			}

			user?.socket.send(
				JSON.stringify({
					message: "Correct Number.",
					percentageComplete,
					currentGameState: user?.currentGameState,
				})
			);

			if (user?.type === "creator") {
				this.joiner?.socket.send(
					JSON.stringify({
						message: "Opponent Correct Number.",
						percentageComplete,
					})
				);
			} else {
				this.creator.socket.send(
					JSON.stringify({
						message: "Opponent Correct Number.",
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
