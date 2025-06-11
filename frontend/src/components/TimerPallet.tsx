import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "./GameBoardScreen";
import { useSelector } from "react-redux";

export default function TimerPallet() {
	const [timeLeft, setTimeLeft] = useState(10 * 60);
	const [endTime, setEndTime] = useState<null | number>(null);

	const totalMistakes: number = useSelector(
		(state: any) => state.game
	).totalMistakes;

	const start = useSelector((state: any) => state.game).startTime;
	
	useEffect(() => {
		const duration = 10 * 60 * 1000; 
		const end = start + duration;
		setEndTime(end);

		const interval = setInterval(() => {
			const now = Date.now();
			const remaining = Math.max(Math.floor((end - now) / 1000), 0);
			setTimeLeft(remaining);

			if (remaining === 0) clearInterval(interval);
		}, 500); // 500ms = smoother accuracy

		return () => clearInterval(interval);
	}, []);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, "0")}:${s
			.toString()
			.padStart(2, "0")}`;
	};

	const { score, setScore, setTimerEnded } = useContext(GameContext)!;

	return (
		<div className="grid grid-cols-3 gap-5 items-center">
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Timer</p>
				<p>{formatTime(timeLeft)}</p>
			</div>
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Mistakes</p>
				<p>{totalMistakes} / 5</p>
			</div>
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Score</p>
				<p>{score < 10 ? `0${score}` : `${score}`}</p>
			</div>
		</div>
	);
}
