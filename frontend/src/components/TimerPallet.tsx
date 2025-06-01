import { useContext, useEffect, useRef } from "react";
import { GameContext } from "./GameBoardScreen";

export default function TimerPallet() {
	const timeRef = useRef("10 : 00"); 
	const timerDisplayRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const formatNumber = (num: number) => (num < 10 ? `0${num}` : `${num}`);

		const decrementTime = (time: string) => {
			let [minutes, seconds] = time.split(":").map(Number);

			if (minutes === 0 && seconds === 0) return "00:00";

			if (seconds === 0) {
				minutes = Math.max(0, minutes - 1);
				seconds = 59;
			} else {
				seconds -= 1;
			}

			return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
		};

		const intervalId = setInterval(() => {
			const newTime = decrementTime(timeRef.current);
			timeRef.current = newTime;

			if (timerDisplayRef.current) {
				timerDisplayRef.current.textContent = newTime;
			}

			if (newTime === "00:00") {
				clearInterval(intervalId);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const { mistakes, setMistakes, score, setScore, setTimerEnded } =
		useContext(GameContext)!;

	return (
		<div className="grid grid-cols-3 gap-5 items-center">
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Timer</p>
				<p ref={timerDisplayRef}>10 : 00</p>
			</div>
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Mistakes</p>
				<p>{mistakes} / 5</p>
			</div>
			<div className="p-2 text-xl text-center">
				<p className="text-sm">Score</p>
				<p>{score < 10 ? `0${score}` : `${score}`}</p>
			</div>
		</div>
	);
}
