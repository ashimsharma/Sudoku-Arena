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
	OPPONENT_BOARD_COMPELTE,
	ALREADY_ON_CORRECT_POSITION,
	CELL_CLEARED,
	OPPONENT_GAME_INITIATED,
	GAME_ENDED,
	GAME_ALREADY_ENDED,
	TIMER_COMPLETE,
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
};

export class Game {
	public gameId?: string;
	private creator: {
		id: string;
		name: string;
		avatarUrl: string;
		type: string;
		socket: WebSocket;
		gameStarted: boolean;
		currentGameState: CurrentGameStateData[];
		mistakes: number;
		correctAdditions: 0;
		percentageComplete: number;
		timeTaken: number;
	};
	private joiner?: {
		id: string;
		name: string;
		avatarUrl: string;
		type: string;
		socket: WebSocket;
		gameStarted: boolean;
		currentGameState: CurrentGameStateData[];
		mistakes: number;
		correctAdditions: number;
		percentageComplete: number;
		timeTaken: number;
	};
	private options: Options;
	private initialGameState: CurrentGameStateData[] = [];
	private solution: number[] = [];
	private gameStarted: boolean = false;
	private emptyCells: number = 0;
	private readonly totalAllowedMistakes: number = 5;
	private startTime: number = 0;
	private timerEnded: boolean = false;
	private gameEnded: boolean = false;
	private readonly gameDuration: number = 600000;

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
			timeTaken: 0,
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
			timeTaken: 0,
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
						canBeTyped: false,
					};
				}
				this.emptyCells += 1;
				return {
					digit: null,
					isOnCorrectPosition: true,
					canBeTyped: true,
				};
			});
			this.solution = sudoku.solution
				.split("")
				.map((data) => parseInt(data));
		}

		if (this.creator.socket === socket) {
			this.creator.currentGameState = this.initialGameState.map(
				(cell) => ({ ...cell })
			);
			const gameCreated = this.initGameInDB(gameId, this.creator.id);
			if (!gameCreated) {
				socket.send(JSON.stringify({ type: GAME_INITIATE_FAILED }));
				return;
			}

			this.creator.gameStarted = true;

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

			this.joiner?.socket.send(
				JSON.stringify({
					type: OPPONENT_GAME_INITIATED,
				})
			);
		} else {
			this.joiner !== undefined &&
				(this.joiner.currentGameState = this.initialGameState.map(
					(cell) => ({ ...cell })
				));

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

			this.creator.socket.send(
				JSON.stringify({
					type: OPPONENT_GAME_INITIATED,
				})
			);
		}

		if (this.gameStarted) {
			this.startTime = Date.now();

			this.creator?.socket.send(
				JSON.stringify({
					type: BOTH_USERS_GAME_INITIATED,
					data: {
						initialGameState: this.initialGameState,
						currentGameState: this.creator.currentGameState,
						startTime: this.startTime,
					},
				})
			);
			this.joiner?.socket.send(
				JSON.stringify({
					type: BOTH_USERS_GAME_INITIATED,
					data: {
						initialGameState: this.initialGameState,
						currentGameState: this.joiner?.currentGameState,
						startTime: this.startTime,
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

			if (!user) {
				return;
			}

			if (user.mistakes === this.totalAllowedMistakes) {
				user.socket.send(
					JSON.stringify({
						type: YOUR_MISTAKES_COMPLETE,
						currentGameState: user?.currentGameState,
						mistakes: user?.mistakes,
					})
				);
				return;
			}

			if (
				user.currentGameState[index].isOnCorrectPosition &&
				!user.currentGameState[index].canBeTyped
			) {
				user.socket.send(
					JSON.stringify({
						type: ALREADY_ON_CORRECT_POSITION,
					})
				);

				return;
			}

			if (!user.currentGameState[index].canBeTyped) {
				return;
			}

			user.currentGameState[index].digit = value;

			if (this.solution[index] !== value) {
				user.mistakes += 1;
				user.currentGameState[index].isOnCorrectPosition = false;
				if (user?.mistakes === this.totalAllowedMistakes) {
					user.socket.send(
						JSON.stringify({
							type: YOUR_MISTAKES_COMPLETE,
							currentGameState: user?.currentGameState,
							mistakes: user?.mistakes,
						})
					);
				} else {
					user?.socket.send(
						JSON.stringify({
							type: WRONG_CELL,
							currentGameState: user?.currentGameState,
							mistakes: user?.mistakes,
						})
					);
				}

				if (
					user?.type === "creator" &&
					user?.mistakes === this.totalAllowedMistakes
				) {
					this.joiner?.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKES_COMPLETE,
							opponentMistakes: this.creator.mistakes,
						})
					);
				} else if (
					user?.type === "joiner" &&
					user?.mistakes === this.totalAllowedMistakes
				) {
					this.creator.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKES_COMPLETE,
							opponentMistakes: this.joiner?.mistakes,
						})
					);
				} else if (
					user?.type === "creator" &&
					user?.mistakes < this.totalAllowedMistakes
				) {
					this.joiner?.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKE,
							mistakes: this.creator?.mistakes,
						})
					);
				} else if (
					user?.type === "joiner" &&
					user?.mistakes < this.totalAllowedMistakes
				) {
					this.creator.socket.send(
						JSON.stringify({
							type: OPPONENT_MISTAKE,
							mistakes: this.joiner?.mistakes,
						})
					);
				}
				return;
			}

			user.correctAdditions += 1;

			user.currentGameState[index].canBeTyped = false;
			user.currentGameState[index].isOnCorrectPosition = true;

			let correctAdditions =
				user !== undefined ? user?.correctAdditions : null;

			let percentageComplete = Math.round(
				((correctAdditions as number) / this.emptyCells) * 100
			);

			user.percentageComplete = percentageComplete;

			const isComplete = this.checkIfBoardComplete(userId);

			if(isComplete){
				this.endGame(userId);
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

	clearValue(userId: string, index: number) {
		const user = userId === this.creator.id ? this.creator : this.joiner;

		if (!user) {
			return;
		}

		if (
			user.currentGameState[index].isOnCorrectPosition &&
			!user.currentGameState[index].canBeTyped
		) {
			user.socket.send(
				JSON.stringify({
					type: ALREADY_ON_CORRECT_POSITION,
				})
			);

			return;
		}

		if (!user.currentGameState[index].digit) {
			return;
		}

		user.currentGameState[index].digit = null;
		user.currentGameState[index].canBeTyped = true;
		user.currentGameState[index].isOnCorrectPosition = true;

		user.socket.send(
			JSON.stringify({
				type: CELL_CLEARED,
				currentGameState: user.currentGameState,
			})
		);
	}

	endGame(userId: string) {
		const user = userId === this.creator.id ? this.creator : this.joiner;

		if (this.gameEnded) {
			user?.socket.send(
				JSON.stringify({
					type: GAME_ALREADY_ENDED,
				})
			);
			return;
		}

		this.gameEnded = true;

		if (!user) {
			return;
		}

		if (!this.joiner) {
			return;
		}

		this.creator.timeTaken = Date.now() - this.startTime;
		this.joiner.timeTaken = Date.now() - this.startTime;

		let opponent = user.type === "creator" ? this.joiner : this.creator;

		user.socket.send(
			JSON.stringify({
				type: GAME_ENDED,
				result: {
					winner: user.type,
					yourPercentageComplete: user.percentageComplete,
					opponentPercentageComplete: opponent.percentageComplete,
					yourMistakes: user.mistakes,
					opponentMistakes: opponent.mistakes,
					yourTimeTaken: user.timeTaken,
					opponentTimeTaken: opponent.timeTaken,
					gameEndReason: BOARD_COMPELTE,
				},
			})
		);

		opponent.socket.send(
			JSON.stringify({
				type: GAME_ENDED,
				result: {
					winner: user.type,
					yourPercentageComplete: user.percentageComplete,
					opponentPercentageComplete: opponent.percentageComplete,
					yourMistakes: user.mistakes,
					opponentMistakes: opponent.mistakes,
					yourTimeTaken: user.timeTaken,
					opponentTimeTaken: opponent.timeTaken,
					gameEndReason: BOARD_COMPELTE,
				},
			})
		);
	}

	endTimer(userId: string) {
		const user = userId === this.creator.id ? this.creator : this.joiner;

		if (this.gameEnded) {
			user?.socket.send(
				JSON.stringify({
					type: GAME_ALREADY_ENDED,
				})
			);
			return;
		}

		this.timerEnded = true;
		this.gameEnded = true;

		if (!user) {
			return;
		}

		if (!this.joiner) {
			return;
		}

		this.creator.timeTaken = this.gameDuration;
		this.joiner.timeTaken = this.gameDuration;

		let winner =
			this.creator.percentageComplete > this.joiner?.percentageComplete
				? "creator"
				: "joiner";

		let opponent = user.type === "creator" ? this.joiner : this.creator;

		user.socket.send(
			JSON.stringify({
				type: GAME_ENDED,
				result: {
					winner: winner,
					yourPercentageComplete: user.percentageComplete,
					opponentPercentageComplete: opponent.percentageComplete,
					yourMistakes: user.mistakes,
					opponentMistakes: opponent.mistakes,
					yourTimeTaken: user.timeTaken,
					opponentTimeTaken: opponent.timeTaken,
					gameEndReason: TIMER_COMPLETE,
				},
			})
		);

		opponent.socket.send(
			JSON.stringify({
				type: GAME_ENDED,
				result: {
					winner: winner,
					yourPercentageComplete: opponent.percentageComplete,
					opponentPercentageComplete: user.percentageComplete,
					yourMistakes: opponent.mistakes,
					opponentMistakes: user.mistakes,
					yourTimeTaken: opponent.timeTaken,
					opponentTimeTaken: user.timeTaken,
					gameEndReason: TIMER_COMPLETE,
				},
			})
		);
	}

	checkIfBoardComplete(userId: string) {
		const user = this.creator.id === userId ? this.creator : this.joiner;

		if (user?.percentageComplete === 100) {
			return true;
		}

		return false;
	}
}
