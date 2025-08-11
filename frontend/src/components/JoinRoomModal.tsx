import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const JoinRoomModal = ({ onClose, onJoin }: { onClose: () => void; onJoin: (id: string) => void }) => {
	const [roomId, setRoomId] = useState("");

	const handleJoin = () => {
		if (roomId.trim()) {
			onJoin(roomId);
			onClose();
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-white border border-gray-700"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ type: "spring", stiffness: 200, damping: 20 }}
				>
					<h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent">
						Join a Room
					</h2>

					<input
						type="text"
						placeholder="Enter Room ID"
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
						className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none mb-6"
					/>

					<div className="flex justify-between gap-3">
						<button
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold"
						>
							Cancel
						</button>
						<button
							onClick={handleJoin}
							className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 font-semibold"
						>
							Join
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default JoinRoomModal;
