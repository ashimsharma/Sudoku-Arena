import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { FaCircleUser } from "react-icons/fa6";
import axios from "axios";
import ActiveGameCard from "./ActiveGameCard";

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
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/get-active-game`, {
					withCredentials: true
				});
	
				if (response) {
					console.log(response);
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
		<p className="text-white">Loading... </p>
	) : (
		<div className="min-h-screen mx-5 text-white my-4">
			<div className="grid grid-cols-3 gap-10 min-h-full">
				<div className="rounded-md min-h-full flex justify-center items-center">
					{!activeGame ? <p>No Active Game.</p> : <ActiveGameCard activeGame={activeGame} setActiveGame={setActiveGame}/>}
				</div>
				<div className="flex flex-col items-center justify-center">
					<button
						className="bg-red-500 hover:bg-red-600 flex justify-center items-center rounded px-4 p-2 w-full"
						onClick={startGame}
					>
						New Game
					</button>
					<div className="mt-10">
						<div className="flex justify-between">
							<FaCircleUser/>
							<FaCircleUser/>
						</div>
					</div>
				</div>
				<div className="rounded-md min-h-full flex justify-center items-center">
					No new Invites
				</div>
			</div>
		</div>
	);
}
