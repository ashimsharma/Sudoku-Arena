import { useContext } from "react";
import { GameContext } from "./GameBoardScreen";

export default function TimerPallet() {
    const {formattedTime, setFormattedTime, mistakes, setMistakes, score, setScore} = useContext(GameContext)!;

	return (
		<div className="grid grid-cols-3 gap-5 items-center">
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Timer</p>
				<p>{formattedTime ?? '00 : 00'}</p>
			</div>
			<div className="p-2 text-xl text-center">
                <p className="text-sm">Mistakes</p>
                <p>{mistakes} / 5</p>
            </div>
			<div className="p-2 text-xl text-center">
                <p className="text-sm">Score</p>
                <p>{(score < 10) ? `0${score}`: `${score}`}</p>
            </div>
		</div>
	);
}
