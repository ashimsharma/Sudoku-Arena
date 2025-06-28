import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { FaCircleUser } from "react-icons/fa6";

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
					{
						withCredentials: true,
					}
				);

				if (data) {
					console.log(data.data.data.leaderboard);
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
	return loading ? (
		<div className="min-h-screen">
			<p>Loading...</p>
		</div>
	) : (
		<div className="text-white min-h-screen p-4">
			<div className="flex gap-2 p-2 bg-gray-900 w-fit m-3 mx-auto rounded-lg">
				{["All Time", "Daily", "Weekly", "Monthly"].map(
					(value: string, index: number) => (
						<div
							key={index}
							className={`px-5 py-1 rounded-lg hover:bg-gray-800 cursor-pointer ${
								value === timeRange
									? "bg-gray-800"
									: "bg-gray-600"
							}`}
							onClick={() => updateTimeRange(value, index)}
						>
							{value}
						</div>
					)
				)}
			</div>

			<div className="grid grid-cols-12 bg-gray-600 p-2 w-3/4 lg:w-full m-auto rounded-t-lg gap-4">
				<div className="col-span-1 flex items-center">#</div>
				<div className="col-span-1 flex items-center justify-center">
					<FaCircleUser size={25} />
				</div>
				<div className="col-span-4">Name</div>
				<div className="col-span-2 flex justify-center">Won</div>
				<div className="col-span-2 flex justify-center">Draw</div>
				<div className="col-span-2 flex justify-center">Lost</div>
			</div>

			{leaderboard.length !== 0 &&
				leaderboard.map((value: any, index: number) => (
					<div
						className={`grid grid-cols-12 bg-gray-600 bg-opacity-25 hover:bg-opacity-50 p-2 w-3/4 lg:w-full m-auto gap-4 group transition-all duration-300 cursor-pointer ${index === (leaderboard.length - 1) && 'rounded-b-lg'}`}
						key={value.id}
					>
						<div className="col-span-1 flex items-center">
							<p className={`p-2 w-8 h-8 flex justify-center items-center rounded-full font-bold text-lg ${index === 0 && 'bg-[#FFD700]'} ${index === 1 && 'bg-[#C0C0C0]'} ${index === 2 && 'bg-[#CD7F32]'}`}>{index + 1}</p>
						</div>
						<div className="col-span-1 flex items-center justify-center">
							<img
								src={value.avatarUrl}
								alt="User Avatar"
								className="w-10 md:w-15 h-10 rounded-full"
							/>
						</div>
						<div className="col-span-4 flex items-center">
							{value.name}
						</div>
						<div className="col-span-2 flex justify-center items-center">
							<div className="text-green-500 group-hover:hidden">
								{value.wins}
							</div>
							<div className="text-green-500 group-hover:block hidden">
								{Math.round(
									(value.wins / value.total) * 100 * 10
								) / 10}
								%
							</div>
						</div>
						<div className="col-span-2 flex justify-center items-center">
							<div className="text-yellow-500 group-hover:hidden">
								{value.draws}
							</div>
							<div className="text-yellow-500 group-hover:block hidden">
								{Math.round(
									(value.draws / value.total) * 100 * 10
								) / 10}
								%
							</div>
						</div>
						<div className="col-span-2 flex justify-center items-center">
							<div className="text-red-500 group-hover:hidden">
								{value.losses}
							</div>
							<div className="text-red-500 group-hover:block hidden">
								{Math.round(
									(value.losses / value.total) * 100 * 10
								) / 10}
								%
							</div>
						</div>
					</div>
				))}
		</div>
	);
};

export default Leaderboard;
