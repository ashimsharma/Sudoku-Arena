import { useContext } from "react";
import { getSocket } from "../config/socket.config";
import { GameContext } from "./GameBoardScreen";
import { useSelector } from "react-redux";
import { ADD_NUMBER } from "../messages/messages";

export default function Keypad() {
	const { setPopupProperties, selectedCellIndex } = useContext(GameContext)!;
	const currentGameState = useSelector(
		(state: any) => state.game
	).currentGameState;
	const gameId = useSelector((state: any) => state.game).gameId;
	const me = useSelector((state: any) => state.game).me;

	const pressKey = (key: number) => {
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
				type: ADD_NUMBER,
				params: {
					roomId: gameId,
					userId: me.id,
					value: key,
					index: selectedCellIndex.current,
				},
			})
		);
	};

	return (
		<div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
			{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key: number) => {
				return (
					<div
						className="p-2 flex justify-center items-center text-2xl rounded cursor-pointer bg-indigo-600 hover:bg-indigo-800"
						key={key}
						onClick={() => pressKey(key)}
					>
						{key}
					</div>
				);
			})}
		</div>
	);
}
