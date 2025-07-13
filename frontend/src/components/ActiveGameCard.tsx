import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ActiveGameCard({ activeGame, setActiveGame }: any) {
	const user = useSelector((state: any) => state.user).user;
	const opponent = activeGame.players.find(
		(player: any) => player.user.id !== user.id
	);
	const navigate = useNavigate();
	const exitGame = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/exit-game`, {gameId: activeGame.id, opponentId: opponent.user.id}, {withCredentials: true});

            if(response){
                setActiveGame(undefined);
            }
        } catch (error) {
            console.log(error);
        }
    };
	return (
		<div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md text-white bg-opacity-75">
			<h2 className="text-xl font-semibold mb-4">Active Game Found</h2>
			<div className="flex items-center gap-2 m-2">
                <div>
                    <img src={opponent?.user.avatarUrl} alt={opponent?.user.name} className="rounded-full h-12 w-12" />
                </div>
				<h3 className="text-white">{opponent?.user.name}</h3>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<button
					onClick={() =>
						navigate("/game", {
							state: {
								from: "/",
							},
						})
					}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
				>
					Rejoin
				</button>
				<button
					onClick={exitGame}
					className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-400 transition"
				>
					Exit Game
				</button>
			</div>
		</div>
	);
}
