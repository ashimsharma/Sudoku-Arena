import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

export default function ActiveGameCard({ activeGame, setActiveGame }: any) {
	const user = useSelector((state: any) => state.user).user;
	const opponent = activeGame.players.find(
		(player: any) => player.user.id !== user.id
	);
	const navigate = useNavigate();

	const exitGame = async () => {
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/exit-game`,
				{ gameId: activeGame.id, opponentId: opponent?.user.id },
				{ withCredentials: true }
			);

			if (response) {
				setActiveGame(undefined);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.25 }}
			className="bg-gray-800/80 rounded-2xl p-6 w-full max-w-md text-white shadow-lg border border-gray-700"
		>
			<h2 className="text-xl font-semibold mb-4 text-center">
				Active Game Found
			</h2>

			{/* Opponent Info */}
			<div className="flex items-center gap-3 mb-6">
				<div className="relative">
					{opponent ? (
						<img
							src={opponent?.user.avatarUrl}
							alt={opponent?.user.name}
							className="rounded-full h-14 w-14 object-cover border-2 border-red-500"
						/>
					) : (
						<FaUserCircle
							className="border-2 border-red-500 rounded-full"
							size={56}
						/>
					)}
					<span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
				</div>
				<div>
					<h3 className="text-lg font-medium">
						{opponent ? opponent?.user.name : "No Opponent Joined"}
					</h3>
					<p className="text-gray-200 text-xs">{!opponent ? "Match Making in Progress" : ""}</p>
				</div>
			</div>

			{/* Buttons */}
			<div className="grid grid-cols-2 gap-3">
				<button
					onClick={() =>
						navigate("/game", {
							state: {
								from: "/",
							},
						})
					}
					className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
				>
					Rejoin
				</button>
				<button
					onClick={exitGame}
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
				>
					Exit Game
				</button>
			</div>
		</motion.div>
	);
}
