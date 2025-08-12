import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import { HiArrowLeft } from "react-icons/hi";
import axios from "axios";
import checkAuth from "../utils/authentication";
import { Loader } from "./";
import { motion } from "framer-motion";

export default function Profile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>();
	const location = useLocation();

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
			} else {
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/auth/get-profile`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setProfile(response.data.data.user);
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, []);

	const back = () => {
		if (location?.state?.from) {
			navigate(location.state.from);
		} else {
			navigate("/");
		}
	};

	return loading ? (
		<Loader />
	) : (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900/95 to-black p-4">
			{/* Back Button */}
			<div className="w-full flex justify-start mb-6">
				<motion.button
					className="flex items-center text-white hover:text-indigo-400 transition-colors duration-300"
					onClick={back}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					aria-label="Go back"
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</motion.button>
			</div>

			{/* Profile Card */}
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="max-w-sm mx-auto bg-gray-800/70 backdrop-blur-md text-white rounded-3xl shadow-2xl p-6 space-y-6 border border-gray-700"
			>
				{/* Avatar */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
					className="flex justify-center"
				>
					<img
						src={profile.avatarUrl}
						alt="Avatar"
						className="h-28 w-28 object-cover rounded-full ring-4 ring-indigo-500 shadow-lg"
					/>
				</motion.div>

				{/* Name & Rank */}
				<div className="text-center">
					<h2 className="text-2xl font-semibold tracking-wide">
						{profile.name}
					</h2>
					<p className="text-gray-400 mt-1">
						Rank:{" "}
						{profile.noOfWins +
							profile.noOfDraws +
							profile.noOfLosses !==
						0 ? (
							<span className="text-yellow-400 font-medium">
								{profile.rank}
							</span>
						) : (
							<span className="text-sm">
								No games played or completed.
							</span>
						)}
					</p>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-2 gap-4 text-center">
					<motion.div
						whileHover={{ scale: 1.05 }}
						className="group cursor-pointer bg-gray-900/40 p-3 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all"
						onClick={() => navigate("/profile/all-games")}
					>
						<p className="text-sm text-gray-400 group-hover:text-indigo-400">
							Total Games
						</p>
						<p className="text-xl font-bold">
							{profile.noOfWins +
								profile.noOfDraws +
								profile.noOfLosses}
						</p>
					</motion.div>
					<motion.div
						whileHover={{ scale: 1.05 }}
						className="group cursor-pointer bg-gray-900/40 p-3 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all"
						onClick={() => navigate("/profile/friends")}
					>
						<p className="text-sm text-gray-400 group-hover:text-indigo-400">
							Friends
						</p>
						<p className="text-xl font-bold">
							{profile.totalFriends}
						</p>
					</motion.div>
				</div>

				{/* Detailed Stats */}
				<div className="grid grid-cols-3 gap-4 text-center mt-4">
					<div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700">
						<p className="text-sm text-gray-400">Won</p>
						<p className="text-xl font-bold text-green-400">
							{profile.noOfWins}
						</p>
					</div>
					<div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700">
						<p className="text-sm text-gray-400">Draw</p>
						<p className="text-xl font-bold text-yellow-400">
							{profile.noOfDraws}
						</p>
					</div>
					<div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700">
						<p className="text-sm text-gray-400">Lost</p>
						<p className="text-xl font-bold text-red-400">
							{profile.noOfLosses}
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
