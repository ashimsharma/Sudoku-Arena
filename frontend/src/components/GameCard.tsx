import { FaCircleUser } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function GameCard({
	id,
	options,
	opponent,
	draw,
	winner,
	createdAt,
}: any) {
	const user = useSelector((state: any) => state.user).user;
	const formatPrettyDate = (createdAt: string) => {
		const date = new Date(createdAt);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const navigate = useNavigate();

	return (
		<div className="bg-gray-800 text-white rounded-xl shadow-md p-4 flex items-center space-x-6 max-w-4xl mx-auto m-4 hover:bg-gray-700 cursor-pointer" key={id} onClick={() => navigate(`/profile/all-games/game?gameId=${id}`)}>
			<div className="p-2">
				<p className="text-gray-100 text-sm text-center mb-1">Winner</p>

				{winner ? (
					<img
						src={winner?.avatarUrl}
						alt="Winner"
						className="w-16 h-16 rounded-full border-4 border-green-500 object-cover"
					/>
				) : (
					<FaCircleUser className="w-16 h-16" />
				)}
			</div>

			<div className="p-2">
				<p className="text-sm text-center text-gray-100 mb-1">
					Opponent
				</p>
				<img
					src={opponent.user.avatarUrl}
					alt="Opponent"
					className="w-16 h-16 rounded-full object-cover cursor-pointer"
				/>
			</div>

			<div className="flex items-center space-x-4 flex-1">
				<div className="flex items-center space-x-3">
					<div>
						<p className="text-lg font-semibold cursor-pointer hover:underline">
							{opponent.user.name}
						</p>
						<p className="text-sm text-gray-400">
							Difficulty:{" "}
							<span className="text-white">
								{options.difficulty.charAt(0).toUpperCase() +
									options.difficulty.slice(1)}
							</span>
						</p>
						<p className="text-sm text-gray-400">
							Time:{" "}
							<span className="text-white">
								{options.gameTime} minutes
							</span>
						</p>
						<p className="text-sm text-gray-400">
							Played On:{" "}
							<span className="text-white">
                                {formatPrettyDate(createdAt)}
                            </span>
						</p>
					</div>
				</div>
			</div>

			<div>
				<span
					className={`text-sm px-3 py-1 rounded-full font-medium text-white ${
						winner &&
						(winner?.id === user.id ? "bg-green-500" : "bg-red-500")
					} ${draw && "bg-yellow-500"}`}
				>
					{draw === true && "DRAW"}
					{draw !== true && (winner?.id === user.id ? "WON" : "LOST")}
				</span>
			</div>
		</div>
	);
}
