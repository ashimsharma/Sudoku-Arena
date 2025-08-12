import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";

type Cell = number | null;

const AnimatedSudokuBoard: React.FC = () => {
	const [animationEnded, setAnimationEnded] = useState(false);

	const [board, setBoard] = useState<Cell[]>([
		5,
		3,
		4,
		6,
		7,
		8,
		9,
		1,
		2,
		6,
		7,
		2,
		1,
		9,
		5,
		3,
		4,
		8,
		1,
		9,
		8,
		3,
		4,
		2,
		5,
		6,
		7,
		8,
		5,
		9,
		7,
		6,
		1,
		4,
		2,
		3,
		4,
		2,
		6,
		8,
		null,
		3,
		7,
		9,
		1,
		7,
		1,
		3,
		9,
		2,
		4,
		8,
		5,
		6,
		9,
		6,
		1,
		5,
		3,
		7,
		2,
		8,
		4,
		2,
		8,
		7,
		4,
		1,
		9,
		6,
		3,
		5,
		3,
		4,
		5,
		2,
		8,
		6,
		1,
		7,
		9,
	]);

	const cellsRef = useRef<(HTMLDivElement | null)[]>([]);
	const highlightRowRef = useRef<HTMLDivElement | null>(null);
	const boardRef = useRef<HTMLDivElement | null>(null);

	// Helper to get row and column from index
	const getCellCoords = (index: number) => ({
		row: Math.floor(index / 9),
		col: index % 9,
	});

	const centerIndex = 40;
	const centerCoords = getCellCoords(centerIndex);

	const distanceFromCenter = (index: number) => {
		const { row, col } = getCellCoords(index);
		return (
			Math.abs(row - centerCoords.row) + Math.abs(col - centerCoords.col)
		);
	};

	useEffect(() => {
		const rowsWithOneEmpty = Array.from({ length: 9 }, (_, r) => {
			const rowCells = board.slice(r * 9, r * 9 + 9);
			const emptyCount = rowCells.filter((c) => c === null).length;
			return emptyCount === 1 ? r : null;
		}).filter((r) => r !== null) as number[];

		if (rowsWithOneEmpty.length === 0) return;

		const chosenRow =
			rowsWithOneEmpty[
				Math.floor(Math.random() * rowsWithOneEmpty.length)
			];
		const emptyIndex = board
			.slice(chosenRow * 9, chosenRow * 9 + 9)
			.findIndex((c) => c === null);

		const globalIndex = chosenRow * 9 + emptyIndex;
		const correctDigit = getCorrectDigit(chosenRow, emptyIndex, board);

		if (correctDigit) {
			setTimeout(() => {
				const cellEl = cellsRef.current[globalIndex];
				highlightRowRef.current = document.querySelector(
					`[data-row='${chosenRow}']`
				);

				if (cellEl) {
					gsap.fromTo(
						cellEl,
						{ scale: 0, backgroundColor: "#D1D5DB" },
						{
							scale: 1,
							backgroundColor: "#9CA3AF",
							color: "#22C55E",
							duration: 0.6,
							ease: "elastic.out(1, 0.5)",
							onComplete: () => {
								setBoard((prev) => {
									const newBoard = [...prev];
									newBoard[globalIndex] = correctDigit;
									return newBoard;
								});

								if (
									highlightRowRef.current &&
									boardRef.current
								) {
									const allCells = Array.from(
										boardRef.current.querySelectorAll("div")
									) as HTMLElement[];

									allCells.sort((a, b) => {
										const indexA =
											cellsRef.current.findIndex(
												(el) => el === a
											);
										const indexB =
											cellsRef.current.findIndex(
												(el) => el === b
											);
										return (
											distanceFromCenter(indexA) -
											distanceFromCenter(indexB)
										);
									});

									gsap.to(allCells, {
										backgroundColor: "#d1fae5",
										duration: 0.1,
										stagger: 0.05,
										ease: "power1.inOut",
										onComplete: () => {
											setAnimationEnded(true);
										},
									});
								}
							},
						}
					);
				}
			}, 1000);
		}
	}, []);

	const getCorrectDigit = (
		row: number,
		col: number,
		board: Cell[]
	): number | null => {
		const nums = new Set(Array.from({ length: 9 }, (_, i) => i + 1));

		// Row
		for (let c = 0; c < 9; c++) nums.delete(board[row * 9 + c] || 0);
		// Col
		for (let r = 0; r < 9; r++) nums.delete(board[r * 9 + col] || 0);
		// Block
		const startRow = Math.floor(row / 3) * 3;
		const startCol = Math.floor(col / 3) * 3;
		for (let r = startRow; r < startRow + 3; r++) {
			for (let c = startCol; c < startCol + 3; c++) {
				nums.delete(board[r * 9 + c] || 0);
			}
		}
		return nums.values().next().value || null;
	};

	return (
		<div
			ref={boardRef}
			className="relative inline-block border-4 border-black rounded-lg overflow-hidden"
		>
			{Array.from({ length: 9 }).map((_, row) => (
				<div
					key={row}
					data-row={row}
					className="grid grid-cols-9"
					style={{
						borderBottom:
							row % 3 === 2 && row !== 8 ? "3px solid black" : "",
					}}
				>
					{Array.from({ length: 9 }).map((_, col) => {
						const index = row * 9 + col;
						const value = board[index];
						return (
							<div
								key={col}
								ref={(el: HTMLDivElement | null) => {
									cellsRef.current[index] = el;
								}}
								className={`${
									index === 40 && "!bg-blue-200"
								} w-12 h-12 flex items-center bg-blue-50 text-black justify-center text-xl border border-black ${
									col % 3 === 2 && col !== 8
										? "border-r-4 border-black"
										: ""
								} ${
									[
										4, 13, 22, 30, 31, 32, 36, 37, 38, 39,
										40, 41, 42, 43, 44, 48, 49, 50, 58, 67,
										76,
									].includes(index) && "bg-gray-300"
								}`}
							>
								{value}
							</div>
						);
					})}
				</div>
			))}
			{animationEnded && (
				<motion.div
					className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.7, delay: 0.3 }}
				>
					<motion.h1
						className="text-[70px] font-bold tracking-wide text-red-500 cursor-pointer"
						initial={{ opacity: 0, scale: 2 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.8 }}
						style={{ fontFamily: "'Bebas Neue', sans-serif" }}
					>
						SUDOKU <span className="text-white block">ARENA</span>
					</motion.h1>
					<motion.h1
						className="text-[40px] font-bold tracking-wide text-white cursor-pointer"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 1.4 }}
						style={{ fontFamily: "'Bebas Neue', sans-serif" }}
					>
						CHALLENGE <span className="text-white">ACCEPTED!</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 1.4 }}
						style={{ fontFamily: "'Bebas Neue', sans-serif" }}
					>Compete with millions of users around the world!!</motion.p>
				</motion.div>
			)}
		</div>
	);
};

export default AnimatedSudokuBoard;
