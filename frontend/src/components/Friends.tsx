import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { HiArrowLeft } from "react-icons/hi";

export default function Friends() {
	const [friends, setFriends] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [friendsChanged, setFriendsChanged] = useState(false);
	const [removeButton, setRemoveButton] = useState("Remove");
	const [inviteButton, setInviteButton] = useState("Invite");
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
		<div className="text-white">Loading...</div>
	) : (
		<div className="p-4 bg-gray-900 min-h-screen">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
			<div>
				{friends.length === 0 && (
					<p className="text-sm text-gray-100 min-h-screen flex items-center justify-center">
						Nothing to show here for now.
					</p>
				)}
				{friends.length !== 0 &&
					friends.map((friend: any) => (
						<div
							key={friend.id}
							className="flex items-center justify-between bg-gray-800 p-3 rounded-lg w-2/3 mx-auto hover:bg-gray-700 cursor-pointer"
							onClick={() =>
								navigate(
									`/user/profile?userId=${
										friend.requester.id !== user?.id
											? friend.requester.id
											: friend.receiver.id
									}`
								)
							}
						>
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
									{(
										friend.requester.id !== user?.id
											? friend.requester.avatarUrl
											: friend.receiver.avatarUrl
									) ? (
										<img
											src={
												friend.requester.id !== user?.id
													? friend.requester.avatarUrl
													: friend.receiver.avatarUrl
											}
											alt={
												friend.requester.id !== user?.id
													? friend.requester.name
													: friend.receiver.name
											}
											className="w-10 h-10 rounded-full object-cover"
										/>
									) : friend.requester.id !== user?.id ? (
										friend.requester.name[0].toUpperCase()
									) : (
										friend.receiver.name[0].toUpperCase()
									)}
								</div>
								<span className="text-white font-medium hover:underline">
									{friend.requester.id !== user?.id
										? friend.requester.name
										: friend.receiver.name}
								</span>
							</div>
							<div className="flex space-x-2">
								<button className="bg-red-500 text-white text-md px-3 py-1 rounded hover:bg-red-600" onClick={(e) => removeFriend(e, friend.id)}>
									{removeButton}
								</button>
								<button className="bg-blue-500 text-white text-md px-3 py-1 rounded hover:bg-blue-600">
									{inviteButton}
								</button>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
