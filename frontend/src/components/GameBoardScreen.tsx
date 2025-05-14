import { useSelector } from "react-redux";
import { Keypad, GameBoard, ButtonPallet, TimerPallet } from "./";
import { useState, createContext } from "react";

interface GameContextType {
	game: null | (number | null)[];
	setGame: any;
	selectedCellIndex: null | number;
	setSelectedCellIndex: any;
	formattedTime: null | string;
	setFormattedTime: any;
	mistakes: number;
	setMistakes: any;
	score: number;
	setScore: any;
}

export const GameContext = createContext<GameContextType | null>(null);

export default function GameBoardScreen() {
	const [game, setGame] = useState<null | (number | null)[]>(null);
	const [selectedCellIndex, setSelectedCellIndex] = useState<null | number>(
		null
	);
	const [formattedTime, setFormattedTime] = useState<null | string>(null);
	const [mistakes, setMistakes] = useState<number>(0);
	const [score, setScore] = useState(0);

	const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
	const type = useSelector((state: any) => state.game).meType;

	const currentGameState: (null | number)[] = useSelector(
		(state: any) => state.game
	).currentGameState;

	if (!game) {
		setGame(currentGameState);
	}

	return (
		<GameContext.Provider
			value={{
				game,
				setGame,
				selectedCellIndex,
				setSelectedCellIndex,
				formattedTime,
				setFormattedTime,
				mistakes,
				setMistakes,
				score,
				setScore,
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
					<div className="row-span-6">ProgressBar</div>
					<div className="col-start-2 row-start-7 row-span-6">
						<Keypad />
					</div>
				</div>
			</div>
		</GameContext.Provider>
	);
}
