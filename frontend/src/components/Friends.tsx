import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { HiArrowLeft } from "react-icons/hi";
import {motion} from "framer-motion";
import {Loader} from "./";

export default function Friends() {
	const [friends, setFriends] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [friendsChanged, setFriendsChanged] = useState(false);
	const [removeButton, setRemoveButton] = useState("Remove");
	const user = useSelector((state: any) => state.user).user;

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
				`${import.meta.env.VITE_API_URL}/user/get-friends`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setFriends(response.data.data.friends);
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, [friendsChanged]);

	const back = () => {
		navigate("/");
	};

	const removeFriend = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setRemoveButton("Removing...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/remove-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setRemoveButton("Removed");
				setFriendsChanged(!friendsChanged);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return loading ? (
		<Loader />
	) : (
		<div className="p-4  min-h-screen">
			{/* Back Button */}
			<div className="flex mb-6">
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

			{/* Empty State */}
			{friends.length === 0 && (
				<p className="text-sm text-gray-300 min-h-screen flex items-center justify-center">
					Nothing to show here for now.
				</p>
			)}

			{/* Friends List */}
			<div className="space-y-4">
				{friends.length !== 0 &&
					friends.map((friend: any, id: number) => {
						const isRequester = friend.requester.id !== user?.id;
						const avatarUrl = isRequester
							? friend.requester.avatarUrl
							: friend.receiver.avatarUrl;
						const name = isRequester
							? friend.requester.name
							: friend.receiver.name;

						return (
							<motion.div
								key={friend.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: id * 0.05 }}
								className="w-2/3 mx-auto"
							>
								<div
									className="flex items-center justify-between bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-800/80 transition-all cursor-pointer"
									onClick={() =>
										navigate(`/user/profile?userId=${isRequester ? friend.requester.id : friend.receiver.id}`)
									}
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-500 shadow-md flex items-center justify-center text-white text-lg font-bold bg-gray-700">
											{avatarUrl ? (
												<img
													src={avatarUrl}
													alt={name}
													className="w-full h-full object-cover"
												/>
											) : (
												name[0].toUpperCase()
											)}
										</div>
										<span className="text-white font-medium tracking-wide hover:underline">
											{name}
										</span>
									</div>

									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={(e) => removeFriend(e, friend.id)}
										className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-colors"
									>
										{removeButton}
									</motion.button>
								</div>
							</motion.div>
						);
					})}
			</div>
		</div>
	);
}
