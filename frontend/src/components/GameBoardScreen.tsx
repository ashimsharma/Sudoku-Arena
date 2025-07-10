import { useDispatch, useSelector } from "react-redux";
import {
	Keypad,
	GameBoard,
	ButtonPallet,
	TimerPallet,
	ProgressBar,
	ResultModal,
	ReactionBar,
} from "./";
import { useState, createContext, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { closeSocket, connectSocket, getSocket } from "../config/socket.config";
import {
	ADD_NUMBER,
	ALREADY_ON_CORRECT_POSITION,
	CELL_CLEARED,
	CLEAR_CELL,
	CORRECT_CELL,
	DATA_FETCHED,
	FETCH_DATA,
	GAME_ALREADY_ENDED,
	GAME_ALREADY_STARTED,
	GAME_ENDED,
	GAME_NOT_FOUND,
	GAME_NOT_STARTED,
	OPPONENT_CORRECT_CELL,
	OPPONENT_MISTAKE,
	OPPONENT_MISTAKES_COMPLETE,
	OPPONENT_REACTION,
	WRONG_CELL,
	YOUR_MISTAKES_COMPLETE,
} from "../messages/messages";
import {
	setCurrentGameState,
	setEmojiReactions,
	setGameDuration,
	setGameEndReason,
	setGameId,
	setInitialGameState,
	setMe,
	setMeProgress,
	setMeType,
	setOpponent,
	setOpponentMistakes,
	setOpponentProgress,
	setOpponentTimeTaken,
	setStartTime,
	setTotalMistakes,
	setWinner,
	setYourTimeTaken,
} from "../redux/gameSlice";
import { setUser } from "../redux/userSlice";
import checkAuth from "../utils/authentication";

type CurrentGameStateData = {
	digit: number | null;
	isOnCorrectPosition: boolean;
	canBeTyped: boolean;
};

interface GameContextType {
	game: CurrentGameStateData[];
	selectedCellIndex: any;
	formattedTime: null | string;
	setFormattedTime: any;
	score: number;
	setScore: any;
	timerEnded: boolean;
	setTimerEnded: any;
	me: any;
	setForceReRender: any;
	forceReRender: boolean;
	popupProperties: PopupProperties;
	setPopupProperties: any;
	gameEnded: boolean;
	showOpponentReaction: boolean;
	opponentReaction: any;
}

interface PopupProperties {
	show: boolean;
	isPositiveMessage: boolean;
	message: string;
}

export const GameContext = createContext<GameContextType | null>(null);

export default function GameBoardScreen() {
	const [popupProperties, setPopupProperties] = useState<PopupProperties>({
		show: false,
		isPositiveMessage: false,
		message: "",
	});

	const gameId = useSelector((state: any) => state.game).gameId;

	const [forceReRender, setForceReRender] = useState(false);

	const selectedCellIndex = useRef(-1);
	const [formattedTime, setFormattedTime] = useState<string>("10 : 00");

	const [score, setScore] = useState(0);
	const [timerEnded, setTimerEnded] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);

	const [opponentReaction, setOpponentReaction] = useState();
	const [showOpponentReaction, setShowOpponentReaction] = useState(false);

	const [loading, setLoading] = useState(true);

	const keyPressed = useRef(false);

	const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
	const type = useSelector((state: any) => state.game).meType;

	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const currentGameState: CurrentGameStateData[] = useSelector(
		(state: any) => state.game
	).currentGameState;

	const [game, setGame] = useState(currentGameState);

	useEffect(() => {
		setGame(currentGameState);
	}, [currentGameState]);

	const handleMessages = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		const type = data.type;

		switch (type) {
			case CORRECT_CELL:
				dispatch(
					setCurrentGameState({
						currentGameState: data.currentGameState,
					})
				);
				dispatch(
					setMeProgress({
						meProgress: data.percentageComplete,
					})
				);
				setPopupProperties({
					show: true,
					isPositiveMessage: true,
					message: "Correct Number.",
				});

				setTimeout(() => {
					setPopupProperties({
						show: false,
						isPositiveMessage: false,
						message: "",
					});
				}, 2000);
				break;
			case WRONG_CELL:
				dispatch(
					setCurrentGameState({
						currentGameState: data.currentGameState,
					})
				);
				dispatch(
					setTotalMistakes({
						totalMistakes: data.mistakes,
					})
				);
				setPopupProperties({
					show: true,
					isPositiveMessage: false,
					message: "Wrong Number.",
				});

				setTimeout(() => {
					setPopupProperties({
						show: false,
						isPositiveMessage: false,
						message: "",
					});
				}, 2000);
				break;
			case OPPONENT_CORRECT_CELL:
				dispatch(
					setOpponentProgress({
						opponentProgress: data.percentageComplete,
					})
				);
				break;
			case OPPONENT_MISTAKE:
				dispatch(
					setOpponentMistakes({
						opponentMistakes: data.mistakes,
					})
				);
				break;
			case ALREADY_ON_CORRECT_POSITION:
				setPopupProperties({
					show: true,
					isPositiveMessage: false,
					message: "Already Correctly Filled.",
				});

				setTimeout(() => {
					setPopupProperties({
						show: false,
						isPositiveMessage: false,
						message: "",
					});
				}, 2000);
				break;
			case CELL_CLEARED:
				dispatch(
					setCurrentGameState({
						currentGameState: data.currentGameState,
					})
				);
				break;
			case YOUR_MISTAKES_COMPLETE:
				dispatch(
					setCurrentGameState({
						currentGameState: data.currentGameState,
					})
				);
				dispatch(
					setTotalMistakes({
						totalMistakes: data.mistakes,
					})
				);
				break;
			case OPPONENT_MISTAKES_COMPLETE:
				dispatch(
					setOpponentMistakes({
						opponentMistakes: data.opponentMistakes,
					})
				);
				break;
			case GAME_ENDED:
				dispatch(
					setWinner({
						winner: data.result.winner,
					})
				);
				dispatch(
					setMeProgress({
						meProgress: data.result.yourPercentageComplete,
					})
				);
				dispatch(
					setOpponentProgress({
						opponentProgress:
							data.result.opponentPercentageComplete,
					})
				);
				dispatch(
					setTotalMistakes({
						totalMistakes: data.result.yourMistakes,
					})
				);
				dispatch(
					setOpponentMistakes({
						opponentMistakes: data.result.opponentMistakes,
					})
				);
				dispatch(
					setYourTimeTaken({
						yourTimeTaken: data.result.yourTimeTaken,
					})
				);
				dispatch(
					setOpponentTimeTaken({
						opponentTimeTaken: data.result.opponentTimeTaken,
					})
				);
				dispatch(
					setGameEndReason({
						gameEndReason: data.result.gameEndReason,
					})
				);
				setGameEnded(true);
				break;
			case OPPONENT_REACTION:
				setShowOpponentReaction(true);
				setOpponentReaction(data.reaction);
				setTimeout(() => {
					setShowOpponentReaction(false);
				}, 2000);
				break;
			case DATA_FETCHED:
				dispatch(setGameId({ gameId: data.data.roomId }));
				dispatch(setMeType({ meType: data.data.type }));
				if (data.data.opponent.id) {
					const opponent = {
						id: data.data.opponent.id,
						name: data.data.opponent.name,
						avatarUrl: data.data.opponent.avatarUrl,
					};
					dispatch(setOpponent({ opponent: opponent }));
				}
				dispatch(
					setInitialGameState({
						initialGameState: data.data.initialGameState,
					})
				);
				dispatch(
					setCurrentGameState({
						currentGameState: data.data.currentGameState,
					})
				);
				dispatch(
					setEmojiReactions({
						emojiReactions: data.data.emojiReactions,
					})
				);
				dispatch(setStartTime({ startTime: data.data.startTime }));
				dispatch(
					setGameDuration({ gameDuration: data.data.gameDuration })
				);
				dispatch(setMeProgress({meProgress: data.data.percentageComplete}));
				dispatch(setTotalMistakes({totalMistakes: data.data.mistakes}));
				dispatch(
					setOpponentProgress({
						opponentProgress: data.data.opponent.percentageComplete,
					})
				);
				dispatch(
					setOpponentMistakes({
						opponentMistakes: data.data.opponent.mistakes,
					})
				);
				setLoading(false);
				break;
			case GAME_NOT_STARTED:
				navigate("/game/game-room");
				break;
			case GAME_ALREADY_ENDED:
				localStorage.clear();
				navigate("/game");
				break;
			case GAME_NOT_FOUND:
				localStorage.clear();
				navigate("/game");
				break;
		}
	};

	const shiftCell = (e: KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			if (selectedCellIndex.current === 0) return;
			selectedCellIndex.current = selectedCellIndex.current - 1;
			setForceReRender((prev) => !prev);
		} else if (e.key === "ArrowRight") {
			if (selectedCellIndex.current === 80) return;
			selectedCellIndex.current = selectedCellIndex.current + 1;
			setForceReRender((prev) => !prev);
		} else if (e.key === "ArrowUp") {
			if (selectedCellIndex.current <= 8) return;
			selectedCellIndex.current = selectedCellIndex.current - 9;
			setForceReRender((prev) => !prev);
		} else {
			if (selectedCellIndex.current >= 71) return;
			selectedCellIndex.current = selectedCellIndex.current + 9;
			setForceReRender((prev) => !prev);
		}
	};

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			e.preventDefault();

			if (!keyPressed.current) {
				return;
			}

			if (selectedCellIndex.current === -1) {
				return;
			}

			if (
				["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
					e.key
				)
			) {
				console.log(selectedCellIndex.current);
				shiftCell(e);
				return;
			}

			if (
				![
					"1",
					"2",
					"3",
					"4",
					"5",
					"6",
					"7",
					"8",
					"9",
					"Backspace",
				].includes(e.key)
			) {
				return;
			}

			let socket = getSocket();

			if (!currentGameState[selectedCellIndex.current].canBeTyped) {
				keyPressed.current = false;
				setPopupProperties({
					show: true,
					isPositiveMessage: false,
					message: "Cannot be Typed.",
				});

				setTimeout(() => {
					setPopupProperties({
						show: false,
						isPositiveMessage: false,
						message: "",
					});
				}, 2000);
				return;
			}

			if (e.key === "Backspace") {
				socket?.send(
					JSON.stringify({
						type: CLEAR_CELL,
						params: {
							roomId: gameId,
							userId: me?.id,
							index: selectedCellIndex.current,
						},
					})
				);

				keyPressed.current = false;
				return;
			}

			const clickedKey = Number(e.key);

			if (Number.isNaN(clickedKey)) return;
			if (clickedKey === 0) return;

			socket?.send(
				JSON.stringify({
					type: ADD_NUMBER,
					params: {
						roomId: gameId,
						userId: me?.id,
						value: clickedKey,
						index: selectedCellIndex.current,
					},
				})
			);
			keyPressed.current = false;
		},
		[currentGameState]
	);

	useEffect(() => {
		if(!localStorage.getItem("activeGameId")){
			closeSocket();
			navigate("/");
			return;
		}
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				dispatch(setMe({ me: response.data.data.user }));
			} else {
				closeSocket();
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		if(!localStorage.getItem("activeGameId")){
			closeSocket();
			navigate("/");
			return;
		}
		(async () => {
			let socket: WebSocket | null;

			try {
				socket = getSocket();

				if (!socket || socket.readyState !== WebSocket.OPEN) {
					socket = await connectSocket();
				}

				socket?.addEventListener("message", handleMessages);
			} catch (error) {
				console.log(error);
			}

			return () => {
				socket?.removeEventListener("message", handleMessages);
			};
		})();
	}, []);

	useEffect(() => {
		if(!localStorage.getItem("activeGameId")){
			closeSocket();
			navigate("/");
			return;
		}
		const keydownHandler = () => {
			keyPressed.current = true;
		};

		window.addEventListener("keydown", keydownHandler);
		window.addEventListener("keyup", handleKeyPress);
		return () => {
			window.removeEventListener("keydown", keydownHandler);
			window.addEventListener("keyup", handleKeyPress);
		};
	}, [currentGameState]);

	useEffect(() => {
		if(!localStorage.getItem("activeGameId")){
			closeSocket();
			navigate("/");
			return;
		}
		(async () => {
			if (gameId && type) {
				setLoading(false);
				return;
			}

			let socket = getSocket();

			if (!socket || socket.readyState !== WebSocket.OPEN) {
				socket = await connectSocket();
			}

			socket?.send(
				JSON.stringify({
					type: FETCH_DATA,
					params: {
						page: "game_board_screen",
						roomId: localStorage.getItem("activeGameId"),
					},
				})
			);
		})();
	}, []);

	return loading ? (<div className="text-white">Loading...</div>) : (
		<GameContext.Provider
			value={{
				game,
				selectedCellIndex,
				formattedTime,
				setFormattedTime,
				score,
				setScore,
				timerEnded,
				setTimerEnded,
				me,
				setForceReRender,
				forceReRender,
				popupProperties,
				setPopupProperties,
				gameEnded,
				showOpponentReaction,
				opponentReaction,
			}}
		>
			<div className="min-h-screen bg-gray-800 text-white">
				{gameEnded && <ResultModal />}
				<div className="py-6 bg-gray-900 shadow-lg">
					<h1 className="p-4 text-center text-3xl font-bold text-red-500">
						{type === "creator" ? me?.name : opponent?.name}'s GAME
						ROOM
					</h1>
				</div>
				<div className="grid grid-cols-2 gap-x-10 gap-y-3 auto-rows-auto my-2 w-4/5 mx-auto h-3/5">
					<div className="row-span-2">
						<TimerPallet />
					</div>
					<div className="row-start-3 row-span-8">
						<GameBoard />
					</div>
					<div className="row-start-11 row-span-2">
						<ButtonPallet />
					</div>
					<div className="row-span-6 flex justify-center items-center flex-col gap-4">
						<ReactionBar />
						<ProgressBar />
					</div>
					<div className="col-start-2 row-start-7 row-span-6">
						<Keypad />
					</div>
				</div>
			</div>
		</GameContext.Provider>
	);
}
