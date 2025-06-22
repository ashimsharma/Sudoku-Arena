import { useRef, useState } from "react";

type Difficulty = "easy" | "medium" | "hard" | "expert";

type Options = {
	difficulty: Difficulty;
  gameTime: number
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
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-white">
				<h2 className="text-xl font-semibold mb-4">Create Room</h2>

				<label className="block mb-2 text-sm font-medium">
					Difficulty
				</label>
				<select
					value={difficulty}
					onChange={(e) =>
						setDifficulty(e.target.value as Difficulty)
					}
					className="w-full p-2 border rounded mb-4 text-black"
				>
					{["easy", "medium", "hard", "expert"].map((level) => (
						<option key={level} value={level}>
							{level.charAt(0).toUpperCase() + level.slice(1)}
						</option>
					))}
				</select>

				<label className="block mb-2 text-sm font-medium">
					Game Time
				</label>
				<select
					value={gameTime}
					onChange={(e) => setGameTime(Number(e.target.value))}
					className="w-full p-2 border rounded mb-4 text-black"
				>
					{timerOptions.map((time) => (
						<option key={time} value={time}>
							{time} minutes
						</option>
					))}
				</select>

				<div className="flex justify-between">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-400 text-black transition"
					>
						Cancel
					</button>
					<button
						onClick={() => onCreate({ difficulty, gameTime })}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
					>
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateRoomModal;
