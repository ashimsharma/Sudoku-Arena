import { useSelector } from "react-redux";
import { Keypad, GameBoard } from "./";
import { useState, createContext } from "react";

interface GameContextType {
    game: null | (number | null)[]
    setGame: any
	selectedCellIndex: null | number
	setSelectedCellIndex: any
}

export const GameContext = createContext<GameContextType | null>(null);

export default function GameBoardScreen() {
	const [game, setGame] = useState<null | (number | null)[]>(null);
	const [selectedCellIndex, setSelectedCellIndex] = useState<null | number>(null);

	const currentGameState: (null | number)[] = useSelector(
		(state: any) => state.game
	).currentGameState;

	if(!game){
        setGame(currentGameState);
    }

	return (
		<GameContext.Provider value={{game, setGame, selectedCellIndex, setSelectedCellIndex}}>
			<div className="min-h-screen bg-gray-800 text-white">
				<div className="grid grid-cols-2 gap-10 grid-rows-12 w-4/5 mx-auto my-14 p-4">
					<div className="row-span-2">Time and Mistakes</div>
					<div className="row-start-3 row-span-8">
						<GameBoard />
					</div>
					<div className="row-start-11 row-span-2">Buttons</div>
					<div className="row-span-6">ProgressBar</div>
					<div className="col-start-2 row-start-7 row-span-6">
						<Keypad />
					</div>
				</div>
			</div>
		</GameContext.Provider>
	);
}
