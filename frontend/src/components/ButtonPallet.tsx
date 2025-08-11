import { useSelector } from "react-redux";
import { getSocket } from "../config/socket.config";
import { useContext } from "react";
import { GameContext } from "./GameBoardScreen";
import { CLEAR_CELL } from "../messages/messages";
import { motion } from "framer-motion";
import { FaEraser } from "react-icons/fa6";

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
			<motion.button
				className="bg-red-500 hover:bg-red-600 px-4 py-2 flex items-center justify-center rounded-md text-white text-center w-full"
				onClick={clearCell}
				whileTap={{ scale: 0.95 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				<FaEraser size={25}/>
			</motion.button>
		</div>
	);
}
