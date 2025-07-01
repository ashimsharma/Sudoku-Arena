import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import GameInfoCard from "./GameInfoCard";

export default function GameInfo() {
	const [searchParams] = useSearchParams();
	const gameId = searchParams.get("gameId");
    console.log(searchParams);
    console.log(gameId);
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
		<div>Loading...</div>
	) : (
		<div className="min-h-screen p-4 text-white">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
			<div className="flex gap-2 p-2 bg-gray-900 w-fit m-3 mx-auto rounded-lg">
				{["You", "Opponent"].map((value: string, index: number) => (
					<div
						key={index}
						className={`px-5 py-1 rounded-lg hover:bg-gray-800 cursor-pointer ${
							value === selected ? "bg-gray-800" : "bg-gray-600"
						}`}
						onClick={() => setSelected(value)}
					>
						{value}
					</div>
				))}
			</div>
			<div className="mt-4 text-white">
				{selected === "Opponent" && (
					<GameInfoCard
						player={gameData.players.find((player: any) => player.user.id !== user.id)}
                        winner={gameData.winner}
					/>
				)}
				{selected === "You" && (
					<GameInfoCard
						player={gameData.players.find((player: any) => player.user.id === user.id)}
                        winner={gameData.winner}
					/>
				)}
			</div>
		</div>
	);
}
