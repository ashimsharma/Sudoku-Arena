import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { FaCircleUser } from "react-icons/fa6";
import { motion } from "framer-motion";
import { Loader } from "./";

const Leaderboard = () => {
	const [loading, setLoading] = useState(true);
	const [leaderboard, setLeaderboard] = useState<any[]>([]);
	const [timeRange, setTimeRange] = useState("All Time");
	const [timeRangeIndex, setTimeRangeIndex] = useState(0);

	const timeRanges: string[] = ["allTime", "daily", "weekly", "monthly"];

	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			const response = await checkAuth();
			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
			} else {
				navigate("/login");
			}
		})();
	}, [timeRangeIndex]);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const data = await axios.get(
					`${
						import.meta.env.VITE_API_URL
					}/leaderboard/get-leaderboard?type=${
						timeRanges[timeRangeIndex]
					}`,
					{ withCredentials: true }
				);
				if (data) {
					setLeaderboard(data.data.data.leaderboard);
					setLoading(false);
				}
			} catch (error) {
				console.log(error);
			}
		})();
	}, [timeRangeIndex]);

	const updateTimeRange = (value: string, index: number) => {
		setTimeRange(value);
		setTimeRangeIndex(index);
	};

	// Animation variants for Framer Motion
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.07, delayChildren: 0.2 },
		},
	};

	return loading ? (
		<Loader />
	) : (
		<div className="text-white min-h-screen p-6">
			{/* Time range selector */}
			<div className="flex gap-3 bg-gray-900/90 backdrop-blur-lg p-2 rounded-full w-fit m-auto mb-6 shadow-xl border border-gray-700">
				{["All Time", "Daily", "Weekly", "Monthly"].map(
					(value: string, index: number) => (
						<button
							key={index}
							className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
								value === timeRange
									? "bg-indigo-600 text-white shadow-md shadow-indigo-700/50"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
							onClick={() => updateTimeRange(value, index)}
						>
							{value}
						</button>
					)
				)}
			</div>

			{/* Header */}
			<div className="grid grid-cols-12 bg-gray-800 p-3 rounded-t-xl w-11/12 m-auto shadow-md text-gray-300 text-sm uppercase tracking-wide">
				<div className="col-span-1 flex items-center">#</div>
				<div className="col-span-1 flex items-center justify-center">
					<FaCircleUser size={20} />
				</div>
				<div className="col-span-4">Name</div>
				<div className="col-span-2 text-center">Won</div>
				<div className="col-span-2 text-center">Draw</div>
				<div className="col-span-2 text-center">Lost</div>
			</div>

			{/* Leaderboard items with animation */}
			<motion.div
				className="w-11/12 m-auto"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				{leaderboard.length !== 0 &&
					leaderboard.map((value: any, index: number) => (
						<div
							key={value.id}
							className={`grid grid-cols-12 items-center bg-gray-900/70 hover:bg-gray-800 p-3 cursor-pointer transition-all duration-300 group ${
								index === leaderboard.length - 1
									? "rounded-b-xl"
									: ""
							}`}
							onClick={() =>
								navigate(`/user/profile?userId=${value.id}`)
							}
						>
							{/* Rank */}
							<div className="col-span-1 flex justify-center">
								<p
									className={`w-8 h-8 flex justify-center items-center rounded-full font-bold text-sm ${
										index === 0 && "bg-[#FFD700] text-black"
									} ${
										index === 1 && "bg-[#C0C0C0] text-black"
									} ${
										index === 2 && "bg-[#CD7F32] text-black"
									}`}
								>
									{index + 1}
								</p>
							</div>

							{/* Avatar */}
							<div className="col-span-1 flex justify-center">
								<img
									src={value.avatarUrl}
									alt="User Avatar"
									className="w-10 h-10 rounded-full object-cover border border-gray-700"
								/>
							</div>

							{/* Name */}
							<div className="col-span-4 font-medium text-gray-200 truncate">
								{value.name}
							</div>

							{/* Wins */}
							<div className="col-span-2 text-center">
								<div className="text-green-400 group-hover:hidden">
									{value.wins}
								</div>
								<div className="text-green-400 hidden group-hover:block">
									{Math.round(
										(value.wins / value.total) * 100 * 10
									) / 10}
									%
								</div>
							</div>

							{/* Draws */}
							<div className="col-span-2 text-center">
								<div className="text-yellow-400 group-hover:hidden">
									{value.draws}
								</div>
								<div className="text-yellow-400 hidden group-hover:block">
									{Math.round(
										(value.draws / value.total) * 100 * 10
									) / 10}
									%
								</div>
							</div>

							{/* Losses */}
							<div className="col-span-2 text-center">
								<div className="text-red-400 group-hover:hidden">
									{value.losses}
								</div>
								<div className="text-red-400 hidden group-hover:block">
									{Math.round(
										(value.losses / value.total) * 100 * 10
									) / 10}
									%
								</div>
							</div>
						</div>
					))}
			</motion.div>
		</div>
	);
};

export default Leaderboard;
