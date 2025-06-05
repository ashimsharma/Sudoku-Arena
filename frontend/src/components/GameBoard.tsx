import { useContext, useEffect, useState } from "react";
import { Popup } from "./";
import { GameContext } from "./GameBoardScreen";
import { useSelector } from "react-redux";

type CurrentGameStateData = {
	digit: number | null;
	isOnCorrectPosition: boolean;
	canBeTyped: boolean;
}

const GameBoard = () => {
	const gameId = useSelector((state: any) => state.game).gameId;
	const initialGameState = useSelector((state: any) => state.game).initialGameState;

	const {
		game,
		selectedCellIndex,
		me,
		setForceReRender,
		forceReRender,
		popupProperties
	} = useContext(GameContext)!;

	const isTopEdge = (i: number) => Math.floor(i / 9) % 3 === 0;
	const isLeftEdge = (i: number) => (i % 9) % 3 === 0;
	const isBottomEdge = (i: number) => Math.floor(i / 9) % 3 === 2;
	const isRightEdge = (i: number) => (i % 9) % 3 === 2;

	const isRowSelected = (i: number): boolean => {
		if (selectedCellIndex.current === null) {
			return false;
		}
		const row = Math.floor(i / 9);

		return row === Math.floor(selectedCellIndex.current / 9);
	};

	const isColumnSelected = (i: number): boolean => {
		if (selectedCellIndex.current === null) {
			return false;
		}
		const column = i % 9;

		return column === selectedCellIndex.current % 9;
	};

	const isBlockSelected = (i: number): boolean => {
		if (selectedCellIndex.current === null) {
			return false;
		}
		const row = Math.floor(i / 9);
		const column = i % 9;
		const block = Math.floor(row / 3) * 3 + Math.floor(column / 3);

		const selectedRow = Math.floor(selectedCellIndex.current / 9);
		const selectedColumn = selectedCellIndex.current % 9;
		const selectedBlock =
			Math.floor(selectedRow / 3) * 3 + Math.floor(selectedColumn / 3);

		return block === selectedBlock;
	};
	const isTyped = (i: number) => initialGameState[i] === null;

	const generateCellId = (i: number): string => {
		const row = Math.floor(i / 9);
		const column = i % 9;
		const block =
			Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor(column / 3);
		return `${row}-${column}-${block}`;
	};

	return (
		<div className="relative grid grid-cols-9 grid-rows-9 rounded-md w-full bg-blue-50">
			<div className="absolute left-1/2 top-10 -translate-x-1/2">
				<Popup
					show={popupProperties?.show}
					isPositiveMessage={popupProperties?.isPositiveMessage}
					message={popupProperties?.message}
				/>
			</div>
			{game?.map((cell: CurrentGameStateData, i: number) => {
				const baseClass =
					"border border-black text-center text-black text-2xl p-2 flex justify-center items-center";
				const cellClasses = [
					baseClass,
					isRowSelected(i) ||
					isColumnSelected(i) ||
					isBlockSelected(i)
						? "bg-gray-300"
						: "",
					isRowSelected(i) &&
					isColumnSelected(i) &&
					isBlockSelected(i)
						? "!bg-blue-200"
						: "",
					isTopEdge(i) ? "border-t-4" : "",
					isLeftEdge(i) ? "border-l-4" : "",
					isBottomEdge(i) ? "border-b-4" : "",
					isRightEdge(i) ? "border-r-4" : "",
					(cell.canBeTyped && !cell.isOnCorrectPosition) && "text-red-600",
					(!initialGameState[i].digit && cell.isOnCorrectPosition) && "text-green-600"
				].join(" ");

				return (
					<div
						key={i}
						id={generateCellId(i)}
						className={cellClasses}
						onClick={() => {
							selectedCellIndex.current = i;
							setForceReRender(!forceReRender);
						}}
					>
						{cell.digit}
					</div>
				);
			})}
		</div>
	);
};

export default GameBoard;
