import { useContext } from "react";
import { useSelector } from "react-redux";
import { GameContext } from "./GameBoardScreen";

export default function ProgressBar(){
    const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
    const meProgress = useSelector((state: any) => state.game).meProgress;
	const opponentProgress = useSelector((state: any) => state.game).opponentProgress;
	const opponentMistakes = useSelector((state: any) => state.game).opponentMistakes;
    const {opponentReaction, showOpponentReaction} = useContext(GameContext)!;

    return (
        <div className="p-6 bg-gray-900 flex flex-col items-center justify-center space-y-4 w-full rounded-xl">
            <h1 className="text-3xl font-bold text-left">GAME PROGRESS</h1>
            <div className="w-full bg-slate-800 shadow-2xl p-4 rounded-lg">
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-green-400 transition-all duration-500 ease-out"
                        style={{ width: `${meProgress}%` }}
                    ></div>
                </div>
                <p className="text-green-400">Your Progress: {`${meProgress}%`}</p>
            </div>
            <div className="w-full bg-slate-800 shadow-2xl p-4 rounded-lg relative">
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-yellow-400 transition-all duration-300 ease-out"
                        style={{ width: `${opponentProgress}%` }}
                    ></div>
                </div>
                {showOpponentReaction && <div className="text-3xl left-3/4 absolute animate-drop-reverse">{opponentReaction.emoji}</div>}
                <p className="text-yellow-400">{(opponent.name.length < 5) ? opponent.name : `${opponent.name.split(' ')[0]}`}'s Progress: {`${opponentProgress}%`}</p>
                <p className="text-gray-300 text-sm">Mistakes: {opponentMistakes} / 5</p>
            </div>
        </div>
    )
}