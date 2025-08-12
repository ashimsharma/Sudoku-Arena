import { useEffect, useState } from "react";
import checkAuth from "../utils/authentication";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { HiArrowLeft } from "react-icons/hi";
import { GameCard, Loader } from "./";
import { motion } from "framer-motion";

export default function UserGames() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [games, setGames] = useState<any[]>([]);
	const user = useSelector((state: any) => state.user).user;

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
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-all-games`,
				{
					withCredentials: true,
				}
			);
			if (response) {
				setGames(response.data.data.games.games);
				setLoading(false);
			}
		})();
	}, []);

	const back = () => {
		navigate("/profile");
	};

	return loading ? (
		<Loader />
	) : (
		<div className="min-h-screen p-4">
			<div className="flex mb-6">
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
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="mt-4"
			>
				{games.map((game: any) => {
					return (
						<GameCard
							key={game.game.id}
							id={game.game.id}
							options={game.game.options}
							winner={game.game.winner}
							draw={game.game.draw}
							opponent={game.game.players.find(
								(item: any) => item.user.id !== user.id
							)}
							createdAt={game.game.createdAt}
						/>
					);
				})}
			</motion.div>
		</div>
	);
}
