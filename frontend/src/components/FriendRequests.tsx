import axios from "axios";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { Loader } from "./";
import { motion, AnimatePresence } from "framer-motion";

export default function FriendRequests() {
	const [friendRequests, setFriendRequests] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [friendRequetsChanged, setFriendRequestsChanged] = useState(false);
	const [acceptButton, setAcceptButton] = useState("Accept");
	const [rejectButton, setRejectButton] = useState("Reject");
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
				`${import.meta.env.VITE_API_URL}/user/get-friend-requests`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setFriendRequests(response.data.data.friendRequests);
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, [friendRequetsChanged]);

	const back = () => {
		if (location?.state?.from) {
			navigate(location.state.from);
		} else {
			navigate("/");
		}
	};

	const rejectFriendRequest = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setRejectButton("Rejecting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/reject-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setRejectButton("Rejected");
				setFriendRequestsChanged(!friendRequetsChanged);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const acceptFriendRequest = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setAcceptButton("Accepting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/accept-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setAcceptButton("Accepted");
				setFriendRequestsChanged(!friendRequetsChanged);
			}
		} catch (error) {
			console.log(error);
		}
	};
	return loading ? (
		<Loader />
	) : (
		<div className="p-4 min-h-screen">
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

			{/* No Requests */}
			{friendRequests.length === 0 && (
				<p className="text-sm text-gray-300 min-h-screen flex items-center justify-center">
					No new friend requests.
				</p>
			)}

			{/* Friend Requests List */}
			<AnimatePresence>
				{friendRequests.length !== 0 &&
					friendRequests.map((request: any, id: number) => (
						<motion.div
							key={request.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: id * 0.05 }}
							className="w-[40%] mx-auto"
							onClick={() =>
								navigate(
									`/user/profile?userId=${request.requester.id}`
								)
							}
						>
							<div className="flex items-center justify-between bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-800/80 transition-all cursor-pointer">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-500 shadow-md flex items-center justify-center text-white text-lg font-bold bg-gray-700">
										{request.requester.avatarUrl ? (
											<img
												src={
													request.requester.avatarUrl
												}
												alt={request.requester.name}
												className="w-full h-full object-cover"
											/>
										) : (
											request.requester.name[0].toUpperCase()
										)}
									</div>
									<span className="text-white font-medium tracking-wide hover:underline">
										{request.requester.name}
									</span>
								</div>
								<div className="flex gap-4">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-colors"
										onClick={(e) =>
											acceptFriendRequest(e, request.id)
										}
									>
										{acceptButton}
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-colors"
										onClick={(e) =>
											rejectFriendRequest(e, request.id)
										}
									>
										{rejectButton}
									</motion.button>
								</div>
							</div>
						</motion.div>
					))}
			</AnimatePresence>
		</div>
	);
}
