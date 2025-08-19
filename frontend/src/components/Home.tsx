import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { ActiveGameCard, Invites, Loader, AnimatedSudokuBoard } from "./";
import { motion } from "framer-motion";

export default function Home() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();
	const [activeGame, setActiveGame] = useState<any>(undefined);

	useEffect(() => {
		(async () => {
			const response = await checkAuth();
			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/user/get-active-game`,
					{
						withCredentials: true,
					}
				);
				if (response) {
					setActiveGame(response.data.data.game);
				}
			} catch (error) {
				console.log(error);
			}
		})();
	}, []);

	const startGame = () => {
		navigate("/game", { state: { from: "/" } });
	};

	return loading ? (
		<Loader />
	) : (
		<div className="min-h-screen mx-5 text-white my-4 relative overflow-hidden">
			<div className="grid grid-cols-3 md:grid-cols-1 gap-10 min-h-full">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="min-h-full flex justify-center items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700"
				>
					{!activeGame ? (
						<p className="text-gray-300">No Active Game.</p>
					) : (
						<ActiveGameCard
							activeGame={activeGame}
							setActiveGame={setActiveGame}
						/>
					)}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="flex flex-col items-center justify-center gap-6 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 md:row-start-1"
				>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.97 }}
						className="bg-red-500 hover:bg-red-600 flex justify-center items-center rounded px-4 py-2 w-full font-semibold shadow-md"
						onClick={startGame}
					>
						New Game
					</motion.button>
					<div className="flex justify-between gap-8 mt-6 text-gray-400">
						<AnimatedSudokuBoard />
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="min-h-full flex justify-center items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700"
				>
					<Invites />
				</motion.div>
			</div>
		</div>
	);
}
