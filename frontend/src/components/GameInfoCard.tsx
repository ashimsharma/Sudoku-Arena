import { useNavigate } from "react-router-dom";
import { GameInfoBoard } from "./";
import { IoMdTrophy } from "react-icons/io";

export default function GameInfoCard({ player, winner }: any) {
	const navigate = useNavigate();

	const navigateToUserProfile = (playerId: string) => {
		navigate(`/user/profile?userId=${playerId}`)
	}
	return (
		<div className="bg-gray-700 text-white rounded-xl shadow-md p-6 space-y-4 w-2/5 m-auto md:w-full">
			<div className="flex items-center space-x-4">
				<img
					src={player.user.avatarUrl}
					alt={player.user.name}
					className={`w-16 h-16 rounded-full border-4 object-cover ${winner?.id === player.user.id ? 'border-green-500' : 'border-blue-500'} cursor-pointer`}
					title={player.user.name}
					onClick={() => navigateToUserProfile(player.user.id)}
				/>
				<div>
					<h2 className="text-2xl font-semibold hover:underline cursor-pointer" onClick={() => navigateToUserProfile(player.user.id)}>
						{player.user.name}
					</h2>
					<div className="flex gap-4">
						<p className="text-sm text-gray-300">
							Mistakes:{" "}
							<span className="font-bold">
								{player.gameData.mistakes}
							</span>
						</p>
						<p className="text-sm text-gray-300">
							Percentage Complete:{" "}
							<span className="font-bold">
								{player.gameData.percentageComplete}%
							</span>
						</p>
					</div>
				</div>
                {player.user.id === winner?.id && <div className="flex flex-1 justify-end ml-auto">
                    <IoMdTrophy color="yellow" size={60} />
                </div>}
			</div>

			<div className="mt-4">
				<p className="text-sm text-gray-400 mb-2">Final Board:</p>
				<GameInfoBoard
					game={player.gameData.currentGameState}
					initialGameState={player.gameData.initialGameState}
				/>
			</div>
		</div>
	);
}
