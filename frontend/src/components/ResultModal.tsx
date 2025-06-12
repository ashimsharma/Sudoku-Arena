import { FaCrown } from "react-icons/fa6";
import { useSelector } from "react-redux";

function ResultModal() {
	const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
	const meMistakes = useSelector((state: any) => state.game).totalMistakes;
	const opponentMistakes = useSelector(
		(state: any) => state.game
	).opponentMistakes;
	const meProgress = useSelector((state: any) => state.game).meProgress;
	const opponentProgress = useSelector(
		(state: any) => state.game
	).opponentProgress;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
			<div className="bg-gray-800 rounded-2xl p-4 shadow-2xl text-center max-w-sm w-full border border-gray-700">
				<div className="flex justify-center items-center gap-4">
					<div className="flex justify-center items-center flex-col mb-4">
						<div className="flex justify-center items-center">
							<FaCrown className="text-yellow-400 text-7xl drop-shadow animate-crown-drop" />
						</div>
						<div className="">
							<img
								src={me.avatarUrl}
								alt="Winner Avatar"
								className="w-24 h-24 rounded-full"
							/>
						</div>
						<div className="w-full bg-gray-800 p-4 rounded-lg">
							<div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
								<div
									className="h-full bg-green-400 transition-all duration-500 ease-out"
									style={{ width: `${meProgress}%` }}
								></div>
							</div>
							<p className="text-green-400">
								Progress: {`${meProgress}%`}
							</p>
							<div className="flex gap-4 justify-center items-center mt-1">
								<p className="text-gray-300 text-sm">
									<p>Mistakes</p>
									<p>{meMistakes} / 5</p>
								</p>
								<p className="bg-gray-400 w-[2px] h-5"></p>
								<p className="text-gray-300 text-sm">
									<p>Time</p>
									<p>ABC</p>
								</p>
							</div>
						</div>
					</div>
					<div className="flex justify-center items-center text-2xl">VS</div>
					<div className="flex justify-center items-center flex-col mb-4">
						<div className="flex justify-center items-center">
							<FaCrown className="text-yellow-400 text-7xl drop-shadow invisible" />
						</div>
						<div className="">
							<img
								src={opponent.avatarUrl}
								alt="Non-Winner Avatar"
								className="w-24 h-24 rounded-full"
							/>
						</div>
						<div className="w-full bg-gray-800 p-4 rounded-lg">
							<div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
								<div
									className="h-full bg-yellow-400 transition-all duration-300 ease-out"
									style={{ width: `${opponentProgress}%` }}
								></div>
							</div>
							<p className="text-yellow-400">
								Progress: {`${opponentProgress}%`}
							</p>
							<div className="flex gap-4 justify-center items-center mt-1">
								<p className="text-gray-300 text-sm">
									<p>Mistakes</p>
									<p>{opponentMistakes} / 5</p>
								</p>
								<p className="bg-gray-400 w-[2px] h-8"></p>
								<p className="text-gray-300 text-sm">
									<p>Time</p>
									<p>ABC</p>
								</p>
							</div>
						</div>
					</div>
				</div>
        <h1 className="text-3xl font-bold text-white mb-6 animate-pulse">
					You Win!
				</h1>
				<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-lg transition duration-200">
					Continue
				</button>
			</div>
		</div>
	);
}

export default ResultModal;
