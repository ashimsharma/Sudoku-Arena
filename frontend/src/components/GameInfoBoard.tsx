export default function GameInfoBoard({ game, initialGameState }: any) {
	const isTopEdge = (i: number) => Math.floor(i / 9) % 3 === 0;
	const isLeftEdge = (i: number) => (i % 9) % 3 === 0;
	const isBottomEdge = (i: number) => Math.floor(i / 9) % 3 === 2;
	const isRightEdge = (i: number) => (i % 9) % 3 === 2;
	return (
		<div className="relative grid grid-cols-9 grid-rows-9 rounded-md w-full bg-blue-50">
			<div className="absolute left-1/2 top-10 -translate-x-1/2"></div>
			{game?.map((cell: any, i: number) => {
				const baseClass =
					"border border-black text-center text-black text-2xl p-2 flex justify-center items-center";
				const cellClasses = [
					baseClass,
					isTopEdge(i) ? "border-t-4" : "",
					isLeftEdge(i) ? "border-l-4" : "",
					isBottomEdge(i) ? "border-b-4" : "",
					isRightEdge(i) ? "border-r-4" : "",
					cell.canBeTyped &&
						!cell.isOnCorrectPosition &&
						"text-red-600",
					!initialGameState[i].digit &&
						cell.isOnCorrectPosition &&
						"text-green-600",
				].join(" ");

				return (
					<div key={i} className={cellClasses}>
						{cell.digit}
					</div>
				);
			})}
		</div>
	);
}
