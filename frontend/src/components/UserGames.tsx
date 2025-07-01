import { useEffect, useState } from "react";
import checkAuth from "../utils/authentication";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { HiArrowLeft } from "react-icons/hi";
import GameCard from "./GameCard";

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
    }

	return (
        loading ? <div>Loading...</div> : 
		<div className="min-h-screen p-4 bg-gray-900">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
            <div className="mt-4">
                {games.map((game: any) => {
                    return (
                        <GameCard key={game.game.id} id={game.game.id} options={game.game.options} winner={game.game.winner} draw={game.game.draw} opponent={game.game.players.find((item: any) => item.user.id !== user.id)} createdAt={game.game.createdAt} /> 
                    )
                })}
            </div>
		</div>
	);
}
