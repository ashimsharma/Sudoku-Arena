import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { GameInfoCard, Loader } from "./";
import { motion } from "framer-motion";

export default function GameInfo() {
	const [searchParams] = useSearchParams();
	const gameId = searchParams.get("gameId");
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [gameData, setGameData] = useState<any>({});
	const [selected, setSelected] = useState("You");

	const user = useSelector((state: any) => state.user).user;

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
			} else {
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${
					import.meta.env.VITE_API_URL
				}/user/get-game?gameId=${gameId}`,
				{
					withCredentials: true,
				}
			);
			if (response) {
				setGameData(response.data.data.game);
				setLoading(false);
			}
		})();
	}, []);

	const back = () => {
		navigate("/profile/all-games");
	};

	return loading ? (
		<Loader />
	) : (
		<div className="min-h-screen p-4 text-white">
			<div className="flex mb-4">
				<motion.button
					className="flex items-center text-white hover:text-indigo-400 transition-colors duration-300"
					onClick={back}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					aria-label="Go back"
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</motion.button>
			</div>
			<div className="flex gap-3 bg-gray-900/90 backdrop-blur-lg p-2 rounded-full w-fit m-auto mb-6 shadow-xl border border-gray-700">
				{["You", "Opponent"].map((value: string, index: number) => (
					<button
						key={index}
						className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							value === selected
								? "bg-indigo-600 text-white shadow-md shadow-indigo-700/50"
								: "bg-gray-800 text-gray-300 hover:bg-gray-700"
						}`}
						onClick={() => setSelected(value)}
					>
						{value}
					</button>
				))}
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="mt-4 text-white"
			>
				{selected === "Opponent" && (
					<GameInfoCard
						gameId={gameId}
						player={gameData.players.find(
							(player: any) => player.user.id !== user.id
						)}
						winner={gameData.winner}
					/>
				)}
				{selected === "You" && (
					<GameInfoCard
						gameId={gameId}
						player={gameData.players.find(
							(player: any) => player.user.id === user.id
						)}
						winner={gameData.winner}
					/>
				)}
			</motion.div>
		</div>
	);
}
