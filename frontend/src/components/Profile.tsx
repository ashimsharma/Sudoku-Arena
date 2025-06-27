import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import { HiArrowLeft } from "react-icons/hi";

export default function Profile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const user = useSelector((state: any) => state.user).user;

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
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
					<img src={user.avatarUrl} alt="Avatar URL" className="h-15 w-15 object-cover rounded-full" />
				</div>

				<div className="text-center">
					<h2 className="text-2xl font-semibold">{user.name}</h2>
					<p className="text-gray-400">
						Rank:{" "}
						<span className="text-yellow-400 font-medium">#42</span>
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 text-center">
					<div className="group cursor-pointer">
						<p className="text-sm text-gray-400 group-hover:underline">Total Games</p>
						<p className="text-xl font-bold">{user.noOfWins + user.noOfDraws + user.noOfLosses}</p>
					</div>
					<div className="group cursor-pointer">
						<p className="text-sm text-gray-400 group-hover:underline">Friends</p>
						<p className="text-xl font-bold">23</p>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 text-center mt-2">
					<div>
						<p className="text-sm text-gray-400">Wins</p>
						<p className="text-xl font-bold text-green-400">{user.noOfWins}</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Draws</p>
						<p className="text-xl font-bold text-yellow-400">{user.noOfDraws}</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Losses</p>
						<p className="text-xl font-bold text-red-400">{user.noOfLosses}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
