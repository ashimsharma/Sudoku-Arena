import { useDispatch, useSelector } from "react-redux";
import { Keypad, GameBoard, ButtonPallet, TimerPallet, ProgressBar } from "./";
import { useState, createContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../config/socket.config";
import {
	ADD_NUMBER,
	CORRECT_CELL,
	OPPONENT_CORRECT_CELL,
	OPPONENT_WRONG_CELL,
	WRONG_CELL,
} from "../messages/messages";
import { setCurrentGameState, setMeProgress, setOpponentProgress } from "../redux/gameSlice";

type CurrentGameStateData = {
	digit: number | null;
	isOnCorrectPosition: boolean;
	canBeTyped: boolean;
}

interface GameContextType {
	game: (CurrentGameStateData)[];
	selectedCellIndex: any;
	formattedTime: null | string;
	setFormattedTime: any;
	mistakes: number;
	setMistakes: any;
	score: number;
	setScore: any;
	timerEnded: boolean;
	setTimerEnded: any;
	me: any;
	setForceReRender: any;
	forceReRender: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export default function GameBoardScreen() {
	const gameId = useSelector((state: any) => state.game).gameId;

	const [forceReRender, setForceReRender] = useState(false);

	const selectedCellIndex = useRef(-1);
	const [formattedTime, setFormattedTime] = useState<string>("10 : 00");
	const [mistakes, setMistakes] = useState<number>(0);
	const [score, setScore] = useState(0);
	const [timerEnded, setTimerEnded] = useState(false);

	const keyPressed = useRef(false);

	const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
	const type = useSelector((state: any) => state.game).meType;

	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const currentGameState: (CurrentGameStateData)[] = useSelector(
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
				)
				break;
			case WRONG_CELL:
				dispatch(
					setCurrentGameState({
						currentGameState: data.currentGameState
					})
				);
				break;
			case OPPONENT_CORRECT_CELL:
				console.log(data);
				dispatch(
					setOpponentProgress(
						{
							opponentProgress: data.percentageComplete
						}
					)
				)
				break;
			case OPPONENT_WRONG_CELL:
				console.log("Opponent Wrong Cell.");
				break;
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		e.preventDefault();

		if (keyPressed.current) return;

		keyPressed.current = true;

		if(!currentGameState[selectedCellIndex.current].canBeTyped) return;

		const clickedKey = Number(e.key);

		if (Number.isNaN(clickedKey)) return;
		if (clickedKey === 0) return;

		let socket = getSocket();

		socket?.send(
			JSON.stringify({
				type: ADD_NUMBER,
				params: {
					roomId: gameId,
					userId: me.id,
					value: clickedKey,
					index: selectedCellIndex.current,
				},
			})
		);
		setTimeout(() => {
			keyPressed.current = false;
		}, 500);
	};

	useEffect(() => {
		if (
			location.state === null ||
			location.state?.from !== "/game/game-room"
		) {
			navigate("/");
			return;
		}

		let socket: WebSocket | null;

		try {
			socket = getSocket();

			socket.addEventListener("message", handleMessages);
		} catch (error) {
			console.log(error);
		}

		return () => {
			socket?.removeEventListener("message", handleMessages);
		};
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", (e) => handleKeyPress(e));

		return () => {
			window.removeEventListener("keydown", (e) => handleKeyPress(e));
		};
	}, []);

	return (
		<GameContext.Provider
			value={{
				game,
				selectedCellIndex,
				formattedTime,
				setFormattedTime,
				mistakes,
				setMistakes,
				score,
				setScore,
				timerEnded,
				setTimerEnded,
				me,
				setForceReRender,
				forceReRender,
			}}
		>
			<div className="min-h-screen bg-gray-800 text-white">
				<div className="py-6 bg-gray-900 shadow-lg">
					<h1 className="p-4 text-center text-3xl font-bold text-red-500">
						{type === "creator" ? me.name : opponent.name}'s GAME
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
					<div className="row-span-6 flex items-center">
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
