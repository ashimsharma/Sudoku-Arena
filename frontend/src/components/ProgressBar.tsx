import { useContext} from "react";
import { useSelector } from "react-redux";
import { GameContext } from "./GameBoardScreen";
import {animate, motion} from "framer-motion";

export default function ProgressBar() {
	const { me, opponent, meProgress, opponentProgress, opponentMistakes } = useSelector(
		(state: any) => state.game
	);
	const { opponentReaction, showOpponentReaction } = useContext(GameContext)!;


	return (
		<div className="p-6 bg-gray-900 rounded-2xl shadow-xl flex flex-col items-center w-full space-y-6">
			<h1 className="text-2xl font-bold text-white tracking-wide">Game Progress</h1>

			{/* Your Progress */}
			<div className="w-full bg-gray-800 rounded-xl shadow-lg p-5 space-y-3">
				<div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
					<div
						className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500"
						style={{ width: `${meProgress}%` }}
					/>
				</div>
				<p className="text-green-400 font-medium">
					Your Progress: <span className="text-white">{meProgress}%</span>
				</p>
			</div>

			{/* Opponent Progress */}
			<div className="w-full bg-gray-800 rounded-xl shadow-lg p-5 space-y-3 relative">
				<div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
					<div
						className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
						style={{ width: `${opponentProgress}%` }}
					/>
				</div>

				{/* Opponent Reaction */}
				{showOpponentReaction && (
					<motion.div
						initial={{y: 0}}
						animate={{y: -100}}
						transition={{duration: 0.3, delay: 0.5}}
						className="absolute text-3xl top-[-0.3rem] right-4"
					>
						{opponentReaction.emoji}
					</motion.div>
				)}

				<p className="text-yellow-400 font-medium">
					{opponent?.name.length < 5
						? opponent?.name
						: opponent?.name.split(" ")[0]}
					&apos;s Progress: <span className="text-white">{opponentProgress}%</span>
				</p>
				<p className="text-gray-400 text-sm">
					Mistakes:{" "}
					<span className="text-red-400 font-semibold">{opponentMistakes}</span> / 5
				</p>
			</div>
		</div>
	);
}
