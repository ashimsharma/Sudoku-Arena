import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import { HiArrowLeft } from "react-icons/hi";
import axios from "axios";
import checkAuth from "../utils/authentication";

export default function Profile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>();

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({user: response.data.data.user}));
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
					withCredentials: true
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
		navigate("/");
	};

	return loading ? (
		<p className="text-white">Loading...</p>
	) : (
		<div className="min-h-screen bg-gray-900 p-4">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
			<div className="max-w-sm mx-auto bg-gray-800 text-white rounded-2xl shadow-xl p-6 space-y-4">
				<div className="flex justify-center h-44">
					<img src={profile.avatarUrl} alt="Avatar URL" className="h-15 w-15 object-cover rounded-full" />
				</div>

				<div className="text-center">
					<h2 className="text-2xl font-semibold">{profile.name}</h2>
					<p className="text-gray-400">
						Rank:{" "}
						<span className="text-yellow-400 font-medium">{(profile.noOfWins + profile.noOfDraws + profile.noOfLosses !== 0) && profile.rank}</span>
						<span className="text-sm">{(profile.noOfWins + profile.noOfDraws + profile.noOfLosses == 0) && "No games played or completed."}</span>
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 text-center">
					<div className="group cursor-pointer" onClick={() => navigate("/profile/all-games")}>
						<p className="text-sm text-gray-400 group-hover:underline">Total Games</p>
						<p className="text-xl font-bold">{profile.noOfWins + profile.noOfDraws + profile.noOfLosses}</p>
					</div>
					<div className="group cursor-pointer" onClick={() => navigate("/profile/friends")}>
						<p className="text-sm text-gray-400 group-hover:underline">Friends</p>
						<p className="text-xl font-bold">{profile.totalFriends}</p>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 text-center mt-2">
					<div>
						<p className="text-sm text-gray-400">Won</p>
						<p className="text-xl font-bold text-green-400">{profile.noOfWins}</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Draw</p>
						<p className="text-xl font-bold text-yellow-400">{profile.noOfDraws}</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Lost</p>
						<p className="text-xl font-bold text-red-400">{profile.noOfLosses}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
