import { useSelector } from "react-redux";
import { getSocket } from "../config/socket.config";
import { useContext } from "react";
import { GameContext } from "./GameBoardScreen";
import { CLEAR_CELL } from "../messages/messages";

export default function ButtonPallet() {
	const currentGameState = useSelector(
		(state: any) => state.game
	).currentGameState;
    const me = useSelector((state: any) => state.game).me;
    const gameId = useSelector((state: any) => state.game).gameId;
    
	const { selectedCellIndex, setPopupProperties } = useContext(GameContext)!;

	const clearCell = () => {
		let socket = getSocket();

		if (!currentGameState[selectedCellIndex.current].canBeTyped) {
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

		socket?.send(
			JSON.stringify({
				type: CLEAR_CELL,
				params: {
					roomId: gameId,
					userId: me.id,
					index: selectedCellIndex.current,
				},
			})
		);
	};

	return (
		<div>
			<button
				className="bg-red-600 px-4 py-2 flex items-center justify-center rounded-md hover:bg-red-800 text-white text-center w-full"
				onClick={clearCell}
			>
				Erase
			</button>
		</div>
	);
}
