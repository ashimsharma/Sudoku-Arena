import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "medium" | "hard" | "expert";

type Options = {
	difficulty: Difficulty;
	gameTime: number;
};

type CreateRoomModalProps = {
	onClose: () => void;
	onCreate: (options: Options) => void;
};

const CreateRoomModal = ({ onClose, onCreate }: CreateRoomModalProps) => {
	const [difficulty, setDifficulty] = useState<Difficulty>("easy");
	const [gameTime, setGameTime] = useState<number>(10);

	const timerOptions = [10, 15, 20, 30];

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-md text-white border border-gray-700"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ type: "spring", stiffness: 200, damping: 20 }}
				>
					<h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent">
						Create Your Room
					</h2>

					<div className="mb-4">
						<label className="block mb-2 text-sm font-medium text-gray-300">
							Difficulty
						</label>
						<select
							value={difficulty}
							onChange={(e) =>
								setDifficulty(e.target.value as Difficulty)
							}
							className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
						>
							{["easy", "medium", "hard", "expert"].map(
								(level) => (
									<option key={level} value={level}>
										{level.charAt(0).toUpperCase() +
											level.slice(1)}
									</option>
								)
							)}
						</select>
					</div>

					<div className="mb-6">
						<label className="block mb-2 text-sm font-medium text-gray-300">
							Game Time
						</label>
						<select
							value={gameTime}
							onChange={(e) =>
								setGameTime(Number(e.target.value))
							}
							className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
						>
							{timerOptions.map((time) => (
								<option key={time} value={time}>
									{time} minutes
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-between gap-3">
						<button
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold"
						>
							Cancel
						</button>
						<button
							onClick={() => onCreate({ difficulty, gameTime })}
							className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 font-semibold"
						>
							Create
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CreateRoomModal;
